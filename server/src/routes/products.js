import express from 'express'
import { adminMiddleware, authMiddleware } from '../middleware/auth.js'
import { findProductById, listProducts } from '../models/Product.js'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const products = await listProducts(req.query)
    res.json({ success: true, data: products })
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const product = await findProductById(Number(req.params.id))
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    res.json({ success: true, data: product })
  } catch (error) {
    next(error)
  }
})

router.post('/', authMiddleware, adminMiddleware, (req, res) => {
  res.status(501).json({ success: false, message: 'Product creation is queued for the admin catalog screen' })
})

export default router