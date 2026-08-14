import { memo } from 'react'
import { formatCurrencyFull, dateBoxParts } from '../utils/format'

function DateBox({ dateStr }) {
  const { day, month } = dateBoxParts(dateStr)
  return (
    <div className="flex flex-col items-center justify-center w-7 h-7 rounded bg-white/5 shrink-0 mr-2.5">
      <span className="text-white/70 text-[9px] font-semibold leading-none">{day}</span>
      <span className="text-white/30 text-[6.5px] font-medium leading-none mt-0.5 tracking-tight">{month}</span>
    </div>
  )
}

function TransactionItem({ tx, onEdit, isIncome }) {
  return (
    <div
      className="flex items-center justify-between py-3 px-1 cursor-pointer active:opacity-70 transition-opacity duration-100"
      style={{ borderBottom: '1px solid #1a1a1a' }}
      onClick={() => onEdit(tx)}
    >
      <div className="flex items-center flex-1 min-w-0 pr-3">
        <DateBox dateStr={tx.date} />
        <p className="text-white text-sm font-normal truncate">
          {tx.description || (isIncome ? 'Income' : 'Expense')}
        </p>
      </div>

      <div className="flex items-center shrink-0">
        <span className="text-sm font-medium"
          style={{ color: isIncome ? 'rgb(74 222 128 / var(--tw-text-opacity, 0.8))' : 'rgba(255,255,255,0.45)' }}>
          {isIncome ? '+' : '-'}{formatCurrencyFull(tx.amount)}
        </span>
      </div>
    </div>
  )
}

export default memo(TransactionItem)
