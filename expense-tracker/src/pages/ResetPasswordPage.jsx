import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/login'), 3000)
    return () => clearTimeout(t)
  }, [navigate])

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
          <path d="M6 18l8 8L30 10" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h2
        className="text-white text-xl font-semibold mb-2"
        style={{ animation: 'fadeSlideUp 0.35s 0.35s cubic-bezier(0.16,1,0.3,1) both', opacity: 0 }}
      >
        Password updated!
      </h2>
      <p
        className="text-white/40 text-sm max-w-[260px]"
        style={{ animation: 'fadeSlideUp 0.35s 0.45s cubic-bezier(0.16,1,0.3,1) both', opacity: 0 }}
      >
        Redirecting to login…
      </p>

      {/* Progress bar */}
      <div
        className="w-40 h-[2px] rounded-full overflow-hidden mt-8"
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
            animation: 'progressFill 3s linear 0.55s both',
            width: '0%',
          }}
        />
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)

  // Supabase fires PASSWORD_RECOVERY on auth state change when the link token is parsed
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })

    // Also check if session already exists from the hash fragment
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!password) { setError('Please enter a new password'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }

    setLoading(true)
    setError('')
    try {
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) throw err
      setDone(true)
    } catch (err) {
      setError(err.message || 'Failed to update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) return <SuccessScreen />

  // Show loading state while waiting for recovery session
  if (!ready) {
    return (
      <div className="min-h-screen bg-bg font-sans flex flex-col items-center justify-center px-6 text-center">
        <Spinner />
        <p className="text-white/30 text-sm mt-4">Verifying reset link…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg font-sans flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <p className="text-white/30 text-sm">Choose a strong password.</p>
        </div>

        <h2 className="text-white text-2xl font-semibold mb-8 text-center">Set new password</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-white/35 text-xs font-medium mb-2 uppercase tracking-wider">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              className="w-full glass rounded-xl px-4 py-3 text-white text-sm outline-none placeholder-border focus:glass-active transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-white/35 text-xs font-medium mb-2 uppercase tracking-wider">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError('') }}
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
                <span>Updating…</span>
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
