# Phase 2: Authentication & User Management Implementation Plan

**Duration:** 2-3 Days  
**Priority:** CRITICAL (blocks all subsequent phases)  
**Dependencies:** Phase 1 complete, services running, PostgreSQL connected

---

## Overview

Implement complete authentication system with user registration, login, JWT tokens, and protected routes. This foundation is required by all subsequent phases (cart, orders, admin, AI features).

### Success Criteria
- ✅ User registration endpoint functional
- ✅ User login with JWT token generation
- ✅ Token validation and refresh
- ✅ Protected routes middleware working
- ✅ Frontend authentication UI complete
- ✅ Integration tests passing

---

## Architecture

### Database Schema

**users table:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  role VARCHAR(50) DEFAULT 'customer',
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### JWT Token Structure

**Payload:**
```json
{
  "userId": 123,
  "email": "user@example.com",
  "role": "customer",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Headers:**
```
Authorization: Bearer <token>
```

### Authentication Flow

```
Frontend Login Form
        ↓
POST /api/auth/login (email, password)
        ↓
Backend: Hash password → Compare with DB
        ↓
Generate JWT Token
        ↓
Return Token to Frontend
        ↓
Frontend: Store in localStorage
        ↓
Include in Authorization header for future requests
        ↓
Middleware: Verify JWT on protected routes
```

---

## Implementation Tasks

### Backend Tasks (Days 1-2)

#### Task 1.1: Database Setup
**File:** `server/src/config/database.js` (update)  
**Time:** 15 min

```javascript
// Add at startup to initialize schema
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        avatar_url VARCHAR(500),
        role VARCHAR(50) DEFAULT 'customer',
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
    `);
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}
```

**Acceptance Criteria:**
- Table created in PostgreSQL
- Indexes created
- Schema matches above specification

---

#### Task 1.2: Create User Model
**File:** `server/src/models/User.js` (NEW)  
**Time:** 30 min

```javascript
const pool = require('../config/database');

class User {
  static async create({ email, passwordHash, fullName, phone, role = 'customer' }) {
    const query = `
      INSERT INTO users (email, password_hash, full_name, phone, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, full_name, phone, role, created_at
    `;
    const { rows } = await pool.query(query, [email, passwordHash, fullName, phone, role]);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, email, full_name, phone, role, is_active, created_at FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async update(id, { fullName, phone, avatarUrl }) {
    const query = `
      UPDATE users 
      SET full_name = COALESCE($2, full_name),
          phone = COALESCE($3, phone),
          avatar_url = COALESCE($4, avatar_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email, full_name, phone, avatar_url, role, created_at
    `;
    const { rows } = await pool.query(query, [id, fullName, phone, avatarUrl]);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1';
    await pool.query(query, [id]);
  }
}

module.exports = User;
```

**Acceptance Criteria:**
- CRUD operations functional
- Error handling for duplicate email
- Passwords never returned in queries

---

#### Task 1.3: Create Auth Routes
**File:** `server/src/routes/auth.js` (NEW)  
**Time:** 45 min

```javascript
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, hashPassword, comparePassword, validateEmail } = require('../utils/helpers');
const { authMiddleware } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, fullName, phone } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await User.create({
      email,
      passwordHash,
      fullName,
      phone: phone || null
    });

    // Generate token
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me (protected)
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, (req, res) => {
  // Note: JWT is stateless, so logout is handled on frontend by removing token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
```

**Acceptance Criteria:**
- Register endpoint creates users
- Login returns JWT token
- Protected /me endpoint works
- Input validation complete
- Error messages clear

---

#### Task 1.4: Register Auth Routes
**File:** `server/src/index.js` (update)  
**Time:** 10 min

```javascript
const authRoutes = require('./routes/auth');

// Add to Express app setup (before 404 handler)
app.use('/api/auth', authRoutes);
```

**Acceptance Criteria:**
- Routes accessible at `/api/auth/*`
- No conflicts with existing routes

---

#### Task 1.5: Add Validation Utilities
**File:** `server/src/utils/validators.js` (NEW)  
**Time:** 20 min

```javascript
const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

const validateUserInput = ({ email, password, fullName, phone }) => {
  const errors = [];

  if (!email || email.trim() === '') {
    errors.push('Email is required');
  }

  if (!fullName || fullName.trim() === '') {
    errors.push('Full name is required');
  }

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (phone && phone.length !== 10) {
    errors.push('Phone must be 10 digits');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validatePassword,
  validateUserInput
};
```

---

### Frontend Tasks (Days 1-2)

#### Task 2.1: Create Authentication Context
**File:** `client/src/contexts/AuthContext.jsx` (NEW)  
**Time:** 30 min

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.data);
    } catch (err) {
      setToken(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, fullName, phone) => {
    try {
      setError(null);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        { email, password, fullName, phone }
      );
      const { token, user } = response.data.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { email, password }
      );
      const { token, user } = response.data.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Acceptance Criteria:**
- Context provides auth state
- Token persisted to localStorage
- User verification on mount
- Error handling complete

---

#### Task 2.2: Create Login Component
**File:** `client/src/components/LoginForm.jsx` (NEW)  
**Time:** 45 min

```javascript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-main min-h-screen flex items-center justify-center">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- Form submits correctly
- Error messages displayed
- Loading state shown
- Redirects to dashboard on success

---

#### Task 2.3: Create Register Component
**File:** `client/src/components/RegisterForm.jsx` (NEW)  
**Time:** 45 min

```javascript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.includes('@')) {
      newErrors.email = 'Valid email is required';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await register(
        formData.email,
        formData.password,
        formData.fullName,
        formData.phone || null
      );
      navigate('/dashboard');
    } catch (err) {
      setErrors({
        submit: err.response?.data?.message || 'Registration failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-main min-h-screen flex items-center justify-center">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

        {errors.submit && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="John Doe"
            />
            {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- Form validation working
- Password confirmation required
- Error messages clear
- Redirects on success

---

#### Task 2.4: Create Protected Route Component
**File:** `client/src/components/ProtectedRoute.jsx` (NEW)  
**Time:** 20 min

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="container-main flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

**Acceptance Criteria:**
- Shows loading state
- Redirects unauthenticated users
- Renders children when authenticated

---

#### Task 2.5: Update App Router
**File:** `client/src/App.jsx` (update)  
**Time:** 20 min

```javascript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Phase 3 routes */}
              <Route path="/products" element={<div>Products - Phase 3</div>} />
              <Route path="/cart" element={<div>Cart - Phase 3</div>} />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
```

**Acceptance Criteria:**
- All routes accessible
- Auth routes work
- Protected routes protected
- No console errors

---

#### Task 2.6: Update Header with User Menu
**File:** `client/src/components/Header.jsx` (update)  
**Time:** 20 min

```javascript
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-primary-600 text-white py-4">
      <div className="container-main flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          🛍️ E-Commerce
        </Link>

        <nav className="flex items-center gap-6">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="hover:text-primary-200">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm">{user?.fullName || user?.email}</span>
              <Link to="/dashboard" className="hover:text-primary-200">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="btn-primary"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
```

**Acceptance Criteria:**
- Shows login/register when not authenticated
- Shows user menu when authenticated
- Logout works correctly

---

#### Task 2.7: Create Dashboard Page
**File:** `client/src/pages/Dashboard.jsx` (NEW)  
**Time:** 30 min

```javascript
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container-main py-8">
      <div className="card">
        <h1 className="text-3xl font-bold mb-6">Welcome, {user?.fullName}!</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card border-2 border-primary-600">
            <h3 className="text-lg font-semibold mb-2">Profile</h3>
            <p className="text-gray-600 mb-4">{user?.email}</p>
            <a href="#edit" className="btn-primary">
              Edit Profile
            </a>
          </div>

          <div className="card border-2 border-primary-600">
            <h3 className="text-lg font-semibold mb-2">Orders</h3>
            <p className="text-gray-600 mb-4">View your order history</p>
            <a href="#orders" className="btn-primary">
              View Orders
            </a>
          </div>

          <div className="card border-2 border-primary-600">
            <h3 className="text-lg font-semibold mb-2">Wishlist</h3>
            <p className="text-gray-600 mb-4">Your saved items</p>
            <a href="#wishlist" className="btn-primary">
              View Wishlist
            </a>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> This is the dashboard for Phase 2. 
            Features like orders and wishlist will be added in subsequent phases.
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

### Testing Tasks (Day 3)

#### Task 3.1: Backend API Tests
**File:** `server/tests/auth.test.js` (NEW)  
**Time:** 1 hour

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

describe('Authentication API', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    fullName: 'Test User'
  };

  let token;

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await axios.post(`${API_URL}/auth/register`, testUser);
      
      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data.user.email).toBe(testUser.email);
      expect(response.data.data.token).toBeDefined();

      token = response.data.data.token;
    });

    it('should reject duplicate email', async () => {
      try {
        await axios.post(`${API_URL}/auth/register`, testUser);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error.response.status).toBe(409);
        expect(error.response.data.message).toContain('already registered');
      }
    });

    it('should reject short password', async () => {
      try {
        await axios.post(`${API_URL}/auth/register`, {
          ...testUser,
          email: `test-${Date.now()}@example.com`,
          password: 'short'
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('POST /auth/login', () => {
    it('should login with correct credentials', async () => {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.token).toBeDefined();
    });

    it('should reject wrong password', async () => {
      try {
        await axios.post(`${API_URL}/auth/login`, {
          email: testUser.email,
          password: 'WrongPassword123!'
        });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('GET /auth/me', () => {
    it('should return user profile with valid token', async () => {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.data.email).toBe(testUser.email);
    });

    it('should reject without token', async () => {
      try {
        await axios.get(`${API_URL}/auth/me`);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });
  });
});
```

**Run Tests:**
```bash
npm test
```

**Acceptance Criteria:**
- All tests passing
- Coverage > 80%
- Error cases handled

---

#### Task 3.2: Frontend Component Tests
**File:** `client/src/components/__tests__/LoginForm.test.jsx` (NEW)  
**Time:** 45 min

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from '../LoginForm';
import { AuthProvider } from '../../contexts/AuthContext';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LoginForm', () => {
  it('should render login form', () => {
    renderWithRouter(<LoginForm />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('should show error on invalid credentials', async () => {
    renderWithRouter(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });
});
```

**Run Tests:**
```bash
npm test
```

---

## Integration Testing Checklist

### Manual Testing Workflow

```bash
# 1. Start all services
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend  
cd client && npm run dev

# Terminal 3: Database
# (PostgreSQL running)

# 2. Test Registration Flow
1. Open http://localhost:5173/register
2. Fill form with valid data
3. Click "Sign Up"
4. Should redirect to dashboard
5. Check browser console for no errors

# 3. Test Login Flow
1. Click "Logout" in dashboard
2. Navigate to http://localhost:5173/login
3. Enter credentials
4. Click "Login"
5. Should redirect to dashboard

# 4. Test Protected Routes
1. Clear localStorage
2. Navigate to http://localhost:5173/dashboard
3. Should redirect to login page

# 5. Test Token Validation
1. Login successfully
2. Open DevTools → Application → localStorage
3. Verify "token" key exists
4. Refresh page
5. Should stay logged in (user persisted)

# 6. Test API Endpoints
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","fullName":"Test User"}'

curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'

curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Registration API working | ✅ | Pending |
| Login API working | ✅ | Pending |
| JWT tokens valid | ✅ | Pending |
| Protected routes blocked | ✅ | Pending |
| Frontend auth UI complete | ✅ | Pending |
| Tests passing | ✅ | Pending |
| Database schema correct | ✅ | Pending |
| Error handling robust | ✅ | Pending |

---

## Implementation Order

**Day 1:** Database setup + User model + Auth routes (Backend foundation)  
**Day 2:** AuthContext + Login/Register forms + Protected routes (Frontend)  
**Day 3:** Testing + Integration + Bug fixes  

---

## Next Phase Preview

Once Phase 2 complete, Phase 3 adds:
- Product catalog with search
- Product details pages
- Shopping cart functionality
- Wishlist system

Estimated: 2-3 days following same pattern

