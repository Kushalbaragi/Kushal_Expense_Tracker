import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function SuccessScreen({ email }) {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/login'), 6000)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="min-h-screen bg-bg font-sans flex flex-col items-center justify-center px-6 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{
          background: 'rgba(74,222,128,0.12)',
          border: '1px solid rgba(74,222,128,0.3)',
          animation: 'scaleIn 0.4s cubic-bezier(0.34,1.2,0.64,1) both',
        }}
      >
        <svg
          width="36" height="36" viewBox="0 0 36 36" fill="none"
          style={{ animation: 'fadeSlideUp 0.35s 0.2s cubic-bezier(0.16,1,0.3,1) both' }}
        >
          <path d="M6 18l8 8L30 10" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2
        className="text-white text-xl font-semibold mb-2"
        style={{ animation: 'fadeSlideUp 0.35s 0.3s cubic-bezier(0.16,1,0.3,1) both', opacity: 0 }}
      >
        Account created!
      </h2>
      <p
        className="text-white/40 text-sm max-w-[260px]"
        style={{ animation: 'fadeSlideUp 0.35s 0.4s cubic-bezier(0.16,1,0.3,1) both', opacity: 0 }}
      >
        Check <span className="text-white/60">{email}</span> to confirm, then log in.
      </p>
      <p
        className="text-white/20 text-xs mt-6"
        style={{ animation: 'fadeSlideUp 0.35s 0.5s cubic-bezier(0.16,1,0.3,1) both', opacity: 0 }}
      >
        Redirecting to login…
      </p>
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
      setError(err.message || 'Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) return <SuccessScreen email={form.email} />

  return (
    <div className="min-h-screen bg-bg font-sans flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <p className="text-white/30 text-sm">Track your money, effortlessly.</p>
        </div>

        <h2 className="text-white text-2xl font-semibold mb-8 text-center">Create account</h2>

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
            className="w-full py-[14px] rounded-2xl text-sm font-semibold glass-active text-white hover:brightness-110 active:scale-95 transition-all duration-200 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account…' : 'Create Account'}
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
