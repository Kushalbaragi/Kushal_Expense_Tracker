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
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
        <div className="flex items-center gap-2 px-4 pt-12 pb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/8 transition-colors text-white">
            <BackIcon />
          </button>
          <span className="text-white text-base font-semibold">Subscription</span>
        </div>

        <div className="flex-1 px-4 pb-16">

          {/* Hero */}
          <div className="text-center py-6">
            <h1 className="text-white text-2xl font-semibold mb-2">Unlock the full experience</h1>
            <p className="text-white/40 text-sm leading-relaxed max-w-[260px] mx-auto">
              Simple, honest pricing — no hidden fees, cancel anytime.
            </p>
          </div>

          {/* Feature list */}
          <div className="mb-6 px-2 space-y-2">
            {FEATURES.map(f => (
              <div key={f} className="flex items-center gap-3">
                <span className="text-green-400"><CheckIcon /></span>
                <span className="text-white/60 text-sm">{f}</span>
              </div>
            ))}
          </div>

          {/* Plans */}
          <div className="space-y-3">

            {/* Yearly */}
            <div
              className="rounded-2xl px-5 py-5 cursor-pointer active:scale-[0.98] transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-white font-semibold text-base">Yearly</p>
                  <p className="text-white/35 text-xs mt-0.5">Billed annually</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-xl">₹499</p>
                  <p className="text-white/30 text-xs">/ year</p>
                </div>
              </div>
              <div
                className="mt-3 py-[10px] rounded-xl text-center text-sm font-semibold text-white/80 transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Subscribe
              </div>
            </div>

            {/* Lifetime */}
            <div
              className="rounded-2xl px-5 py-5 cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden"
              style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.28)' }}
            >
              {/* Best value badge */}
              <div
                className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest"
                style={{ background: 'rgba(74,222,128,0.15)', color: 'rgba(74,222,128,0.9)', border: '1px solid rgba(74,222,128,0.25)' }}
              >
                Best value
              </div>

              <div className="flex items-start justify-between mb-1 pr-20">
                <div>
                  <p className="text-white font-semibold text-base">Lifetime</p>
                  <p className="text-white/35 text-xs mt-0.5">Pay once, own forever</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl" style={{ color: 'rgba(74,222,128,0.9)' }}>₹1499</p>
                  <p className="text-white/30 text-xs">one-time</p>
                </div>
              </div>
              <div
                className="mt-3 py-[10px] rounded-xl text-center text-sm font-semibold transition-all"
                style={{ background: 'rgba(74,222,128,0.14)', color: 'rgba(74,222,128,0.9)', border: '1px solid rgba(74,222,128,0.22)' }}
              >
                Get Lifetime Access
              </div>
            </div>
          </div>

          {/* Footer love note */}
          <div className="mt-10 text-center">
            <div className="w-12 h-px mx-auto mb-6" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <p className="text-white/25 text-sm leading-relaxed">
              Built with <span style={{ color: 'rgba(248,113,113,0.7)' }}>♥</span> by Kushal
              <br />
              <span className="text-white/20 text-xs">crafted for real life, not the App Store</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
