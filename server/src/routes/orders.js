import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { createOrderFromCart, getOrders } from '../models/Order.js'

const router = express.Router()
router.use(authMiddleware)

router.get('/', async (req, res, next) => {
  try { res.json({ success: true, data: await getOrders(req.user.userId) }) } catch (error) { next(error) }
})

router.post('/', async (req, res, next) => {
  try {
    const order = await createOrderFromCart(req.user.userId)
    if (order.error) return res.status(409).json({ success: false, message: order.error })
    res.status(201).json({ success: true, data: order })
  } catch (error) { next(error) }
})

export default router