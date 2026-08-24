import { pool } from '../config/database.js'

export const createUser = async ({ email, passwordHash, fullName, phone = null, role = 'customer' }) => {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, phone, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, full_name, phone, role, created_at`,
    [email, passwordHash, fullName, phone, role]
  )
  return rows[0]
}

export const promoteDesignatedAdmin = async () => {
  await pool.query('UPDATE users SET role = $1 WHERE LOWER(email) = LOWER($2)', ['admin', process.env.ADMIN_EMAIL || 'iamellyokello@gmail.com'])
}

export const findUserByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  return rows[0]
}

export const findUserById = async (id) => {
  const { rows } = await pool.query(
    'SELECT id, email, full_name, phone, role, is_active, created_at FROM users WHERE id = $1',
    [id]
  )
  return rows[0]
}

export const initializeUsersTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      role VARCHAR(50) DEFAULT 'customer',
      is_active BOOLEAN DEFAULT true,
      email_verified BOOLEAN DEFAULT false,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
  await promoteDesignatedAdmin()
}