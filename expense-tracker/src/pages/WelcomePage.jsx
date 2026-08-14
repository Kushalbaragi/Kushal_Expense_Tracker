import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from '../hooks/useSubscription'
import { PRICE_PER_YEAR, getSubscriptionDisplayStatus, formatChargeDate } from '../utils/trial'
import { today } from '../utils/format'

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="#4ade80" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function Feature({ children }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(74,222,128,0.12)' }}>
        <CheckIcon />
      </span>
      <span className="text-white/60 text-[13px]">{children}</span>
    </div>
  )
}

const FEATURES = [
  'Unlimited transaction history',
  'Spending calendar & insights',
  'Priority support',
]

function SubscribedModal({ chargeDate, onContinue }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div
        className="w-full max-w-[340px] rounded-3xl px-6 py-8 text-center"
        style={{ background: '#1c1c1f', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.55)' }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)' }}
        >
          <svg width="26" height="26" viewBox="0 0 36 36" fill="none">
            <path d="M6 18l8 8L30 10" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-white text-lg font-semibold mb-2">Thank you — you're all set!</p>
        <p className="text-white/45 text-sm leading-relaxed mb-6">
          Your 30-day free trial has started. You'll be charged ₹{PRICE_PER_YEAR} on {chargeDate}, unless you cancel before then.
          You can cancel anytime from Menu → Subscription.
        </p>
        <button
          onClick={onContinue}
          className="w-full py-[13px] rounded-2xl text-sm font-semibold active:scale-95 transition-all"
          style={{ background: 'rgba(74,222,128,0.25)', color: '#4ade80' }}
        >
          Start Tracking
        </button>
      </div>
    </div>
  )
}

function WelcomeModal({ name, onContinue }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div
        className="w-full max-w-[320px] rounded-3xl px-6 py-8 text-center"
        style={{ background: '#1c1c1f', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.55)' }}
      >
        <div className="text-4xl mb-4">🎉</div>
        <p className="text-white text-lg font-semibold mb-2">Welcome, {name}!</p>
        <p className="text-white/45 text-sm leading-relaxed mb-6">Your money, beautifully tracked. Let's get your account set up.</p>
        <button
          onClick={onContinue}
          className="w-full py-[13px] rounded-2xl text-sm font-semibold glass-active text-white active:scale-95 transition-all"
        >
          Start Tracking
        </button>
      </div>
    </div>
  )
}

export default function WelcomePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { subscription, starting, error, startTrial } = useSubscription(user)
  const [showWelcome, setShowWelcome] = useState(true)
  const firstName = (profile?.name || 'there').split(' ')[0]

  const trialInfo = subscription ? getSubscriptionDisplayStatus(subscription, today()) : null
  const subscribed = trialInfo && trialInfo.status !== 'not_started'

  // Wait for the session restore to finish before deciding — otherwise a
  // fresh load of this URL (refresh, bookmark) sees `user` as null before
  // Supabase has had a chance to rehydrate it, and gets bounced to /login
  // even when a valid session exists.
  if (authLoading) return null
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-bg font-sans flex flex-col items-center justify-center px-6 text-center">
      {showWelcome && <WelcomeModal name={firstName} onContinue={() => setShowWelcome(false)} />}
      {!showWelcome && subscribed && (
        <SubscribedModal
          chargeDate={formatChargeDate(trialInfo.chargeDate)}
          onContinue={() => navigate('/', { replace: true })}
        />
      )}

      <div className="w-full max-w-[380px]">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl"
          style={{ background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.20)' }}
        >
          ✨
        </div>
        <p className="text-white text-xl font-semibold tracking-tight mb-2">Start your 30-day free trial</p>
        <p className="text-white/40 text-sm mb-8 leading-relaxed">
          Full access to Okana Plus, free for 30 days. We'll ask for a payment method now, but you won't be
          charged ₹{PRICE_PER_YEAR} until your trial ends — cancel anytime before then.
        </p>

        <div className="flex flex-col gap-2.5 mb-8 text-left max-w-[240px] mx-auto">
          {FEATURES.map(f => <Feature key={f}>{f}</Feature>)}
        </div>

        {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

        <button
          onClick={startTrial}
          disabled={starting}
          className="w-full py-[14px] rounded-2xl text-sm font-semibold active:scale-95 transition-all disabled:opacity-50"
          style={{ background: 'rgba(74,222,128,0.25)', color: '#4ade80' }}
        >
          {starting ? 'Starting…' : 'Start Free Trial'}
        </button>
      </div>
    </div>
  )
}
