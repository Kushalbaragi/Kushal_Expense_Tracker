import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Spinner() {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      style={{ animation: 'spin 0.75s linear infinite', display: 'inline-block' }}
    >
      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.25)" strokeWidth="2"/>
      <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { setError('Please fill in all fields'); return }
    setLoading(true)
    try {
      await signup({ name: form.name, email: form.email, password: form.password })
      navigate('/welcome', { replace: true })
    } catch (err) {
      const msg = err.message || ''
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
        setError('An account with this email already exists. Please log in.')
      } else {
        setError(msg || 'Sign up failed. Please try again.')
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg font-sans flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <h1 className="text-white text-xl font-semibold tracking-tight mb-1">Okana</h1>
          <p className="text-white/30 text-sm">Your money, beautifully tracked.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-white/35 text-xs font-medium mb-2 uppercase tracking-wider">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full glass rounded-xl px-4 py-3 text-white text-sm outline-none placeholder-border focus:glass-active transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-white/35 text-xs font-medium mb-2 uppercase tracking-wider">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full glass rounded-xl px-4 py-3 text-white text-sm outline-none placeholder-border focus:glass-active transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-white/35 text-xs font-medium mb-2 uppercase tracking-wider">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full glass rounded-xl px-4 py-3 text-white text-sm outline-none placeholder-border focus:glass-active transition-all duration-200"
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-[14px] rounded-2xl text-sm font-semibold glass-active text-white active:scale-95 transition-all duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner />
                <span>Creating account…</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-white/35 text-sm text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-white font-medium hover:text-white/80 transition-colors">
            Log In
          </Link>
        </p>
      </div>
    </div>
  )
}
