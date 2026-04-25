import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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

function SuccessScreen() {
  return (
    <div className="min-h-screen bg-bg font-sans flex flex-col items-center justify-center px-6 text-center">
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
          <path d="M8 18l5 5 10-11" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h2
        className="text-white text-xl font-semibold mb-2"
        style={{ animation: 'fadeSlideUp 0.35s 0.35s cubic-bezier(0.16,1,0.3,1) both', opacity: 0 }}
      >
        Check your inbox
      </h2>
      <p
        className="text-white/40 text-sm max-w-[260px] mb-8"
        style={{ animation: 'fadeSlideUp 0.35s 0.45s cubic-bezier(0.16,1,0.3,1) both', opacity: 0 }}
      >
        We've sent a password reset link to your email address.
      </p>

      <Link
        to="/login"
        className="text-white/50 text-sm hover:text-white/80 transition-colors"
        style={{ animation: 'fadeSlideUp 0.35s 0.55s cubic-bezier(0.16,1,0.3,1) both', opacity: 0 }}
      >
        Back to login
      </Link>
    </div>
  )
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) { setError('Please enter your email'); return }
    setLoading(true)
    setError('')
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (err) throw err
      setDone(true)
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) return <SuccessScreen />

  return (
    <div className="min-h-screen bg-bg font-sans flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <p className="text-white/30 text-sm">We'll send you a reset link.</p>
        </div>

        <h2 className="text-white text-2xl font-semibold mb-2 text-center">Forgot password?</h2>
        <p className="text-white/35 text-sm text-center mb-8">Enter your email and we'll send a reset link.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-white/35 text-xs font-medium mb-2 uppercase tracking-wider">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              className="w-full glass rounded-xl px-4 py-3 text-white text-sm outline-none placeholder-border focus:glass-active transition-all duration-200"
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-[14px] rounded-2xl text-sm font-semibold glass-active text-white hover:brightness-110 active:scale-95 transition-all duration-200 mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner />
                <span>Sending…</span>
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <p className="text-white/35 text-sm text-center mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-white font-medium hover:text-white/80 transition-colors">
            Log In
          </Link>
        </p>
      </div>
    </div>
  )
}
