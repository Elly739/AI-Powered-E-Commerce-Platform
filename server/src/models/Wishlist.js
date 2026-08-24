import { pool } from '../config/database.js'

export const initializeWishlistTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, product_id)
    )
  `)
}

export const getWishlist = async (userId) => {
  const { rows } = await pool.query(`
    SELECT p.id, p.name, p.description, p.price, p.stock_quantity AS "stockQuantity",
           c.name AS "categoryName", w.created_at AS "savedAt"
    FROM wishlist_items w
    JOIN products p ON p.id = w.product_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE w.user_id = $1 AND p.is_active = true
    ORDER BY w.created_at DESC
  `, [userId])
  return rows
}

export const saveToWishlist = async (userId, productId) => {
  const { rows } = await pool.query(`
    INSERT INTO wishlist_items (user_id, product_id)
    SELECT $1, id FROM products WHERE id = $2 AND is_active = true
    ON CONFLICT (user_id, product_id) DO NOTHING
    RETURNING product_id AS "productId"
  `, [userId, productId])
  return rows[0] || { productId }
}

export const removeFromWishlist = async (userId, productId) => {
  await pool.query('DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2', [userId, productId])
}