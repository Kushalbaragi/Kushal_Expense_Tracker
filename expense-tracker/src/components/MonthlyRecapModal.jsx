import { useEffect, useRef, useState } from 'react'

const SLIDE_MS = 6000

const TONE = {
  positive: { ring: '#4ade80', glow: 'rgba(74,222,128,0.16)' },
  neutral:  { ring: 'rgba(255,255,255,0.5)', glow: 'rgba(255,255,255,0.06)' },
  nudge:    { ring: '#fbbf24', glow: 'rgba(251,191,36,0.14)' },
}

export default function MonthlyRecapModal({ open, slides, monthLabel, onClose }) {
  const [index, setIndex] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (open) setIndex(0)
  }, [open])

  useEffect(() => {
    if (!open || !slides.length) return
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (index >= slides.length - 1) onClose()
      else setIndex(index + 1)
    }, SLIDE_MS)
    return () => clearTimeout(timerRef.current)
  }, [open, index, slides.length, onClose])

  if (!open || !slides.length) return null

  const slide = slides[index]
  const tone  = TONE[slide.tone] || TONE.neutral

  function goTo(i) {
    if (i < 0 || i >= slides.length) { onClose(); return }
    setIndex(i)
  }

  function handleTap(e) {
    const x = e.clientX
    if (x < window.innerWidth / 2) goTo(index - 1)
    else goTo(index + 1)
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col"
      style={{
        background: `radial-gradient(circle at 50% 25%, ${tone.glow}, #050505 60%)`,
        backdropFilter: 'blur(60px) saturate(140%)',
        WebkitBackdropFilter: 'blur(60px) saturate(140%)',
      }}
    >
      <div className="flex gap-1.5 px-3 pt-4">
        {slides.map((s, i) => (
          <div
            key={`track-${i}`}
            className="flex-1 h-[3px] rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.22)' }}
          >
            <div
              key={`bar-${i}-${index}`}
              className="h-full rounded-full"
              style={{
                background: 'white',
                width: i < index ? '100%' : i > index ? '0%' : undefined,
                animation: i === index ? `progressFill ${SLIDE_MS}ms linear forwards` : 'none',
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 pt-3">
        <p className="text-white/50 text-xs font-semibold tracking-wide">{monthLabel} Recap</p>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center text-white/60 active:scale-90 transition-transform"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1 relative" onClick={handleTap}>
        <div
          key={slide.key}
          className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
          style={{ animation: 'fadeSlideUp 0.3s ease both' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-6"
            style={{ background: tone.glow, border: `1px solid ${tone.ring}55` }}
          >
            {slide.emoji}
          </div>
          <p className="text-white/40 text-xs font-semibold tracking-wider uppercase mb-3">{slide.kicker}</p>
          <p className="text-white text-5xl font-bold tracking-tight mb-3">{slide.value}</p>
          <p className="text-white/70 text-base font-medium mb-2">{slide.headline}</p>
          <p className="text-white/45 text-sm leading-relaxed max-w-[280px]">{slide.message}</p>
        </div>
      </div>
    </div>
  )
}
