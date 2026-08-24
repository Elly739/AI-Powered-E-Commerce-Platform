import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { createReview, getProductReviews } from '../models/Review.js'

const router = express.Router()
router.get('/:productId', async (req, res, next) => { try { res.json({ success: true, data: await getProductReviews(Number(req.params.productId)) }) } catch (error) { next(error) } })
router.post('/:productId', authMiddleware, async (req, res, next) => {
  try {
    const { rating, title, body } = req.body
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !body?.trim()) return res.status(400).json({ success: false, message: 'Rating and review text are required' })
    res.status(201).json({ success: true, data: await createReview(req.user.userId, Number(req.params.productId), { rating, title, body }) })
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ success: false, message: 'You already reviewed this product' })
    next(error)
  }
})
export default router