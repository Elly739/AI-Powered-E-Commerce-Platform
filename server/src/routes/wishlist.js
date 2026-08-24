import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { getWishlist, removeFromWishlist, saveToWishlist } from '../models/Wishlist.js'

const router = express.Router()
router.use(authMiddleware)

router.get('/', async (req, res, next) => {
  try { res.json({ success: true, data: await getWishlist(req.user.userId) }) } catch (error) { next(error) }
})

router.post('/:productId', async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await saveToWishlist(req.user.userId, Number(req.params.productId)) }) } catch (error) { next(error) }
})

router.delete('/:productId', async (req, res, next) => {
  try { await removeFromWishlist(req.user.userId, Number(req.params.productId)); res.json({ success: true }) } catch (error) { next(error) }
})

export default router