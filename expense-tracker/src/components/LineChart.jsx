import { useState, useEffect, useId } from 'react'

const CHART_W = 300
const CHART_H = 72
const PAD_TOP  = 12
const LABEL_H  = 16

// Smooth cubic-bezier path through points
function smoothPath(pts) {
  if (pts.length < 2) return ''
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1], p1 = pts[i]
    const cpx = ((p0.x + p1.x) / 2).toFixed(1)
    d += ` C${cpx},${p0.y.toFixed(1)} ${cpx},${p1.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`
  }
  return d
}

function areaPath(pts, bottom) {
  if (pts.length < 2) return ''
  const line = smoothPath(pts)
  return `${line} L${pts[pts.length - 1].x.toFixed(1)},${bottom} L${pts[0].x.toFixed(1)},${bottom} Z`
}

export default function LineChart({ incomeData, expenseData, labels, animKey }) {
  const rawId = useId()
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, 'x')

  // Animate clip rect from scaleX(0) → scaleX(1)
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    setRevealed(false)
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setRevealed(true)))
    return () => cancelAnimationFrame(id)
  }, [animKey])

  const n = incomeData.length
  if (n < 2) return null

  const allVals = [...incomeData, ...expenseData]
  const maxVal  = Math.max(...allVals, 1)
  const stepX   = CHART_W / (n - 1)
  const bottom  = PAD_TOP + CHART_H
  const svgH    = PAD_TOP + CHART_H + LABEL_H

  function toPoints(data) {
    return data.map((v, i) => ({
      x: i * stepX,
      y: PAD_TOP + CHART_H - (v / maxVal) * CHART_H,
    }))
  }

  const incomePts  = toPoints(incomeData)
  const expensePts = toPoints(expenseData)

  const incomeLine  = smoothPath(incomePts)
  const expenseLine = smoothPath(expensePts)
  const incomeArea  = areaPath(incomePts,  bottom)
  const expenseArea = areaPath(expensePts, bottom)

  // Show label every other slot when dense
  const showLabel = i => n <= 7 || i % 2 === 0 || i === n - 1

  const clipStyle = {
    transformBox: 'fill-box',
    transformOrigin: '0% 50%',
    transform: revealed ? 'scaleX(1)' : 'scaleX(0)',
    transition: 'transform 1s cubic-bezier(0.4,0,0.2,1)',
  }

  return (
    <svg viewBox={`0 0 ${CHART_W} ${svgH}`} className="w-full" style={{ overflow: 'visible' }}>
      <defs>
        {/* Area gradients */}
        <linearGradient id={`ig-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#4ade80" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0"    />
        </linearGradient>
        <linearGradient id={`eg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f87171" stopOpacity="0.13" />
          <stop offset="100%" stopColor="#f87171" stopOpacity="0"    />
        </linearGradient>

        {/* Clip that grows left→right */}
        <clipPath id={`clip-${uid}`}>
          <rect x="-2" y="-20" width={CHART_W + 10} height={svgH + 30} style={clipStyle} />
        </clipPath>
      </defs>

      {/* Areas + lines — all clipped for the grow animation */}
      <g clipPath={`url(#clip-${uid})`}>
        <path d={incomeArea}  fill={`url(#ig-${uid})`} />
        <path d={expenseArea} fill={`url(#eg-${uid})`} />

        <path
          d={expenseLine}
          stroke="rgba(248,113,113,0.65)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={incomeLine}
          stroke="rgba(74,222,128,0.75)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* End dots */}
        <circle
          cx={incomePts[n - 1].x}  cy={incomePts[n - 1].y}
          r="2.5" fill="#4ade80"
        />
        <circle
          cx={expensePts[n - 1].x} cy={expensePts[n - 1].y}
          r="2.5" fill="#f87171"
        />

      </g>

      {/* Dotted baseline */}
      <line
        x1="0" y1={bottom} x2={CHART_W} y2={bottom}
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
        strokeDasharray="2 3"
      />

      {/* X-axis labels */}
      {labels.map((lbl, i) =>
        showLabel(i) && lbl && (
          <text
            key={i}
            x={i * stepX}
            y={svgH - 2}
            textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
            fontSize="8.5"
            fill="rgba(255,255,255,0.22)"
            fontFamily="inherit"
          >
            {lbl}
          </text>
        )
      )}

    </svg>
  )
}
