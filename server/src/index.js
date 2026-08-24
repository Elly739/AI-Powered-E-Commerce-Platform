import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { authRoutes, cartRoutes, productRoutes, wishlistRoutes } from './routes/index.js'
import { initializeUsersTable } from './models/User.js'
import { initializeProductTables } from './models/Product.js'
import { initializeCartTable } from './models/Cart.js'
import { initializeWishlistTable } from './models/Wishlist.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API Routes (will be added in Phase 2)
app.use('/api/auth', authRoutes)

app.use('/api/products', productRoutes)

app.use('/api/cart', cartRoutes)
app.use('/api/wishlist', wishlistRoutes)

app.use('/api/orders', (req, res) => {
  res.json({ message: 'Order routes - Phase 5' })
})

app.use('/api/chat', (req, res) => {
  res.json({ message: 'Chat routes - Phase 8' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 API Documentation: http://localhost:${PORT}/api/docs`)
  console.log(`💚 Health Check: http://localhost:${PORT}/health`)
  try {
    await initializeUsersTable()
    console.log('✅ Users table ready')
    await initializeProductTables()
    console.log('✅ Product catalog ready')
    await initializeCartTable()
    console.log('✅ Cart table ready')
    await initializeWishlistTable()
    console.log('✅ Wishlist table ready')
  } catch (error) {
    console.error('⚠️ Users table unavailable:', error.message)
  }
})

export default app
