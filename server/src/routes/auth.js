import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { comparePassword, generateToken, hashPassword, validateEmail } from '../utils/helpers.js'
import { createUser, findUserByEmail, findUserById } from '../models/User.js'

const router = express.Router()

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  fullName: user.full_name,
  role: user.role,
})

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, fullName, phone } = req.body
    if (!email || !password || !fullName) return res.status(400).json({ success: false, message: 'Email, password, and full name are required' })
    if (!validateEmail(email)) return res.status(400).json({ success: false, message: 'Invalid email format' })
    if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' })
    if (await findUserByEmail(email)) return res.status(409).json({ success: false, message: 'Email already registered' })

    const normalizedEmail = email.toLowerCase().trim()
    const role = normalizedEmail === (process.env.ADMIN_EMAIL || 'iamellyokello@gmail.com').toLowerCase() ? 'admin' : 'customer'
    const user = await createUser({ email: normalizedEmail, passwordHash: await hashPassword(password), fullName: fullName.trim(), phone, role })
    res.status(201).json({ success: true, message: 'Registration successful', data: { user: publicUser(user), token: generateToken(user.id, user.role, user.email) } })
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = email && await findUserByEmail(email.toLowerCase().trim())
    if (!user || !password || !(await comparePassword(password, user.password_hash))) return res.status(401).json({ success: false, message: 'Invalid email or password' })
    res.json({ success: true, message: 'Login successful', data: { user: publicUser(user), token: generateToken(user.id, user.role, user.email) } })
  } catch (error) {
    next(error)
  }
})

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, data: publicUser(user) })
  } catch (error) {
    next(error)
  }
})

export default router