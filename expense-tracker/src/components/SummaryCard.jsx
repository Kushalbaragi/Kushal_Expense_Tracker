import { useMemo } from 'react'
import BarChart from './BarChart'
import { useCountUp } from '../hooks/useCountUp'
import {
  formatCurrency,
  getDelta,
  monthLabel,
  currentMonthYear,
} from '../utils/format'

function AnimatedAmount({ value }) {
  const animated = useCountUp(value)
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(animated)
  return <>{formatted}</>
}

export default function SummaryCard({ transactions, activeTab }) {
  const { month, year } = currentMonthYear()

  const { current, diff } = useMemo(
    () => getDelta(transactions, activeTab, month, year),
    [transactions, activeTab, month, year]
  )

  const isIncome = activeTab === 'income'
  const deltaPositive = diff >= 0
  const deltaGood = isIncome ? deltaPositive : !deltaPositive
  const deltaArrow = deltaPositive ? '↑' : '↓'
  const deltaText = diff === 0 ? null : `${deltaArrow} ${formatCurrency(Math.abs(diff))}`
  // dark green / dark red for delta
  const deltaStyle = deltaGood
    ? { color: '#16a34a' }   // dark green
    : { color: '#b91c1c' }   // dark red

  return (
    <div className="mx-4 mb-2 p-5 overflow-hidden">
      {/* Month label */}
      <p className="text-white/40 text-sm text-center mb-1">{monthLabel(month, year)}</p>

      {/* Total — white, counter animation */}
      <p className="text-4xl font-semibold text-center tracking-tight text-white mb-1">
        <AnimatedAmount value={current} />
      </p>

      {/* Delta — small, dark green/red, no "from last month" */}
      <p className="text-xs text-center mb-5" style={deltaText ? deltaStyle : { color: 'rgba(255,255,255,0.25)' }}>
        {deltaText ?? '—'}
      </p>

      {/* Bar chart — single type based on active tab */}
      <BarChart
        transactions={transactions}
        activeMonth={month}
        year={year}
        activeTab={activeTab}
      />
    </div>
  )
}
