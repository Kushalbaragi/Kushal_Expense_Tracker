import { useMemo } from 'react'
import TransactionItem from './TransactionItem'

export default function TransactionList({ transactions, activeTab, selectedMonth, year, onDelete, onEdit }) {
  const filtered = useMemo(() =>
    transactions
      .filter(tx => {
        if (tx.type !== activeTab) return false
        const d = new Date(tx.date)
        return d.getMonth() === selectedMonth && d.getFullYear() === year
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date) || new Date(b.createdAt) - new Date(a.createdAt)),
    [transactions, activeTab, selectedMonth, year]
  )

  const isIncome = activeTab === 'income'

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <p className="text-white/25 text-sm">No {activeTab}s this month</p>
        <p className="text-white/15 text-xs mt-1">Tap + to add one</p>
      </div>
    )
  }

  return (
    <div className="px-4 pb-28">
      <p className="text-white/25 text-xs font-medium uppercase tracking-widest mb-3 px-1">Transactions</p>
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
    </div>
  )
}
