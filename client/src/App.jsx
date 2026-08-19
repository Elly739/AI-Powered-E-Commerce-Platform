import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import './index.css'

/* eslint-disable react/prop-types */

const demoUser = {
  name: 'Avery Morgan',
  email: 'avery@example.com',
}

function AuthPage({ mode, onAuthenticated }) {
  const isLogin = mode === 'login'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    if (!form.email || !form.password || (!isLogin && !form.name)) {
      setError('Please complete all required fields.')
      return
    }

    onAuthenticated({
      name: isLogin ? demoUser.name : form.name,
      email: form.email,
    })
    navigate('/dashboard')
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
        <button className="btn-primary" type="submit">{isLogin ? 'Sign in' : 'Create account'} <span>→</span></button>
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

function App() {
  const [user, setUser] = useState(null)

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
            <Route path="/login" element={<AuthPage mode="login" onAuthenticated={setUser} />} />
            <Route path="/register" element={<AuthPage mode="register" onAuthenticated={setUser} />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" replace />} />
            <Route path="/products" element={<Placeholder title="The collection is coming into focus." />} />
            <Route path="/cart" element={<Placeholder title="Your cart is waiting for a first find." />} />
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

function Placeholder({ title }) {
  return <section className="placeholder container-main"><span className="eyebrow">Coming next</span><h2>{title}</h2><Link to="/" className="text-link">Back to the home edit</Link></section>
}

export default App
