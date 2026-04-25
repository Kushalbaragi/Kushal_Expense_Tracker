import { useMemo, useState, useEffect } from 'react'
import BarChart  from './BarChart'
import LineChart from './LineChart'
import {
  formatCurrency,
  getDelta,
  getMonthTotal,
  getMonthlyTotals,
  getRolling12Months,
  getYearlyTotals,
  monthLabel,
  currentMonthYear,
} from '../utils/format'

const MONTH_LABELS_SHORT = ['J','F','M','A','M','J','J','A','S','O','N','D']

const fmt = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR',
  minimumFractionDigits: 2, maximumFractionDigits: 2,
})

// Digit-by-digit slot animation for the main amount
function AnimatedAmount({ value }) {
  const str = fmt.format(value)
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

function AnimatedDelta({ text }) {
  return (
    <span key={text} aria-label={text}>
      {[...text].map((char, i) => (
        <span
          key={i}
          className={/\s/.test(char) ? 'inline-block w-[0.25ch]' : 'digit-up inline-block'}
          style={{ animationDelay: `${i * 25}ms` }}
        >
          {char}
        </span>
      ))}
    </span>
  )
}

// Small 3-segment pill toggle
function ChartTabToggle({ value, onChange }) {
  const tabs = ['expense', 'income', 'overview']
  const idx  = tabs.indexOf(value)
  return (
    <div className="relative flex glass rounded-full p-[3px] mx-auto w-fit mb-4">
      {/* sliding pill */}
      <div
        className="absolute top-[3px] bottom-[3px] rounded-full glass-active"
        style={{
          width:      'calc(33.333% - 2px)',
          left:       `calc(${idx * 33.333}% + 3px)`,
          transition: 'left 0.22s cubic-bezier(0.4,0,0.2,1)',
        }}
      />
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`relative z-10 px-4 py-[5px] rounded-full text-[11px] font-medium transition-colors duration-200 ${
            value === tab ? 'text-white' : 'text-white/35 hover:text-white/60'
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  )
}

// Time range pill selector
function RangeSelector({ value, onChange, currentYear }) {
  const options = [
    { id: 'year', label: String(currentYear) },
    { id: '1y',   label: '1Y' },
    { id: '5y',   label: '5Y' },
  ]
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-200 ${
            value === opt.id
              ? 'glass-active text-white'
              : 'text-white/30 hover:text-white/55'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default function SummaryCard({ transactions, activeTab, selectedMonth, year, onMonthChange }) {
  const { year: currYear } = currentMonthYear()

  // Internal chart tab — syncs with parent activeTab for expense/income
  const [chartTab,  setChartTab]  = useState(activeTab) // 'expense'|'income'|'overview'
  const [timeRange, setTimeRange] = useState('year')    // 'year'|'1y'|'5y'

  useEffect(() => {
    if (chartTab !== 'overview') setChartTab(activeTab)
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Compute chart data ────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    if (timeRange === '1y') return getRolling12Months(transactions)
    if (timeRange === '5y') return getYearlyTotals(transactions, currYear, 5)
    // 'year': standard 12-month view
    const { income, expense } = getMonthlyTotals(transactions, year)
    return { income, expense, labels: MONTH_LABELS_SHORT }
  }, [transactions, timeRange, year, currYear])

  // ── Values for BarChart ───────────────────────────────────────────────────
  const barValues = chartTab === 'income' ? chartData.income : chartData.expense
  const barLabels = chartData.labels

  // For 'year' range: disable bars after current month (future)
  const disabledAfterIndex = useMemo(() => {
    if (timeRange !== 'year') return null
    if (year < currYear)  return null   // past year — all enabled
    if (year > currYear)  return -1     // future year — all disabled
    return new Date().getMonth()        // current year — disable future months
  }, [timeRange, year, currYear])

  // ── Amount display ────────────────────────────────────────────────────────
  const displayAmount = useMemo(() => {
    if (chartTab === 'overview') {
      const incTotal = chartData.income.reduce((a, b) => a + b, 0)
      const expTotal = chartData.expense.reduce((a, b) => a + b, 0)
      return incTotal - expTotal   // net savings (can be negative)
    }
    if (timeRange === 'year') {
      return getMonthTotal(transactions, chartTab, selectedMonth, year)
    }
    const arr = chartTab === 'income' ? chartData.income : chartData.expense
    return arr.reduce((a, b) => a + b, 0)
  }, [chartTab, chartData, timeRange, transactions, selectedMonth, year])

  // Delta (only for year range + expense/income tab)
  const delta = useMemo(() => {
    if (chartTab === 'overview' || timeRange !== 'year') return null
    return getDelta(transactions, chartTab, selectedMonth, year)
  }, [chartTab, timeRange, transactions, selectedMonth, year])

  const isIncome    = chartTab === 'income'
  const isOverview  = chartTab === 'overview'
  const netPositive = displayAmount >= 0

  const deltaPositive = delta && delta.diff >= 0
  const deltaGood     = isIncome ? deltaPositive : !deltaPositive
  const arrow         = delta && delta.diff !== 0 ? (deltaPositive ? '↑' : '↓') : null
  const deltaText     = delta && delta.diff !== 0 ? formatCurrency(Math.abs(delta.diff)) : null
  const deltaStyle    = deltaGood ? { color: '#16a34a' } : { color: '#b91c1c' }

  // Period label
  const periodLabel = useMemo(() => {
    if (timeRange === 'year')  return monthLabel(selectedMonth, year)
    if (timeRange === '1y')    return 'Last 12 months'
    return `${currYear - 4} – ${currYear}`
  }, [timeRange, selectedMonth, year, currYear])

  // animKey: changing this re-triggers chart entrance animations
  const animKey = `${chartTab}-${timeRange}-${year}`

  return (
    <div className="mx-4 mb-2 p-5 overflow-hidden">

      {/* 3-way chart tab toggle */}
      <ChartTabToggle value={chartTab} onChange={setChartTab} />

      {/* Period label */}
      <p className="text-white/40 text-sm text-center mb-1">{periodLabel}</p>

      {/* Amount */}
      <div className="relative flex items-center justify-center mb-1">
        <p
          className="text-4xl font-semibold tracking-tight"
          style={{ color: isOverview ? (netPositive ? '#4ade80' : '#f87171') : 'white' }}
        >
          <AnimatedAmount value={Math.abs(displayAmount)} />
        </p>
      </div>

      {/* Delta row */}
      <div
        className="flex items-center justify-center gap-[3px] mb-5 text-xs"
        style={
          isOverview
            ? { color: netPositive ? 'rgba(74,222,128,0.7)' : 'rgba(248,113,113,0.7)' }
            : deltaText
              ? deltaStyle
              : { color: 'rgba(255,255,255,0.2)' }
        }
      >
        {isOverview ? (
          <span className="text-xs">{netPositive ? 'Net savings' : 'Net deficit'}</span>
        ) : deltaText ? (
          <>
            <AnimatedDelta text={deltaText} />
            {arrow && <span className="text-xs font-medium leading-none">{arrow}</span>}
          </>
        ) : (
          <span>—</span>
        )}
      </div>

      {/* Chart */}
      {isOverview ? (
        <LineChart
          key={animKey}
          incomeData={chartData.income}
          expenseData={chartData.expense}
          labels={chartData.labels}
          animKey={animKey}
        />
      ) : (
        <BarChart
          values={barValues}
          labels={barLabels}
          activeIndex={timeRange === 'year' ? selectedMonth : -1}
          onBarClick={timeRange === 'year' ? onMonthChange : null}
          disabledAfterIndex={disabledAfterIndex}
          isIncome={isIncome}
          animKey={animKey}
        />
      )}

      {/* Time range selector */}
      <RangeSelector value={timeRange} onChange={setTimeRange} currentYear={currYear} />
    </div>
  )
}
