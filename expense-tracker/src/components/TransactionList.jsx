import { useMemo } from 'react'
import TransactionItem from './TransactionItem'

export default function TransactionList({
  transactions,
  activeTab,
  selectedMonth,
  year,
  timeRange = 'year',
  onDelete,
  onEdit,
}) {
  const filtered = useMemo(() => {
    const now      = new Date()
    const currYear = now.getFullYear()

    return transactions
      .filter(tx => {
        if (tx.type !== activeTab) return false
        const d = new Date(tx.date)

        if (timeRange === '1y') {
          // Rolling last 12 months
          const cutoff = new Date(now.getFullYear(), now.getMonth() - 11, 1)
          return d >= cutoff
        }
        if (timeRange === '5y') {
          return d.getFullYear() >= currYear - 4
        }
        // 'year': selected month in current year
        return d.getMonth() === selectedMonth && d.getFullYear() === year
      })
      .sort(
        (a, b) =>
          new Date(b.date) - new Date(a.date) ||
          new Date(b.createdAt) - new Date(a.createdAt),
      )
  }, [transactions, activeTab, selectedMonth, year, timeRange])

  const isIncome = activeTab === 'income'
  const count    = filtered.length

  return (
    <div className="px-4 pb-28">
      {/* Section title with live count */}
      <p className="text-white/25 text-xs font-medium uppercase tracking-widest mb-3 px-1">
        {count > 0 ? `${count} Transaction${count !== 1 ? 's' : ''}` : 'Transactions'}
      </p>

      {count === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
          <p className="text-white/25 text-sm">No {activeTab}s for this period</p>
          <p className="text-white/15 text-xs mt-1">Tap + to add one</p>
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
