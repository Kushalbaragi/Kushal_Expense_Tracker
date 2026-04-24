import { formatCurrencyFull } from '../utils/format'

export default function TransactionItem({ tx, onDelete, isIncome }) {
  return (
    <div
      className="flex items-center justify-between py-3 px-1 group animate-fadeIn"
      style={{ borderBottom: '1px solid #1f1f1f' }}
    >
      <div className="flex-1 min-w-0 pr-3">
        <p className="text-white text-sm font-medium truncate">
          {tx.description || (isIncome ? 'Income' : 'Expense')}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-sm font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
          {isIncome ? '+' : '-'}{formatCurrencyFull(tx.amount)}
        </span>
        <button
          onClick={() => onDelete(tx.id)}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-150 text-muted hover:text-expense text-lg leading-none"
          aria-label="Delete"
        >
          ×
        </button>
      </div>
    </div>
  )
}
