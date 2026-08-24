import { pool } from '../config/database.js'

export const initializeReviewTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      title VARCHAR(160),
      body TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, product_id)
    )
  `)
}

export const getProductReviews = async (productId) => {
  const { rows } = await pool.query(`
    SELECT r.id, r.rating, r.title, r.body, r.created_at AS "createdAt",
           u.full_name AS "reviewerName"
    FROM reviews r JOIN users u ON u.id = r.user_id
    WHERE r.product_id = $1 ORDER BY r.created_at DESC`, [productId])
  return rows
}

export const createReview = async (userId, productId, { rating, title, body }) => {
  const { rows } = await pool.query(`
    INSERT INTO reviews (user_id, product_id, rating, title, body)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, rating, title, body, created_at AS "createdAt"`,
  [userId, productId, rating, title || null, body.trim()])
  return rows[0]
}