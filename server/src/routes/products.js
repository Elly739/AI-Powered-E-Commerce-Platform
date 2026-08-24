import express from 'express'
import { adminMiddleware, authMiddleware } from '../middleware/auth.js'
import { createProduct, deactivateProduct, findProductById, listProducts, updateProduct } from '../models/Product.js'

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

router.post('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { name, slug, description, price, stockQuantity, categoryId } = req.body
    if (!name || !slug || Number(price) < 0 || Number(stockQuantity) < 0) return res.status(400).json({ success: false, message: 'Name, slug, price, and stock quantity are required' })
    res.status(201).json({ success: true, data: await createProduct({ name, slug, description, price, stockQuantity, categoryId }) })
  } catch (error) { next(error) }
})

router.put('/:id', authMiddleware, adminMiddleware, async (req, res, next) => { try { const product = await updateProduct(Number(req.params.id), req.body); if (!product) return res.status(404).json({ success: false, message: 'Product not found' }); res.json({ success: true, data: product }) } catch (error) { next(error) } })
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res, next) => { try { const product = await deactivateProduct(Number(req.params.id)); if (!product) return res.status(404).json({ success: false, message: 'Product not found' }); res.json({ success: true, data: product }) } catch (error) { next(error) } })

export default router