import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import './index.css'
import Button from './components/ui/Button'
import EmptyState from './components/ui/EmptyState'
import Input from './components/ui/Input'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ProductCard from './components/ui/ProductCard'

/* eslint-disable react/prop-types */

const normalizeUser = (user) => user && ({ ...user, name: user.name || user.fullName || user.email })

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
          <Input label="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Avery Morgan" />
        )}
        <Input label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" />
        <Input label="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters" />
        {error && <p className="form-error">{error}</p>}
        <Button type="submit" loading={submitting}>{isLogin ? 'Sign in' : 'Create account'} <span>→</span></Button>
        <p className="auth-switch">{isLogin ? 'New here?' : 'Already have an account?'} <Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Create an account' : 'Sign in'}</Link></p>
      </form>
    </section>
  )
}

function Dashboard({ user, onLogout }) {
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [orderError, setOrderError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('ecommerce_token')
    fetch('http://localhost:5000/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        if (!response.ok) throw new Error('Order history is temporarily unavailable.')
        return response.json()
      })
      .then((result) => setOrders(result.data || []))
      .catch((error) => setOrderError(error.message))
      .finally(() => setLoadingOrders(false))
  }, [])

  return (
    <section className="dashboard">
      <div className="dashboard-heading">
        <div><span className="eyebrow">Your account</span><h2>Good to see you, {user.name.split(' ')[0]}.</h2><p className="dashboard-email">{user.email}</p></div>
        <Button variant="secondary" onClick={onLogout}>Sign out</Button>
      </div>
      <div className="dashboard-grid">
        <article className="stat-card"><span>Profile signal</span><strong>Getting clearer</strong><p>We are learning what makes your taste tick.</p></article>
        <Link to="/wishlist" className="stat-card accent-card"><span>Saved for later</span><strong>See your edit</strong><p>Return to the pieces you want to remember.</p></Link>
        <Link to="/products" className="stat-card"><span>Keep exploring</span><strong>Find a new favorite</strong><p>There are more considered pieces in the current edit.</p></Link>
      </div>
      <section className="order-history"><div className="section-heading"><div><span className="eyebrow">Your history</span><h3>Orders, kept close.</h3></div><Link to="/products" className="text-link">Shop the edit</Link></div>{loadingOrders && <p className="muted">Gathering your orders...</p>}{orderError && <p className="form-error">{orderError}</p>}{!loadingOrders && !orderError && !orders.length && <p className="muted">Your first order will appear here after checkout.</p>}{orders.map((order) => <article className="order-row" key={order.id}><div><span>Order #{order.id}</span><strong>{new Date(order.createdAt).toLocaleDateString()}</strong></div><span className="order-status">{order.status}</span><strong>${order.total}</strong></article>)}</section>
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
      {loading && <LoadingSpinner label="Finding the right things..." />}
      {error && <p className="form-error">{error} Is the backend running on port 5000?</p>}
      {!loading && !error && <div className="product-grid">{products.map((product, index) => <ProductCard product={product} index={index} key={product.id} />)}</div>}
      {!loading && !error && products.length === 0 && <EmptyState title="No pieces matched that search." message="Try a broader search or return to the full edit." actionLabel="Clear the search" actionTo="/products" />}
    </section>
  )
}

function ProductDetailPage() {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)
  const [saved, setSaved] = useState(false)
  const [reviews, setReviews] = useState([])
  const [review, setReview] = useState({ rating: 5, body: '' })
  const [reviewMessage, setReviewMessage] = useState('')
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
    fetch(`http://localhost:5000/api/reviews/${productId}`).then((response) => response.json()).then((result) => setReviews(result.data || []))
    fetch('http://localhost:5000/api/interactions', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(localStorage.getItem('ecommerce_token') ? { Authorization: `Bearer ${localStorage.getItem('ecommerce_token')}` } : {}) }, body: JSON.stringify({ productId, interactionType: 'viewed', metadata: { source: 'product-detail' } }) })
  }, [productId])

  if (loading) return <section className="detail-state container-main"><p className="muted">Opening the piece...</p></section>
  if (error) return <section className="detail-state container-main"><p className="form-error">{error}</p><Link to="/products" className="text-link">Back to the edit</Link></section>

  const addToCart = async () => {
    const token = localStorage.getItem('ecommerce_token')
    if (!token) return window.location.assign('/login')
    const response = await fetch('http://localhost:5000/api/cart', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: product.id, quantity: 1 }) })
    if (response.ok) setAdded(true)
  }

  const saveToWishlist = async () => {
    const token = localStorage.getItem('ecommerce_token')
    if (!token) return window.location.assign('/login')
    const response = await fetch(`http://localhost:5000/api/wishlist/${product.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    if (response.ok) setSaved(true)
  }

  const submitReview = async (event) => {
    event.preventDefault()
    const token = localStorage.getItem('ecommerce_token')
    if (!token) return window.location.assign('/login')
    const response = await fetch(`http://localhost:5000/api/reviews/${product.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(review) })
    const result = await response.json()
    if (!response.ok) return setReviewMessage(result.message)
    setReviews([result.data, ...reviews])
    setReview({ rating: 5, body: '' })
    setReviewMessage('Your note is saved.')
  }

  return <section className="product-detail container-main"><Link to="/products" className="back-link">← Back to the edit</Link><div className="detail-layout"><div className="detail-image product-image-0"><span>01 / {product.categoryName}</span></div><div className="detail-copy"><span className="eyebrow">{product.categoryName}</span><h2>{product.name}</h2><strong className="detail-price">${product.price}</strong><p>{product.description}</p><div className="stock-row"><span className="stock-dot" />{product.stockQuantity > 0 ? `${product.stockQuantity} ready to ship` : 'Currently sold out'}</div><div className="detail-actions"><button className="btn-primary" onClick={addToCart} disabled={product.stockQuantity === 0}>{added ? 'Added to cart' : 'Add to cart'} <span>{added ? '✓' : '+'}</span></button><button className="save-button" onClick={saveToWishlist}>{saved ? 'Saved ♥' : 'Save ♡'}</button></div><div className="detail-note"><strong>A considered choice</strong><span>Every piece in the edit is selected for how it earns its place in your everyday.</span></div></div></div><section className="reviews-section"><div><span className="eyebrow">Community notes</span><h3>What people noticed.</h3></div><div className="review-list">{reviews.length ? reviews.map((item) => <article className="review-card" key={item.id}><strong>{'★'.repeat(item.rating)}</strong><p>{item.body}</p><span>{item.reviewerName || 'Aster customer'}</span></article>) : <p className="muted">Be the first to leave a note.</p>}</div><form className="review-form" onSubmit={submitReview}><label>Leave a note<select value={review.rating} onChange={(event) => setReview({ ...review, rating: Number(event.target.value) })}><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select><textarea value={review.body} onChange={(event) => setReview({ ...review, body: event.target.value })} placeholder="What makes this piece work for you?" required /></label><button className="btn-secondary" type="submit">{localStorage.getItem('ecommerce_token') ? 'Save your note' : 'Sign in to review'}</button>{reviewMessage && <span className="muted">{reviewMessage}</span>}</form></section></section>
}

function CartPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ordered, setOrdered] = useState(null)
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

  const placeOrder = async () => {
    const response = await fetch('http://localhost:5000/api/orders', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    const result = await response.json()
    if (!response.ok) return setError(result.message || 'Checkout could not be completed.')
    setOrdered(result.data)
    setItems([])
  }

  if (!token) return <section className="cart-page container-main"><span className="eyebrow">Your cart</span><h2>A little room<br /><em>for good things.</em></h2><p className="muted">Sign in to keep your cart with you wherever you go.</p><Link to="/login" className="btn-primary">Sign in to continue <span>→</span></Link></section>
  if (loading) return <section className="cart-page container-main"><p className="muted">Gathering your saved pieces...</p></section>
  if (error) return <section className="cart-page container-main"><p className="form-error">{error}</p></section>
  if (ordered) return <section className="cart-page order-success container-main"><span className="eyebrow">Order placed</span><h2>That’s a good<br /><em>start.</em></h2><p className="muted">Order #{ordered.id} is confirmed. Your pieces are now on their way into your story.</p><Link to="/products" className="btn-primary">Keep exploring <span>→</span></Link></section>

  const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0)
  return <section className="cart-page container-main"><div className="cart-heading"><div><span className="eyebrow">Your cart</span><h2>Good choices,<br /><em>gathered.</em></h2></div><span className="cart-summary">{items.length} {items.length === 1 ? 'piece' : 'pieces'}</span></div>{items.length === 0 ? <div className="cart-empty"><p className="muted">Nothing here yet. The edit is full of possibilities.</p><Link to="/products" className="text-link">Browse the edit</Link></div> : <div className="cart-layout"><div className="cart-items">{items.map((item, index) => <article className="cart-item" key={item.productId}><div className={`cart-thumb product-image-${index % 3}`} /><div className="cart-item-info"><span className="product-category">In your edit</span><h3>{item.name}</h3><span className="muted">${item.price} each</span></div><div className="quantity-control"><button onClick={() => updateQuantity(item.productId, item.quantity - 1)} aria-label={`Decrease ${item.name} quantity`}>−</button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.productId, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`}>+</button></div><strong>${item.subtotal}</strong><button className="remove-item" onClick={() => removeItem(item.productId)}>Remove</button></article>)}</div><aside className="cart-total"><span className="eyebrow">Order preview</span><div><span>Subtotal</span><strong>${total.toFixed(2)}</strong></div><p>Shipping and taxes are calculated at checkout.</p><button className="btn-primary" onClick={placeOrder}>Place order <span>→</span></button></aside></div>}</section>
}

function WishlistPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('ecommerce_token')

  const loadWishlist = () => fetch('http://localhost:5000/api/wishlist', { headers: { Authorization: `Bearer ${token}` } }).then((response) => response.json()).then((result) => setItems(result.data)).finally(() => setLoading(false))
  useEffect(() => { if (token) loadWishlist(); else setLoading(false) }, [])

  const remove = async (productId) => { await fetch(`http://localhost:5000/api/wishlist/${productId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); loadWishlist() }
  if (!token) return <section className="wishlist-page container-main"><span className="eyebrow">Your wishlist</span><h2>Keep the<br /><em>good ones.</em></h2><p className="muted">Sign in to save pieces you want to return to.</p><Link to="/login" className="btn-primary">Sign in to continue <span>→</span></Link></section>
  if (loading) return <section className="wishlist-page container-main"><p className="muted">Opening your saved pieces...</p></section>
  return <section className="wishlist-page container-main"><div className="wishlist-heading"><div><span className="eyebrow">Your wishlist</span><h2>The ones<br /><em>to remember.</em></h2></div><span className="cart-summary">{items.length} saved</span></div>{items.length === 0 ? <div className="cart-empty"><p className="muted">Nothing saved yet. Start with the current edit.</p><Link to="/products" className="text-link">Browse the edit</Link></div> : <div className="wishlist-grid">{items.map((item, index) => <article className="wishlist-card" key={item.id}><div className={`wishlist-thumb product-image-${index % 3}`} /><span className="product-category">{item.categoryName}</span><h3>{item.name}</h3><div className="wishlist-card-bottom"><strong>${item.price}</strong><button className="remove-item" onClick={() => remove(item.id)}>Remove</button></div></article>)}</div>}</section>
}

function AdminPage() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ name: '', slug: '', description: '', price: '', stockQuantity: '' })
  const [message, setMessage] = useState('')
  const token = localStorage.getItem('ecommerce_token')

  const loadProducts = () => fetch('http://localhost:5000/api/products').then((response) => response.json()).then((result) => setProducts(result.data))
  useEffect(() => { loadProducts() }, [])

  const createProduct = async (event) => {
    event.preventDefault()
    const response = await fetch('http://localhost:5000/api/products', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, price: Number(form.price), stockQuantity: Number(form.stockQuantity) }) })
    const result = await response.json()
    setMessage(response.ok ? 'Product added to the edit.' : result.message)
    if (response.ok) { setForm({ name: '', slug: '', description: '', price: '', stockQuantity: '' }); loadProducts() }
  }

  return <section className="admin-page container-main"><div className="admin-heading"><div><span className="eyebrow">Admin studio</span><h2>Shape the<br /><em>next edit.</em></h2></div><span className="cart-summary">{products.length} live products</span></div><div className="admin-layout"><form className="admin-form" onSubmit={createProduct}><h3>Add a product</h3><label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label><label>Slug<input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="unique-product-slug" required /></label><label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><div className="admin-form-row"><label>Price<input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required /></label><label>Stock<input type="number" min="0" value={form.stockQuantity} onChange={(event) => setForm({ ...form, stockQuantity: event.target.value })} required /></label></div><button className="btn-primary" type="submit">Publish product <span>→</span></button>{message && <p className="muted">{message}</p>}</form><div className="admin-list"><span className="eyebrow">Live catalog</span>{products.map((product) => <div className="admin-product" key={product.id}><div><strong>{product.name}</strong><span>{product.categoryName || 'Uncategorized'}</span></div><span>${product.price} / {product.stockQuantity} in stock</span></div>)}</div></div></section>
}

function App() {
  const [user, setUser] = useState(() => normalizeUser(JSON.parse(localStorage.getItem('ecommerce_user') || 'null')))

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
        setUser(normalizeUser(result.data))
      })
      .catch(() => {
        localStorage.removeItem('ecommerce_user')
        localStorage.removeItem('ecommerce_token')
        setUser(null)
      })
  }, [])

  const handleAuthenticated = (authenticatedUser, token) => {
    const normalizedUser = normalizeUser(authenticatedUser)
    localStorage.setItem('ecommerce_user', JSON.stringify(normalizedUser))
    localStorage.setItem('ecommerce_token', token)
    setUser(normalizedUser)
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
            <div className="nav-links"><Link to="/products">Discover</Link><Link to="/cart">Cart <span className="cart-count">0</span></Link>{user ? <><Link to="/wishlist">Saved</Link>{user.role === 'admin' && <Link to="/admin">Studio</Link>}<Link to="/dashboard" className="profile-link">{user.name.charAt(0)}</Link></> : <Link to="/login" className="nav-cta">Sign in</Link>}</div>
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
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/admin" element={user?.role === 'admin' ? <AdminPage /> : <Navigate to="/" replace />} />
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
