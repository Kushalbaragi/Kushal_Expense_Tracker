const BAR_HEIGHT  = 80
const BAR_WIDTH   = 14
const GROUP_WIDTH = BAR_WIDTH + 8

export default function BarChart({
  values,             // number[]
  labels,             // string[]
  activeIndex,        // highlighted bar (-1 = none)
  onBarClick,         // (i) => void | null
  disabledAfterIndex, // number | null — bars after this index are unclickable
  isIncome,           // bool — colour scheme
  animKey,            // changes → re-triggers bar animations
}) {
  const n          = values.length
  const maxVal     = Math.max(...values, 1)
  const totalWidth = GROUP_WIDTH * n
  const svgH       = BAR_HEIGHT + 22

  const activeColor = isIncome ? 'rgba(74,222,128,0.85)' : 'rgba(255,255,255,0.82)'
  const dimColor    = isIncome ? 'rgba(74,222,128,0.22)' : 'rgba(255,255,255,0.14)'

  return (
    <svg
      key={animKey}
      viewBox={`0 0 ${totalWidth} ${svgH}`}
      className="w-full"
      style={{ overflow: 'visible' }}
    >
      {values.map((v, i) => {
        const x       = i * GROUP_WIDTH + (GROUP_WIDTH - BAR_WIDTH) / 2
        const h       = (v / maxVal) * BAR_HEIGHT
        const isActive = i === activeIndex
        const isDisabled = disabledAfterIndex != null && i > disabledAfterIndex
        const hasData  = h > 0

        return (
          <g key={i}>
            {hasData ? (
              <rect
                x={x}
                y={BAR_HEIGHT - h}
                width={BAR_WIDTH}
                height={h}
                rx={4}
                fill={isActive ? activeColor : dimColor}
                style={{
                  cursor: (!onBarClick || isDisabled) ? 'default' : 'pointer',
                  transformBox:    'fill-box',
                  transformOrigin: '50% 100%',
                  animation: `barGrow 0.35s cubic-bezier(0.34,1.2,0.64,1) ${i * 45}ms both`,
                  transition: 'fill 0.25s ease',
                }}
                onClick={() => onBarClick && !isDisabled && onBarClick(i)}
              />
            ) : (
              <rect x={x} y={BAR_HEIGHT - 2} width={BAR_WIDTH} height={2} rx={1} fill="transparent" />
            )}

            <text
              x={x + BAR_WIDTH / 2}
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
