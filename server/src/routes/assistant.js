import express from 'express'
import { getCart } from '../models/Cart.js'
import { listProducts } from '../models/Product.js'
import { getWishlist } from '../models/Wishlist.js'
import { getRecentInteractionProductIds } from '../models/Interaction.js'
import { buildAssistantReply } from '../services/assistantService.js'
import { verifyToken } from '../utils/helpers.js'

const router = express.Router()

const getOptionalUserId = (req) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return null
  try {
    return verifyToken(token).userId
  } catch {
    return null
  }
}

router.post('/chat', async (req, res, next) => {
  try {
    const message = req.body.message?.trim()
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' })

    const userId = getOptionalUserId(req)
    const [products, cart, wishlist, viewedProductIds] = await Promise.all([
      listProducts({ limit: 100 }),
      userId ? getCart(userId) : [],
      userId ? getWishlist(userId) : [],
      userId ? getRecentInteractionProductIds(userId, 'viewed', 20) : [],
    ])

    const reply = buildAssistantReply({ message, products, cart, wishlist, viewedProductIds })
    res.json({
      success: true,
      data: {
        sessionId: req.body.sessionId || `assistant-${Date.now()}`,
        message,
        ...reply,
      },
    })
  } catch (error) {
    next(error)
  }
})

export default router
