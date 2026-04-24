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

      <div className="flex items-center gap-2 shrink-0">
      <span className="text-sm font-medium"
        style={{ color: isIncome ? 'rgb(74 222 128 / var(--tw-text-opacity, 0.8))' : '#a3a3a3' }} >
          {isIncome ? '+' : '-'}{formatCurrencyFull(tx.amount)}
        </span>

        {/* Always-visible delete — small grey circle × */}
        <button
          onClick={e => { e.stopPropagation(); onDelete(tx.id) }}
          className="w-4 h-4 rounded-full flex items-center justify-center transition-all duration-150 hover:bg-white/10 shrink-0"
          style={{ background: 'rgba(255,255,255,0.07)' }}
          aria-label="Delete"
        >
          <svg width="6" height="6" viewBox="0 0 8 8" fill="none">
            <line x1="1" y1="1" x2="7" y2="7" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" strokeLinecap="round"/>
            <line x1="7" y1="1" x2="1" y2="7" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
