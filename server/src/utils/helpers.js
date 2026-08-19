import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// JWT utilities
export const generateToken = (userId, role = 'user') => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE_IN || '24h' }
  )
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Password utilities
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash)
}

// Validation utilities
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const validatePhone = (phone) => {
  const regex = /^\d{10}$/
  return regex.test(phone.replace(/\D/g, ''))
}

// Response utilities
export const successResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data
})

export const errorResponse = (message = 'Error', statusCode = 400) => ({
  success: false,
  error: message,
  statusCode
})
