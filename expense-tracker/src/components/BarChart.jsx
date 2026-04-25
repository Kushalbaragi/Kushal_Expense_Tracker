const BAR_HEIGHT = 80
const CHART_W    = 264  // constant viewBox width — keeps all ranges visually consistent

export default function BarChart({
  values,
  labels,
  activeIndex,
  onBarClick,
  disabledAfterIndex,
  isIncome,
  animKey,
}) {
  const n       = values.length
  const GROUP_W = CHART_W / n
  // Bar width fills ~55% of its slot, capped so it never looks out of proportion
  const BAR_W   = Math.min(16, Math.max(6, GROUP_W - 10))
  const maxVal  = Math.max(...values, 1)
  const svgH    = BAR_HEIGHT + 22

  const activeColor = isIncome ? 'rgba(74,222,128,0.85)' : 'rgba(255,255,255,0.82)'
  const dimColor    = isIncome ? 'rgba(74,222,128,0.22)' : 'rgba(255,255,255,0.14)'

  return (
    <svg
      key={animKey}
      viewBox={`0 0 ${CHART_W} ${svgH}`}
      className="w-full"
      style={{ overflow: 'visible' }}
    >
      {values.map((v, i) => {
        const x          = i * GROUP_W + (GROUP_W - BAR_W) / 2
        const h          = (v / maxVal) * BAR_HEIGHT
        const isActive   = i === activeIndex
        const isDisabled = disabledAfterIndex != null && i > disabledAfterIndex
        const hasData    = h > 0

        return (
          <g key={i}>
            {hasData ? (
              <rect
                x={x}
                y={BAR_HEIGHT - h}
                width={BAR_W}
                height={h}
                rx={BAR_W / 3}
                fill={isActive ? activeColor : dimColor}
                style={{
                  cursor:          (!onBarClick || isDisabled) ? 'default' : 'pointer',
                  transformBox:    'fill-box',
                  transformOrigin: '50% 100%',
                  animation:       `barGrow 0.35s cubic-bezier(0.34,1.2,0.64,1) ${i * 45}ms both`,
                  transition:      'fill 0.25s ease',
                }}
                onClick={() => onBarClick && !isDisabled && onBarClick(i)}
              />
            ) : (
              <rect x={x} y={BAR_HEIGHT - 2} width={BAR_W} height={2} rx={1} fill="transparent" />
            )}

            <text
              x={x + BAR_W / 2}
              y={BAR_HEIGHT + 15}
              textAnchor="middle"
              fontSize="9"
              fill={isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.22)'}
              fontFamily="Inter, sans-serif"
              fontWeight={isActive ? '600' : '400'}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {labels[i]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
