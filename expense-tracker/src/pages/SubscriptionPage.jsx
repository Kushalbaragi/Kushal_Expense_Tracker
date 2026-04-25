import { useNavigate } from 'react-router-dom'

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function SubscriptionPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="mx-auto max-w-[480px] min-h-screen flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-12 pb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/8 transition-colors text-white">
            <BackIcon />
          </button>
          <span className="text-white text-base font-semibold">Subscription</span>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16 text-center">

          {/* Icon */}
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center mb-7"
            style={{
              background: 'rgba(74,222,128,0.10)',
              border: '1px solid rgba(74,222,128,0.22)',
              animation: 'scaleIn 0.45s cubic-bezier(0.34,1.2,0.64,1) both',
            }}
          >
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <path d="M22 6l3.8 8.2L35 15.3l-6.5 6.3 1.5 9L22 26.3l-8 4.3 1.5-9L9 15.3l9.2-1.1L22 6z"
                stroke="#4ade80" strokeWidth="1.8" strokeLinejoin="round" fill="rgba(74,222,128,0.15)"/>
            </svg>
          </div>

          {/* Plan badge */}
          <div
            className="px-4 py-1.5 rounded-full mb-4 text-xs font-semibold uppercase tracking-widest"
            style={{ background: 'rgba(74,222,128,0.12)', color: 'rgba(74,222,128,0.85)', border: '1px solid rgba(74,222,128,0.2)' }}
          >
            Free Plan
          </div>

          <h1 className="text-white text-2xl font-semibold mb-3">
            You're all set ✨
          </h1>

          <p className="text-white/40 text-sm leading-relaxed max-w-[280px] mb-8">
            Kushal Expense Tracker is completely free — no paywalls, no hidden fees, no subscriptions. Just pure, honest money tracking.
          </p>

          {/* Divider */}
          <div className="w-12 h-px mb-8" style={{ background: 'rgba(255,255,255,0.1)' }} />

          <p className="text-white/25 text-sm leading-relaxed max-w-[240px]">
            Built with <span style={{ color: 'rgba(248,113,113,0.7)' }}>♥</span> by Kushal
            <br />
            <span className="text-white/20 text-xs">crafted for real life, not the App Store</span>
          </p>
        </div>
      </div>
    </div>
  )
}
