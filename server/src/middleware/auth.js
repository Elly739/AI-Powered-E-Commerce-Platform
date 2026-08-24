import jwt from 'jsonwebtoken'

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export const adminMiddleware = (req, res, next) => {
  const adminEmail = (process.env.ADMIN_EMAIL || 'iamellyokello@gmail.com').toLowerCase()
  if (req.user?.role !== 'admin' || req.user?.email?.toLowerCase() !== adminEmail) {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

export const errorHandler = (err, req, res, next) => {
  console.error(err)
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { message: err.message })
  })
}
