import { pool } from '../config/database.js'

export const initializeOrderTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(30) NOT NULL DEFAULT 'placed',
      total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0)
    );
  `)
}

export const createOrderFromCart = async (userId) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows: items } = await client.query(`
      SELECT c.product_id, c.quantity, p.price, p.stock_quantity
      FROM cart_items c JOIN products p ON p.id = c.product_id
      WHERE c.user_id = $1 FOR UPDATE`, [userId])
    if (!items.length) return await rollback(client, 'Cart is empty')
    if (items.some((item) => item.quantity > item.stock_quantity)) return await rollback(client, 'One or more items no longer have enough stock')

    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
    const { rows: orders } = await client.query('INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING id, status, total, created_at', [userId, total])
    for (const item of items) {
      await client.query('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)', [orders[0].id, item.product_id, item.quantity, item.price])
      await client.query('UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2', [item.quantity, item.product_id])
    }
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId])
    await client.query('COMMIT')
    return orders[0]
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally { client.release() }
}

const rollback = async (client, message) => {
  await client.query('ROLLBACK')
  return { error: message }
}

export const getOrders = async (userId) => {
  const { rows } = await pool.query('SELECT id, status, total, created_at AS "createdAt" FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId])
  return rows
}