import { memo } from 'react'

const TONE_STYLES = {
  positive: { bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.25)', button: 'rgba(74,222,128,0.16)', text: '#4ade80' },
  neutral:  { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.10)', button: 'rgba(255,255,255,0.10)', text: 'rgba(255,255,255,0.8)' },
  nudge:    { bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.22)', button: 'rgba(251,191,36,0.14)', text: '#fbbf24' },
}

function DailyInsightModal({ insight, onClose }) {
  const open = !!insight
  const tone = TONE_STYLES[insight?.tone] || TONE_STYLES.neutral

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        }}
        onClick={onClose}
      />

      <div
        className={`fixed left-1/2 top-1/2 z-50 w-[86%] max-w-[320px] rounded-3xl px-6 py-7 text-center transition-all duration-300 ease-out ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          transform: `translate(-50%, -50%) scale(${open ? 1 : 0.95})`,
          background: '#1c1c1f',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
        }}
      >
        {insight && (
          <>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
              style={{ background: tone.bg, border: `1px solid ${tone.border}` }}
            >
              {insight.emoji}
            </div>

            <p className="text-white text-base font-semibold mb-2">{insight.headline}</p>
            <p className="text-white/50 text-sm leading-relaxed mb-6">{insight.message}</p>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl text-sm font-semibold active:scale-95 transition-all"
              style={{ background: tone.button, color: tone.text }}
            >
              Got it
            </button>
          </>
        )}
      </div>
    </>
  )
}

export default memo(DailyInsightModal)
