import { useEffect, useRef, useState } from 'react'

export function useCountUp(target, duration = 700) {
  const [display, setDisplay] = useState(target)
  const prev = useRef(target)
  const raf = useRef(null)

  useEffect(() => {
    const start = prev.current
    const end = target
    if (start === end) return

    if (raf.current) cancelAnimationFrame(raf.current)
    const startTime = performance.now()

    function tick(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      setDisplay(start + (end - start) * eased)
      if (progress < 1) {
        raf.current = requestAnimationFrame(tick)
      } else {
        setDisplay(end)
        prev.current = end
      }
    }

    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, duration])

  return display
}
