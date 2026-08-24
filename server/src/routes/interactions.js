import express from 'express'
import { recordInteraction } from '../models/Interaction.js'
import { verifyToken } from '../utils/helpers.js'

const router = express.Router()
router.post('/', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    const decoded = token ? verifyToken(token) : null
    const productId = Number(req.body.productId)
    const allowedTypes = ['viewed', 'searched', 'clicked', 'wishlist', 'cart', 'purchased']
    if (!Number.isInteger(productId) || !allowedTypes.includes(req.body.interactionType)) return res.status(400).json({ success: false, message: 'Product and interaction type are required' })
    await recordInteraction(decoded?.userId, productId, req.body.interactionType, req.body.metadata)
    res.status(201).json({ success: true })
  } catch (error) { next(error) }
})
export default router