import { pool } from '../config/database.js'

export const initializeProductTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) UNIQUE NOT NULL,
      slug VARCHAR(140) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      name VARCHAR(180) NOT NULL,
      slug VARCHAR(200) UNIQUE NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
      stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS product_images (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      image_url VARCHAR(500) NOT NULL,
      alt_text VARCHAR(180),
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `)

  await pool.query(`
    INSERT INTO categories (name, slug) VALUES
      ('Daily rituals', 'daily-rituals'), ('Home objects', 'home-objects'), ('Wearables', 'wearables')
    ON CONFLICT (slug) DO NOTHING
  `)

  await pool.query(`
    INSERT INTO products (category_id, name, slug, description, price, stock_quantity)
    SELECT c.id, product.name, product.slug, product.description, product.price, product.stock_quantity
    FROM (VALUES
      ('Daily rituals', 'The Morning Mug', 'the-morning-mug', 'A generous stoneware mug for slow starts and strong coffee.', 28.00, 24),
      ('Home objects', 'Folded Desk Lamp', 'folded-desk-lamp', 'Warm, directional light for the corner where good ideas happen.', 96.00, 12),
      ('Wearables', 'Everyday Canvas Tote', 'everyday-canvas-tote', 'A sturdy carryall with room for the things that follow you around.', 42.00, 31),
      ('Daily rituals', 'Cedar Hand Soap', 'cedar-hand-soap', 'A grounding, low-foam wash scented with cedar and green citrus.', 18.00, 40),
      ('Home objects', 'Quiet Hour Candle', 'quiet-hour-candle', 'A clean burn with notes of hinoki, moss, and a little stillness.', 32.00, 18),
      ('Wearables', 'Soft Utility Cap', 'soft-utility-cap', 'An unstructured cotton cap for sunny walks and unplanned afternoons.', 36.00, 16)
    ) AS product(category_name, name, slug, description, price, stock_quantity)
    JOIN categories c ON c.name = product.category_name
    ON CONFLICT (slug) DO NOTHING
  `)
}

export const listProducts = async ({ category, search, limit = 24, offset = 0 }) => {
  const values = []
  const filters = ['p.is_active = true']
  if (category) {
    values.push(category)
    filters.push(`c.slug = $${values.length}`)
  }
  if (search) {
    values.push(`%${search}%`)
    filters.push(`(p.name ILIKE $${values.length} OR p.description ILIKE $${values.length})`)
  }
  values.push(Math.min(Number(limit) || 24, 100), Math.max(Number(offset) || 0, 0))
  const { rows } = await pool.query(
    `SELECT p.id, p.name, p.slug, p.description, p.price, p.stock_quantity AS "stockQuantity",
            c.name AS "categoryName", c.slug AS "categorySlug",
            COALESCE(json_agg(json_build_object('url', i.image_url, 'alt', i.alt_text) ORDER BY i.sort_order)
              FILTER (WHERE i.id IS NOT NULL), '[]') AS images
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN product_images i ON i.product_id = p.id
     WHERE ${filters.join(' AND ')}
     GROUP BY p.id, c.name, c.slug
     ORDER BY p.created_at DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  )
  return rows
}

export const findProductById = async (id) => {
  const { rows } = await pool.query(
    `SELECT p.id, p.name, p.slug, p.description, p.price, p.stock_quantity AS "stockQuantity",
            c.name AS "categoryName", c.slug AS "categorySlug",
            COALESCE(json_agg(json_build_object('url', i.image_url, 'alt', i.alt_text) ORDER BY i.sort_order)
              FILTER (WHERE i.id IS NOT NULL), '[]') AS images
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN product_images i ON i.product_id = p.id
     WHERE p.id = $1 AND p.is_active = true
     GROUP BY p.id, c.name, c.slug`,
    [id]
  )
  return rows[0]
}

export const createProduct = async ({ name, slug, description = '', price, stockQuantity, categoryId = null }) => {
  const { rows } = await pool.query(`INSERT INTO products (name, slug, description, price, stock_quantity, category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, slug, description, price, stock_quantity AS "stockQuantity", category_id AS "categoryId"`, [name, slug, description, price, stockQuantity, categoryId])
  return rows[0]
}

export const updateProduct = async (id, fields) => {
  const { rows } = await pool.query(`UPDATE products SET name = COALESCE($2, name), description = COALESCE($3, description), price = COALESCE($4, price), stock_quantity = COALESCE($5, stock_quantity), category_id = COALESCE($6, category_id), updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, slug, description, price, stock_quantity AS "stockQuantity", category_id AS "categoryId"`, [id, fields.name, fields.description, fields.price, fields.stockQuantity, fields.categoryId])
  return rows[0]
}

export const deactivateProduct = async (id) => {
  const { rows } = await pool.query('UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id', [id])
  return rows[0]
}