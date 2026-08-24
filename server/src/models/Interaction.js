import { pool } from '../config/database.js'

export const initializeInteractionTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_product_interactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      interaction_type VARCHAR(30) NOT NULL CHECK (interaction_type IN ('viewed', 'searched', 'clicked', 'wishlist', 'cart', 'purchased')),
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

export const recordInteraction = async (userId, productId, interactionType, metadata = {}) => {
  await pool.query(`INSERT INTO user_product_interactions (user_id, product_id, interaction_type, metadata) VALUES ($1, $2, $3, $4)`, [userId || null, productId, interactionType, metadata])
}

export const getRecentInteractionProductIds = async (userId, type = 'viewed', limit = 20) => {
  const { rows } = await pool.query(
    `SELECT product_id FROM user_product_interactions WHERE user_id = $1 AND interaction_type = $2 ORDER BY created_at DESC LIMIT $3`,
    [userId, type, limit]
  )
  return rows.map((row) => row.product_id)
}