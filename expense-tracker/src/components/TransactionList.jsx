import { useMemo } from 'react'
import TransactionItem from './TransactionItem'
import { formatCurrency, monthLabel } from '../utils/format'

function MonthGroup({ group, isOverview, isIncome, onDelete, onEdit, idx: groupIdx }) {
  const incTotal = group.txs.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0)
  const expTotal = group.txs.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0)
  const net      = incTotal - expTotal
  const typeTotal = isIncome ? incTotal : expTotal

  return (
    <div style={{ animation: 'fadeSlideUp 0.25s ease both', animationDelay: `${groupIdx * 60}ms` }}>
      {/* Month header */}
      <div className="flex items-center justify-between px-1 mb-2 mt-4 first:mt-0">
        <span className="text-white/35 text-xs font-medium uppercase tracking-wider">
          {monthLabel(group.month, group.year)}
        </span>
      </div>

      {/* Transactions for this month */}
      <div className="bg-surface rounded-xl overflow-hidden px-3">
        {group.txs.map((tx, i) => (
          <div
            key={tx.id}
            style={{ animation: 'fadeSlideUp 0.18s ease both', animationDelay: `${i * 25}ms` }}
          >
            <TransactionItem
              tx={tx}
              isIncome={isOverview ? tx.type === 'income' : isIncome}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TransactionList({
  transactions,
  activeTab,
  chartTab   = 'expense',
  selectedMonth,
  year,
  timeRange  = 'year',
  onDelete,
  onEdit,
}) {
  const isOverview = chartTab === 'overview'
  const isIncome   = activeTab === 'income'
  const now        = new Date()
  const currYear   = now.getFullYear()

  // Decide whether to group by month
  // Group when: overview mode (any range), OR timeRange is 1y/5y
  const shouldGroup = isOverview || timeRange === '5y'

  const filtered = useMemo(() => {
    return transactions
      .filter(tx => {
        // Overview shows both types; otherwise filter to activeTab
        if (!isOverview && tx.type !== activeTab) return false

        const d = new Date(tx.date)
        if (timeRange === '5y') {
          return d.getFullYear() >= currYear - 4
        }
        // 'year' range
        if (isOverview) return d.getFullYear() === year   // whole year in overview
        return d.getMonth() === selectedMonth && d.getFullYear() === year
      })
      .sort(
        (a, b) =>
          new Date(b.date) - new Date(a.date) ||
          new Date(b.createdAt) - new Date(a.createdAt),
      )
  }, [transactions, activeTab, isOverview, selectedMonth, year, timeRange])

  const groups = useMemo(() => {
    if (!shouldGroup) return null
    const map = {}
    filtered.forEach(tx => {
      const d   = new Date(tx.date)
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
      if (!map[key]) map[key] = { year: d.getFullYear(), month: d.getMonth(), txs: [] }
      map[key].txs.push(tx)
    })
    return Object.values(map).sort((a, b) =>
      b.year !== a.year ? b.year - a.year : b.month - a.month,
    )
  }, [filtered, shouldGroup])

  const count = filtered.length

  return (
    <div className="px-4 pb-28">
      <p className="text-white/25 text-xs font-medium uppercase tracking-widest mb-3 px-1">
        {count > 0 ? `${count} Transaction${count !== 1 ? 's' : ''}` : 'Transactions'}
      </p>

      {count === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
          <p className="text-white/25 text-sm">
            No {isOverview ? 'transactions' : `${activeTab}s`} for this period
          </p>
          <p className="text-white/15 text-xs mt-1">Tap + to add one</p>
        </div>
      ) : shouldGroup ? (
        <div>
          {groups.map((group, idx) => (
            <MonthGroup
              key={`${group.year}-${group.month}`}
              group={group}
              isOverview={isOverview}
              isIncome={isIncome}
              onDelete={onDelete}
              onEdit={onEdit}
              idx={idx}
            />
          ))}
        </div>
      ) : (
        <div className="bg-surface rounded-xl overflow-hidden px-3">
          {filtered.map((tx, idx) => (
            <div
              key={tx.id}
              style={{ animation: 'fadeSlideUp 0.2s ease both', animationDelay: `${idx * 30}ms` }}
            >
              <TransactionItem
                tx={tx}
                isIncome={isIncome}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
