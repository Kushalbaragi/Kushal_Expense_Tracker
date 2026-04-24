import { useMemo } from 'react'
import BarChart from './BarChart'
import {
  formatCurrency,
  getDelta,
  getMonthTotal,
  monthLabel,
} from '../utils/format'

const fmt = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR',
  minimumFractionDigits: 2, maximumFractionDigits: 2,
})

function AnimatedAmount({ value }) {
  const str = fmt.format(value)
  // key changes whenever formatted string changes → re-mounts → re-animates
  return (
    <span key={str} aria-label={str}>
      {[...str].map((char, i) => (
        <span
          key={i}
          className={/\s/.test(char) ? 'inline-block w-[0.3ch]' : 'digit-up inline-block'}
          style={{ animationDelay: `${i * 30}ms` }}
        >
          {char}
        </span>
      ))}
    </span>
  )
}

export default function SummaryCard({ transactions, activeTab, selectedMonth, year, onMonthChange }) {
  const current = useMemo(
    () => getMonthTotal(transactions, activeTab, selectedMonth, year),
    [transactions, activeTab, selectedMonth, year]
  )

  const { diff } = useMemo(
    () => getDelta(transactions, activeTab, selectedMonth, year),
    [transactions, activeTab, selectedMonth, year]
  )

  const isIncome = activeTab === 'income'
  const deltaPositive = diff >= 0
  const deltaGood = isIncome ? deltaPositive : !deltaPositive
  const arrow = diff === 0 ? null : (deltaPositive ? '↑' : '↓')
  const deltaText = diff === 0 ? null : formatCurrency(Math.abs(diff))
  const deltaStyle = deltaGood ? { color: '#16a34a' } : { color: '#b91c1c' }

  return (
    <div className="mx-4 mb-2 p-5 overflow-hidden">
      <p className="text-white/40 text-sm text-center mb-1">
        {monthLabel(selectedMonth, year)}
      </p>

      {/* Amount row: centered amount + right-side arrow */}
      <div className="relative flex items-center justify-center mb-1">
        <p className="text-4xl font-semibold tracking-tight text-white">
          <AnimatedAmount value={current} />
        </p>
        {arrow && (
          <span
            className="absolute right-0 text-lg font-normal"
            style={deltaStyle}
          >
            {arrow}
          </span>
        )}
      </div>

      {/* Delta amount — small, below */}
      <p className="text-xs text-center mb-5"
        style={deltaText ? deltaStyle : { color: 'rgba(255,255,255,0.2)' }}>
        {deltaText ?? '—'}
      </p>

      <BarChart
        transactions={transactions}
        activeMonth={selectedMonth}
        year={year}
        activeTab={activeTab}
        onMonthClick={onMonthChange}
      />
    </div>
  )
}
