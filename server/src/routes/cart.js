import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { addToCart, getCart, removeFromCart, updateCartItem } from '../models/Cart.js'

const router = express.Router()
router.use(authMiddleware)

router.get('/', async (req, res, next) => {
  try { res.json({ success: true, data: await getCart(req.user.userId) }) } catch (error) { next(error) }
})

router.post('/', async (req, res, next) => {
  try {
    const productId = Number(req.body.productId)
    const quantity = Number(req.body.quantity || 1)
    if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ success: false, message: 'Product and a positive quantity are required' })
    const item = await addToCart(req.user.userId, productId, quantity)
    if (!item) return res.status(409).json({ success: false, message: 'Product is unavailable or stock is too low' })
    res.status(201).json({ success: true, data: item })
  } catch (error) { next(error) }
})

router.put('/:productId', async (req, res, next) => {
  try {
    const quantity = Number(req.body.quantity)
    if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' })
    const item = await updateCartItem(req.user.userId, Number(req.params.productId), quantity)
    if (!item) return res.status(409).json({ success: false, message: 'Quantity exceeds available stock or item is missing' })
    res.json({ success: true, data: item })
  } catch (error) { next(error) }
})

router.delete('/:productId', async (req, res, next) => {
  try { await removeFromCart(req.user.userId, Number(req.params.productId)); res.json({ success: true }) } catch (error) { next(error) }
})

export default router