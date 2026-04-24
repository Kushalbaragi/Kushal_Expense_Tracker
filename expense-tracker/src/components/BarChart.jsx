import { useMemo } from 'react'
import { getMonthlyTotals, monthShortLabel } from '../utils/format'

const BAR_HEIGHT = 80
const BAR_WIDTH = 14
const GROUP_WIDTH = BAR_WIDTH + 8
const MONTHS = 12

export default function BarChart({ transactions, activeMonth, year, activeTab }) {
  const { income, expense } = useMemo(
    () => getMonthlyTotals(transactions, year),
    [transactions, year]
  )

  const values = activeTab === 'income' ? income : expense
  const maxVal = Math.max(...values, 1)
  const totalWidth = GROUP_WIDTH * MONTHS
  const svgH = BAR_HEIGHT + 24

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${svgH}`}
      className="w-full"
      style={{ overflow: 'visible' }}
    >
      {Array.from({ length: MONTHS }, (_, i) => {
        const x = i * GROUP_WIDTH + (GROUP_WIDTH - BAR_WIDTH) / 2
        const h = (values[i] / maxVal) * BAR_HEIGHT
        const isActive = i === activeMonth
        const fill = isActive ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.18)'

        return (
          <g key={i}>
            <rect
              x={x}
              y={BAR_HEIGHT - h}
              width={BAR_WIDTH}
              height={Math.max(h, 2)}
              rx={4}
              fill={fill}
              style={{ transition: 'height 0.5s cubic-bezier(0.34,1.56,0.64,1), y 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}
            />
            <text
              x={x + BAR_WIDTH / 2}
              y={BAR_HEIGHT + 16}
              textAnchor="middle"
              fontSize="9"
              fill={isActive ? '#fff' : 'rgba(255,255,255,0.3)'}
              fontFamily="Inter, sans-serif"
              fontWeight={isActive ? '600' : '400'}
            >
              {monthShortLabel(i)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
