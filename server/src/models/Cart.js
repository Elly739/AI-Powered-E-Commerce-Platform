import { pool } from '../config/database.js'

export const initializeCartTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, product_id)
    )
  `)
}

export const getCart = async (userId) => {
  const { rows } = await pool.query(`
    SELECT c.product_id AS "productId", c.quantity, p.name, p.price,
           p.stock_quantity AS "stockQuantity", (c.quantity * p.price) AS subtotal
    FROM cart_items c
    JOIN products p ON p.id = c.product_id
    WHERE c.user_id = $1
    ORDER BY c.created_at DESC
  `, [userId])
  return rows
}

export const addToCart = async (userId, productId, quantity) => {
  const { rows } = await pool.query(`
    INSERT INTO cart_items (user_id, product_id, quantity)
    SELECT $1, p.id, $3 FROM products p
    WHERE p.id = $2 AND p.is_active = true AND p.stock_quantity >= $3
    ON CONFLICT (user_id, product_id) DO UPDATE
      SET quantity = cart_items.quantity + EXCLUDED.quantity,
          updated_at = CURRENT_TIMESTAMP
    RETURNING product_id AS "productId", quantity
  `, [userId, productId, quantity])
  return rows[0]
}

export const updateCartItem = async (userId, productId, quantity) => {
  const { rows } = await pool.query(`
    UPDATE cart_items c SET quantity = $3, updated_at = CURRENT_TIMESTAMP
    FROM products p
    WHERE c.user_id = $1 AND c.product_id = $2 AND p.id = c.product_id
      AND p.stock_quantity >= $3
    RETURNING c.product_id AS "productId", c.quantity
  `, [userId, productId, quantity])
  return rows[0]
}

export const removeFromCart = async (userId, productId) => {
  await pool.query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [userId, productId])
}