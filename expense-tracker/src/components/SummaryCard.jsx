import { useMemo } from 'react'
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

export default function SummaryCard({
  transactions,
  chartTab,           // 'expense'|'income'|'overview' — from Dashboard
  timeRange,          // 'year'|'1y'|'5y' — from Dashboard
  onTimeRangeChange,
  selectedMonth,
  year,
  onMonthChange,
}) {
  const { year: currYear } = currentMonthYear()

  // ── Chart data ────────────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    if (timeRange === '1y') return getRolling12Months(transactions)
    if (timeRange === '5y') return getYearlyTotals(transactions, currYear, 5)
    const { income, expense } = getMonthlyTotals(transactions, year)
    return { income, expense, labels: MONTH_LABELS_SHORT }
  }, [transactions, timeRange, year, currYear])

  const barValues = chartTab === 'income' ? chartData.income : chartData.expense

  const disabledAfterIndex = useMemo(() => {
    if (timeRange !== 'year') return null
    if (year < currYear)  return null
    if (year > currYear)  return -1
    return new Date().getMonth()
  }, [timeRange, year, currYear])

  // ── Amount ────────────────────────────────────────────────────────────────
  const displayAmount = useMemo(() => {
    if (chartTab === 'overview') {
      const inc = chartData.income.reduce((a, b) => a + b, 0)
      const exp = chartData.expense.reduce((a, b) => a + b, 0)
      return inc - exp
    }
    if (timeRange === 'year') return getMonthTotal(transactions, chartTab, selectedMonth, year)
    const arr = chartTab === 'income' ? chartData.income : chartData.expense
    return arr.reduce((a, b) => a + b, 0)
  }, [chartTab, chartData, timeRange, transactions, selectedMonth, year])

  // ── Delta (year range only) ───────────────────────────────────────────────
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
  const deltaStyle    = deltaGood ? { color: 'rgba(74,222,128,0.9)' } : { color: 'rgba(248,113,113,0.9)' }

  const periodLabel = useMemo(() => {
    if (timeRange === 'year') return monthLabel(selectedMonth, year)
    if (timeRange === '1y')   return 'Last 12 months'
    return `${currYear - 4} – ${currYear}`
  }, [timeRange, selectedMonth, year, currYear])

  // Trim line chart to current month for year range
  const lineChartData = useMemo(() => {
    if (timeRange !== 'year' || year < currYear) return chartData
    const end = new Date().getMonth() + 1
    return {
      income:  chartData.income.slice(0, end),
      expense: chartData.expense.slice(0, end),
      labels:  chartData.labels.slice(0, end),
    }
  }, [chartData, timeRange, year, currYear])

  const animKey = `${chartTab}-${timeRange}-${year}`

  return (
    <div className="mx-4 mb-2 p-5 overflow-hidden">

      <p className="text-white/40 text-sm text-center mb-1">{periodLabel}</p>

      <div className="relative flex items-center justify-center mb-1">
        <p
          className="text-4xl font-semibold tracking-tight"
          style={{ color: isOverview ? (netPositive ? '#4ade80' : '#f87171') : 'white' }}
        >
          <AnimatedAmount value={Math.abs(displayAmount)} />
        </p>
      </div>

      <div
        className="flex items-center justify-center gap-[3px] mb-5 text-xs"
        style={
          isOverview
            ? { color: netPositive ? 'rgba(74,222,128,0.7)' : 'rgba(248,113,113,0.7)' }
            : deltaText ? deltaStyle : { color: 'rgba(255,255,255,0.2)' }
        }
      >
        {isOverview ? null : deltaText ? (
          <>
            <AnimatedDelta text={deltaText} />
            {arrow && <span className="text-xs font-medium leading-none">{arrow}</span>}
          </>
        ) : (
          <span>—</span>
        )}
      </div>

      {isOverview ? (
        <LineChart
          key={animKey}
          incomeData={lineChartData.income}
          expenseData={lineChartData.expense}
          labels={lineChartData.labels}
          animKey={animKey}
        />
      ) : (
        <BarChart
          values={barValues}
          labels={chartData.labels}
          activeIndex={timeRange === 'year' ? selectedMonth : -1}
          onBarClick={timeRange === 'year' ? onMonthChange : null}
          disabledAfterIndex={disabledAfterIndex}
          isIncome={isIncome}
          animKey={animKey}
          labelStep={timeRange === '1y' ? 2 : 1}
        />
      )}

      <RangeSelector value={timeRange} onChange={onTimeRangeChange} currentYear={currYear} />
    </div>
  )
}
