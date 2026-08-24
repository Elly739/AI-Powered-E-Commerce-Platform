import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import './index.css'

/* eslint-disable react/prop-types */

function AuthPage({ mode, onAuthenticated }) {
  const isLogin = mode === 'login'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.email || !form.password || (!isLogin && !form.name)) {
      setError('Please complete all required fields.')
      return
    }

    setSubmitting(true)
    try {
      const endpoint = isLogin ? 'login' : 'register'
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { email: form.email, password: form.password, fullName: form.name }
      const response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Authentication failed.')
      onAuthenticated(result.data.user, result.data.token)
      navigate('/dashboard')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-story">
        <span className="eyebrow">Phase 02 / Identity</span>
        <h2>{isLogin ? 'Welcome back to the good stuff.' : 'Your next favorite thing is waiting.'}</h2>
        <p>Save your taste profile, keep your cart close, and let the store get smarter with every visit.</p>
      </div>
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="eyebrow">{isLogin ? 'Sign in' : 'Create account'}</span>
        <h1>{isLogin ? 'Pick up where you left off.' : 'Make shopping feel personal.'}</h1>
        <p className="muted">{isLogin ? 'Use your account details to continue.' : 'It takes less than a minute to get started.'}</p>
        {!isLogin && (
          <label>Full name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Avery Morgan" /></label>
        )}
        <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></label>
        <label>Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters" /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn-primary" type="submit" disabled={submitting}>{submitting ? 'Working...' : isLogin ? 'Sign in' : 'Create account'} <span>→</span></button>
        <p className="auth-switch">{isLogin ? 'New here?' : 'Already have an account?'} <Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Create an account' : 'Sign in'}</Link></p>
      </form>
    </section>
  )
}

function Dashboard({ user, onLogout }) {
  return (
    <section className="dashboard">
      <div className="dashboard-heading">
        <div><span className="eyebrow">Your account</span><h2>Good to see you, {user.name.split(' ')[0]}.</h2></div>
        <button className="btn-secondary" onClick={onLogout}>Sign out</button>
      </div>
      <div className="dashboard-grid">
        <article className="stat-card"><span>Profile signal</span><strong>Getting clearer</strong><p>We are learning what makes your taste tick.</p></article>
        <article className="stat-card accent-card"><span>Saved for later</span><strong>0 items</strong><p>Your wishlist will appear here.</p></article>
        <article className="stat-card"><span>Recent orders</span><strong>Nothing yet</strong><p>Your next great find could be today.</p></article>
      </div>
    </section>
  )
}

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const loadProducts = async () => {
      try {
        const query = search ? `?search=${encodeURIComponent(search)}` : ''
        const response = await fetch(`http://localhost:5000/api/products${query}`, { signal: controller.signal })
        if (!response.ok) throw new Error('Could not load the collection.')
        const result = await response.json()
        setProducts(result.data)
        setError('')
      } catch (requestError) {
        if (requestError.name !== 'AbortError') setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
    return () => controller.abort()
  }, [search])

  return (
    <section className="products-page container-main">
      <div className="products-heading"><div><span className="eyebrow">The current edit</span><h2>Useful things,<br /><em>chosen well.</em></h2></div><label className="search-field">Search the edit<input value={search} onChange={(event) => { setSearch(event.target.value); setLoading(true) }} placeholder="Try “lamp”" /></label></div>
      {loading && <p className="muted">Finding the right things...</p>}
      {error && <p className="form-error">{error} Is the backend running on port 5000?</p>}
      {!loading && !error && <div className="product-grid">{products.map((product, index) => <Link to={`/products/${product.id}`} className="product-card" key={product.id}><div className={`product-image product-image-${index % 3}`}><span>{String(index + 1).padStart(2, '0')}</span><span className="view-label">View piece ↗</span></div><div className="product-meta"><div><span className="product-category">{product.categoryName}</span><h3>{product.name}</h3></div><strong>${product.price}</strong></div><p>{product.description}</p></Link>)}</div>}
      {!loading && !error && products.length === 0 && <p className="muted">No pieces matched that search.</p>}
    </section>
  )
}

function ProductDetailPage() {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)
  const productId = window.location.pathname.split('/').pop()

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${productId}`)
      .then((response) => {
        if (!response.ok) throw new Error('This piece could not be found.')
        return response.json()
      })
      .then((result) => setProduct(result.data))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [productId])

  if (loading) return <section className="detail-state container-main"><p className="muted">Opening the piece...</p></section>
  if (error) return <section className="detail-state container-main"><p className="form-error">{error}</p><Link to="/products" className="text-link">Back to the edit</Link></section>

  const addToCart = async () => {
    const token = localStorage.getItem('ecommerce_token')
    if (!token) return window.location.assign('/login')
    const response = await fetch('http://localhost:5000/api/cart', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: product.id, quantity: 1 }) })
    if (response.ok) setAdded(true)
  }

  return <section className="product-detail container-main"><Link to="/products" className="back-link">← Back to the edit</Link><div className="detail-layout"><div className="detail-image product-image-0"><span>01 / {product.categoryName}</span></div><div className="detail-copy"><span className="eyebrow">{product.categoryName}</span><h2>{product.name}</h2><strong className="detail-price">${product.price}</strong><p>{product.description}</p><div className="stock-row"><span className="stock-dot" />{product.stockQuantity > 0 ? `${product.stockQuantity} ready to ship` : 'Currently sold out'}</div><button className="btn-primary" onClick={addToCart} disabled={product.stockQuantity === 0}>{added ? 'Added to cart' : 'Add to cart'} <span>{added ? '✓' : '+'}</span></button><div className="detail-note"><strong>A considered choice</strong><span>Every piece in the edit is selected for how it earns its place in your everyday.</span></div></div></div></section>
}

function CartPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const token = localStorage.getItem('ecommerce_token')

  const loadCart = () => fetch('http://localhost:5000/api/cart', { headers: { Authorization: `Bearer ${token}` } }).then((response) => {
    if (!response.ok) throw new Error('Sign in to see your saved cart.')
    return response.json()
  }).then((result) => setItems(result.data)).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false))

  useEffect(() => { if (token) loadCart(); else setLoading(false) }, [])

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return removeItem(productId)
    await fetch(`http://localhost:5000/api/cart/${productId}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity }) })
    loadCart()
  }

  const removeItem = async (productId) => {
    await fetch(`http://localhost:5000/api/cart/${productId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    loadCart()
  }

  if (!token) return <section className="cart-page container-main"><span className="eyebrow">Your cart</span><h2>A little room<br /><em>for good things.</em></h2><p className="muted">Sign in to keep your cart with you wherever you go.</p><Link to="/login" className="btn-primary">Sign in to continue <span>→</span></Link></section>
  if (loading) return <section className="cart-page container-main"><p className="muted">Gathering your saved pieces...</p></section>
  if (error) return <section className="cart-page container-main"><p className="form-error">{error}</p></section>

  const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0)
  return <section className="cart-page container-main"><div className="cart-heading"><div><span className="eyebrow">Your cart</span><h2>Good choices,<br /><em>gathered.</em></h2></div><span className="cart-summary">{items.length} {items.length === 1 ? 'piece' : 'pieces'}</span></div>{items.length === 0 ? <div className="cart-empty"><p className="muted">Nothing here yet. The edit is full of possibilities.</p><Link to="/products" className="text-link">Browse the edit</Link></div> : <div className="cart-layout"><div className="cart-items">{items.map((item, index) => <article className="cart-item" key={item.productId}><div className={`cart-thumb product-image-${index % 3}`} /><div className="cart-item-info"><span className="product-category">In your edit</span><h3>{item.name}</h3><span className="muted">${item.price} each</span></div><div className="quantity-control"><button onClick={() => updateQuantity(item.productId, item.quantity - 1)} aria-label={`Decrease ${item.name} quantity`}>−</button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.productId, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`}>+</button></div><strong>${item.subtotal}</strong><button className="remove-item" onClick={() => removeItem(item.productId)}>Remove</button></article>)}</div><aside className="cart-total"><span className="eyebrow">Order preview</span><div><span>Subtotal</span><strong>${total.toFixed(2)}</strong></div><p>Shipping and taxes are calculated at checkout.</p><button className="btn-primary" disabled>Continue to checkout <span>→</span></button></aside></div>}</section>
}

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('ecommerce_user') || 'null'))

  useEffect(() => {
    const token = localStorage.getItem('ecommerce_token')
    if (!token) return

    fetch('http://localhost:5000/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        if (!response.ok) throw new Error('Session expired')
        return response.json()
      })
      .then((result) => {
        localStorage.setItem('ecommerce_user', JSON.stringify(result.data))
        setUser(result.data)
      })
      .catch(() => {
        localStorage.removeItem('ecommerce_user')
        localStorage.removeItem('ecommerce_token')
        setUser(null)
      })
  }, [])

  const handleAuthenticated = (authenticatedUser, token) => {
    localStorage.setItem('ecommerce_user', JSON.stringify(authenticatedUser))
    localStorage.setItem('ecommerce_token', token)
    setUser(authenticatedUser)
  }

  const handleLogout = () => {
    localStorage.removeItem('ecommerce_user')
    localStorage.removeItem('ecommerce_token')
    setUser(null)
  }

  return (
    <Router>
      <div className="app-shell">
        <header className="site-header">
          <nav className="container-main nav-bar">
            <Link to="/" className="brand"><span className="brand-mark">A</span> Aster & Co.</Link>
            <div className="nav-links"><Link to="/products">Discover</Link><Link to="/cart">Cart <span className="cart-count">0</span></Link>{user ? <Link to="/dashboard" className="profile-link">{user.name.charAt(0)}</Link> : <Link to="/login" className="nav-cta">Sign in</Link>}</div>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<AuthPage mode="login" onAuthenticated={handleAuthenticated} />} />
            <Route path="/register" element={<AuthPage mode="register" onAuthenticated={handleAuthenticated} />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </main>

        <footer className="site-footer">
          <div className="container-main text-center">
            <p>Aster & Co. <span>Thoughtful commerce, one good choice at a time.</span></p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

function HomePage() {
  return (
    <div className="home-page">
      <section className="hero container-main">
        <div className="hero-copy"><span className="eyebrow">A considered edit for everyday life</span><h2>Find things that feel like <em>you.</em></h2><p>Discover useful, beautiful pieces selected around your rhythm, your home, and the details you notice.</p><div className="hero-actions"><Link to="/register" className="btn-primary">Start exploring <span>→</span></Link><Link to="/products" className="text-link">Browse the edit</Link></div></div>
        <div className="hero-art" aria-label="Abstract editorial product composition"><div className="art-circle" /><div className="art-card"><span>01 / daily rituals</span><strong>Make room<br />for better.</strong><small>Objects with a point of view.</small></div><div className="art-line" /></div>
      </section>
      <section className="value-strip container-main"><div><strong>Curated, not crowded</strong><span>A smaller edit with more intention.</span></div><div><strong>Recommendations with memory</strong><span>Built around your evolving taste.</span></div><div><strong>Made for real life</strong><span>Useful things, beautifully chosen.</span></div></section>
    </div>
  )
}

export default App
