import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { setError('Please fill in all required fields'); return }
    setLoading(true)
    try {
      await signup({ name: form.name, email: form.email, phone: form.phone, password: form.password })
      setEmailSent(true)
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-bg font-sans flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M5 14l6 6L23 8" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-white text-xl font-semibold mb-2">Check your email</h2>
        <p className="text-white/40 text-sm max-w-[280px]">
          We sent a confirmation link to <span className="text-white/70">{form.email}</span>. Click it to activate your account.
        </p>
        <Link to="/login" className="mt-8 text-white/50 text-sm hover:text-white transition-colors">
          Back to Log In
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg font-sans flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <p className="text-white/30 text-sm mt-2">Track your money, effortlessly.</p>
        </div>

        <h2 className="text-white text-2xl font-semibold mb-8 text-center">Create account</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-white/35 text-xs font-medium mb-2 uppercase tracking-wider">Name <span className="text-white/20">*</span></label>
            <input
              type="text"
              name="name"
              placeholder="Kushal Baragi"
              value={form.name}
              onChange={handleChange}
              className="w-full glass rounded-xl px-4 py-3 text-white text-sm outline-none placeholder-border focus:glass-active transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-white/35 text-xs font-medium mb-2 uppercase tracking-wider">Email <span className="text-white/20">*</span></label>
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
            <label className="block text-white/35 text-xs font-medium mb-2 uppercase tracking-wider">Phone <span className="text-white/20">(optional)</span></label>
            <input
              type="tel"
              name="phone"
              placeholder="+91 98800 95140"
              value={form.phone}
              onChange={handleChange}
              className="w-full glass rounded-xl px-4 py-3 text-white text-sm outline-none placeholder-border focus:glass-active transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-white/35 text-xs font-medium mb-2 uppercase tracking-wider">Password <span className="text-white/20">*</span></label>
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
