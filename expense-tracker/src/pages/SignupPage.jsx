import { useState, useEffect } from 'react'
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

function SuccessScreen({ email }) {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/login'), 5000)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="min-h-screen bg-bg font-sans flex flex-col items-center justify-center px-6 text-center">
      {/* Animated green circle + tick */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{
          background: 'rgba(74,222,128,0.12)',
          border: '1px solid rgba(74,222,128,0.3)',
          animation: 'scaleIn 0.45s cubic-bezier(0.34,1.2,0.64,1) both',
        }}
      >
        <svg
          width="36" height="36" viewBox="0 0 36 36" fill="none"
          style={{ animation: 'fadeSlideUp 0.35s 0.25s cubic-bezier(0.16,1,0.3,1) both', opacity: 0 }}
        >
          <path d="M6 18l8 8L30 10" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h2
        className="text-white text-xl font-semibold mb-2"
        style={{ animation: 'fadeSlideUp 0.35s 0.35s cubic-bezier(0.16,1,0.3,1) both', opacity: 0 }}
      >
        Account created!
      </h2>
      <p
        className="text-white/40 text-sm max-w-[260px] mb-8"
        style={{ animation: 'fadeSlideUp 0.35s 0.45s cubic-bezier(0.16,1,0.3,1) both', opacity: 0 }}
      >
        You're all set. Redirecting to login…
      </p>

      {/* Progress bar */}
      <div
        className="w-40 h-[2px] rounded-full overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.08)',
          animation: 'fadeSlideUp 0.35s 0.5s cubic-bezier(0.16,1,0.3,1) both',
          opacity: 0,
        }}
      >
        <div
          style={{
            height: '100%',
            background: '#4ade80',
            animation: 'progressFill 5s linear 0.55s both',
            width: '0%',
          }}
        />
      </div>
    </div>
  )
}

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

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
      setDone(true)
    } catch (err) {
      const msg = err.message || ''
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
        setError('An account with this email already exists. Please log in.')
      } else {
        setError(msg || 'Sign up failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (done) return <SuccessScreen email={form.email} />

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
