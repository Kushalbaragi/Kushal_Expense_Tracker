import { useMemo } from 'react'
import { getMonthlyTotals, monthShortLabel } from '../utils/format'

const BAR_HEIGHT = 80
const BAR_WIDTH = 14
const GROUP_WIDTH = BAR_WIDTH + 8
const MONTHS = 12

export default function BarChart({ transactions, activeMonth, year, activeTab, onMonthClick }) {
  const { income, expense } = useMemo(
    () => getMonthlyTotals(transactions, year),
    [transactions, year]
  )

  const values = activeTab === 'income' ? income : expense
  const maxVal = Math.max(...values, 1)
  const totalWidth = GROUP_WIDTH * MONTHS
  const svgH = BAR_HEIGHT + 22

  const currMonth = new Date().getMonth()
  const currYear = new Date().getFullYear()

  const activeColor = activeTab === 'income' ? 'rgba(74,222,128,0.85)' : 'rgba(255,255,255,0.82)'
  const dimColor   = activeTab === 'income' ? 'rgba(74,222,128,0.22)' : 'rgba(255,255,255,0.14)'

  // key changes on activeTab/year → remounts SVG → re-triggers bar animations
  const animKey = `${activeTab}-${year}`

  return (
    <svg key={animKey} viewBox={`0 0 ${totalWidth} ${svgH}`} className="w-full" style={{ overflow: 'visible' }}>
      {Array.from({ length: MONTHS }, (_, i) => {
        const x = i * GROUP_WIDTH + (GROUP_WIDTH - BAR_WIDTH) / 2
        const h = (values[i] / maxVal) * BAR_HEIGHT
        const isActive = i === activeMonth
        // future months (relative to current year) are not clickable
        const isFuture = year >= currYear && i > currMonth
        const hasData = h > 0

        return (
          <g key={i}>
            {/* bar — only clickable past/current months that have data */}
            {hasData ? (
              <rect
                x={x}
                y={BAR_HEIGHT - h}
                width={BAR_WIDTH}
                height={h}
                rx={4}
                fill={isActive ? activeColor : dimColor}
                style={{
                  cursor: isFuture ? 'default' : 'pointer',
                  transformBox: 'fill-box',
                  transformOrigin: '50% 100%',
                  animation: `barGrow 0.35s cubic-bezier(0.34,1.2,0.64,1) ${i * 45}ms both`,
                  transition: 'fill 0.25s ease',
                }}
                onClick={() => !isFuture && onMonthClick?.(i)}
              />
            ) : (
              /* placeholder tap area so layout stays consistent */
              <rect x={x} y={BAR_HEIGHT - 2} width={BAR_WIDTH} height={2} rx={1} fill="transparent" />
            )}

            {/* month label — not clickable */}
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
              {monthShortLabel(i)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
