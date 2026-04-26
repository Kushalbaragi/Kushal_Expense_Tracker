import { useNavigate } from 'react-router-dom'

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function SubscriptionPage({ onBack }) {
  const navigate = useNavigate()
  const handleBack = () => onBack ? onBack() : navigate(-1)

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="mx-auto max-w-[480px] min-h-screen flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-12 pb-2">
          <button onClick={handleBack} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/8 transition-colors text-white">
            <BackIcon />
          </button>
          <span className="text-white text-base font-semibold">Subscription</span>
        </div>

        <div className="flex-1 px-5 pb-16 flex flex-col gap-3 pt-6">

          {/* Free Trial */}
          <div
            className="rounded-2xl px-5 py-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium text-[15px]">Free Trial</p>
                <p className="text-white/35 text-xs mt-0.5">Currently active</p>
              </div>
              <span
                className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }}
              >
                Active
              </span>
            </div>
          </div>

          {/* Yearly */}
          <div
            className="rounded-2xl px-5 py-4 cursor-pointer active:scale-[0.99] transition-transform"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white font-medium text-[15px]">Yearly</p>
                <p className="text-white/35 text-xs mt-0.5">₹499 / year</p>
              </div>
              <p className="text-white font-semibold text-xl">₹499</p>
            </div>
            <button
              className="w-full py-[11px] rounded-xl text-sm font-medium text-white/70 transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            >
              Subscribe
            </button>
          </div>

          {/* Lifetime */}
          <div
            className="rounded-2xl px-5 py-4 cursor-pointer active:scale-[0.99] transition-transform"
            style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.18)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white font-medium text-[15px]">Lifetime</p>
                <p className="text-white/35 text-xs mt-0.5">One-time purchase</p>
              </div>
              <p className="font-semibold text-xl" style={{ color: 'rgba(74,222,128,0.9)' }}>₹1499</p>
            </div>
            <button
              className="w-full py-[11px] rounded-xl text-sm font-medium transition-all active:scale-95"
              style={{ background: 'rgba(74,222,128,0.10)', color: 'rgba(74,222,128,0.9)' }}
            >
              Get Lifetime Access
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
