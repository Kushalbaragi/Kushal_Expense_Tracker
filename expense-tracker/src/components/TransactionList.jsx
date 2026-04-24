import { useMemo } from 'react'
import TransactionItem from './TransactionItem'
import { formatCurrencyFull, formatDateLabel } from '../utils/format'

export default function TransactionList({ transactions, activeTab, onDelete }) {
  const filtered = useMemo(
    () => transactions.filter(tx => tx.type === activeTab)
      .sort((a, b) => new Date(b.date) - new Date(a.date) || new Date(b.createdAt) - new Date(a.createdAt)),
    [transactions, activeTab]
  )

  const grouped = useMemo(() => {
    const map = new Map()
    filtered.forEach(tx => {
      const key = tx.date
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(tx)
    })
    return [...map.entries()].map(([date, txs]) => ({
      date,
      label: formatDateLabel(date),
      total: txs.reduce((s, t) => s + t.amount, 0),
      txs,
    }))
  }, [filtered])

  const isIncome = activeTab === 'income'

  if (grouped.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <p className="text-muted text-sm">No {activeTab}s yet</p>
        <p className="text-muted text-xs mt-1 opacity-60">Tap + to add your first {activeTab}</p>
      </div>
    )
  }

  return (
    <div className="px-4 pb-28">
      {grouped.map(({ date, label, total, txs }) => (
        <div key={date} className="mb-4">
          {/* Group header */}
          <div className="flex justify-between items-center py-2">
            <span className="text-muted text-xs font-medium uppercase tracking-wider">{label}</span>
            <span className={`text-xs font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
              {isIncome ? '+' : '-'}{formatCurrencyFull(total)}
            </span>
          </div>

          {/* Transactions */}
          <div className="bg-surface rounded-xl overflow-hidden px-3">
            {txs.map((tx, idx) => (
              <div
                key={tx.id}
                style={{
                  animation: `fadeSlideUp 0.2s ease both`,
                  animationDelay: `${idx * 40}ms`,
                }}
              >
                <TransactionItem tx={tx} onDelete={onDelete} isIncome={isIncome} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
