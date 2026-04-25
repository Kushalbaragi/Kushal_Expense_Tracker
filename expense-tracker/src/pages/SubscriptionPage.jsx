import { useNavigate } from 'react-router-dom'

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M2 6.5l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const FEATURES = [
  'Unlimited transactions',
  'Charts & spending insights',
  'CSV export',
  'Cloud sync across devices',
  'Priority support',
]

export default function SubscriptionPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="mx-auto max-w-[480px] min-h-screen flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-12 pb-2">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/8 transition-colors text-white">
            <BackIcon />
          </button>
          <span className="text-white text-base font-semibold">Subscription</span>
        </div>

        <div className="flex-1 px-5 pb-16 flex flex-col">

          {/* Hero */}
          <div className="py-8 text-center">
            <p className="text-white/30 text-xs font-medium uppercase tracking-widest mb-3">Choose your plan</p>
            <h1 className="text-white text-[26px] font-semibold leading-tight mb-3">
              Simple,<br/>honest pricing.
            </h1>
            <p className="text-white/35 text-sm leading-relaxed">
              Everything you need to track money well.
            </p>
          </div>

          {/* Features */}
          <div className="mb-8 space-y-3">
            {FEATURES.map(f => (
              <div key={f} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-green-400" style={{ background: 'rgba(74,222,128,0.1)' }}>
                  <CheckIcon />
                </span>
                <span className="text-white/55 text-sm">{f}</span>
              </div>
            ))}
          </div>

          {/* Plans */}
          <div className="space-y-3">

            {/* Yearly */}
            <div
              className="rounded-2xl px-5 py-4 cursor-pointer active:scale-[0.98] transition-transform"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white font-semibold text-[15px]">Yearly</p>
                  <p className="text-white/30 text-xs mt-0.5">Billed once a year</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-2xl">₹499</p>
                  <p className="text-white/25 text-xs">per year</p>
                </div>
              </div>
              <button className="w-full py-3 rounded-xl text-sm font-semibold text-white/70 transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Subscribe
              </button>
            </div>

            {/* Lifetime */}
            <div
              className="rounded-2xl px-5 py-4 cursor-pointer active:scale-[0.98] transition-transform"
              style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.22)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white font-semibold text-[15px]">Lifetime</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-white/30 text-xs">Pay once, own forever</p>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(74,222,128,0.14)', color: 'rgba(74,222,128,0.85)' }}
                    >
                      Best value
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-2xl" style={{ color: 'rgba(74,222,128,0.9)' }}>₹1499</p>
                  <p className="text-white/25 text-xs">one-time</p>
                </div>
              </div>
              <button className="w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={{ background: 'rgba(74,222,128,0.13)', color: 'rgba(74,222,128,0.9)', border: '1px solid rgba(74,222,128,0.2)' }}>
                Get Lifetime Access
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-10 text-center">
            <div className="w-10 h-px mx-auto mb-6" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <p className="text-white/20 text-sm">
              Built with <span style={{ color: 'rgba(248,113,113,0.65)' }}>♥</span> by Kushal
            </p>
            <p className="text-white/15 text-xs mt-1">crafted for real life, not the App Store</p>
          </div>
        </div>
      </div>
    </div>
  )
}
