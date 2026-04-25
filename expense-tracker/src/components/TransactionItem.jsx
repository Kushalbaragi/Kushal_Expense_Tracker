import { formatCurrencyFull } from '../utils/format'

export default function TransactionItem({ tx, onDelete, onEdit, isIncome }) {
  return (
    <div
      className="flex items-center justify-between py-3 px-1 cursor-pointer active:opacity-70 transition-opacity duration-100"
      style={{ borderBottom: '1px solid #1a1a1a' }}
      onClick={() => onEdit(tx)}
    >
      <div className="flex-1 min-w-0 pr-3">
        <p className="text-white text-sm font-normal truncate">
          {tx.description || (isIncome ? 'Income' : 'Expense')}
        </p>
      </div>

      <div className="flex items-center shrink-0">
        <span className="text-sm font-medium"
          style={{ color: isIncome ? 'rgb(74 222 128 / var(--tw-text-opacity, 0.8))' : '#a3a3a3' }}>
          {isIncome ? '+' : '-'}{formatCurrencyFull(tx.amount)}
        </span>
      </div>
    </div>
  )
}
