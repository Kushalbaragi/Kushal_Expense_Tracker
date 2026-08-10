import { useMemo, useState } from 'react'
import {
  formatCurrencyFull,
  formatDateFull,
  getDailyExpenseTotals,
  getIntensityThresholds,
  getEarliestDate,
  spendShadeFor,
  today,
} from '../utils/format'

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function toStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function SpendCalendarModal({ open, onClose, transactions }) {
  const now = new Date()
  const [view, setView] = useState(new Date(now.getFullYear(), now.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(null)

  const year  = view.getFullYear()
  const month = view.getMonth()
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr    = today()

  const dailyTotals = useMemo(() => getDailyExpenseTotals(transactions), [transactions])
  const thresholds  = useMemo(() => getIntensityThresholds(dailyTotals), [dailyTotals])
  const earliest    = useMemo(() => getEarliestDate(transactions), [transactions])

  const dayTxs = useMemo(
    () => transactions
      .filter(tx => tx.date === selectedDate)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [transactions, selectedDate],
  )

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function prevMonth() { setView(new Date(year, month - 1, 1)); setSelectedDate(null) }
  function nextMonth() { setView(new Date(year, month + 1, 1)); setSelectedDate(null) }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        }}
        onClick={onClose}
      />

      <div
        className={`fixed left-1/2 top-1/2 z-50 w-[88%] max-w-[340px] rounded-3xl px-6 py-6 transition-all duration-300 ease-out ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          transform: `translate(-50%, -50%) scale(${open ? 1 : 0.95})`,
          maxHeight: '80vh',
          overflowY: 'auto',
          background: '#1c1c1f',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
        }}
      >
        <div className="w-full max-w-[300px] mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-full glass hover:glass-active transition-all text-white/50 hover:text-white text-base"
            >
              ‹
            </button>
            <span className="text-white/80 text-sm font-semibold">{MONTHS[month]} {year}</span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-full glass hover:glass-active transition-all text-white/50 hover:text-white text-base"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1.5">
            {DAYS.map((d, i) => (
              <div key={i} className="text-center text-white/25 text-[11px] py-0.5 font-medium">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((d, i) => {
              if (!d) return <div key={`e${i}`} />

              const str = toStr(new Date(year, month, d))
              const shade = spendShadeFor(str, { dailyTotals, thresholds, earliest, todayStr })
              const isToday = str === todayStr
              const isSelected = selectedDate === str

              return (
                <button
                  key={d}
                  type="button"
                  disabled={!shade.isKnown}
                  onClick={() => setSelectedDate(prev => (prev === str ? null : str))}
                  className="aspect-square flex items-center justify-center rounded-md text-xs font-medium transition-transform duration-100 active:scale-90"
                  style={{
                    background: shade.bg,
                    color: shade.color,
                    cursor: shade.isKnown ? 'pointer' : 'default',
                    boxShadow: isSelected
                      ? 'inset 0 0 0 1.5px rgba(255,255,255,0.65)'
                      : isToday
                        ? 'inset 0 0 0 1px rgba(255,255,255,0.3)'
                        : 'none',
                  }}
                >
                  {d}
                </button>
              )
            })}
          </div>

          {selectedDate && (
            <div className="mt-3 glass rounded-lg p-2.5">
              <p className="text-white/60 text-[11px] font-semibold mb-1.5">{formatDateFull(selectedDate)}</p>
              {dayTxs.length === 0 ? (
                <p className="text-white/30 text-[11px]">No transactions — spend-free day 🎉</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {dayTxs.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between gap-2">
                      <span className="text-white/70 text-[11px] truncate">
                        {tx.description || (tx.type === 'income' ? 'Income' : 'Expense')}
                      </span>
                      <span
                        className="text-[11px] font-medium shrink-0"
                        style={{ color: tx.type === 'income' ? '#4ade80' : 'rgba(255,255,255,0.5)' }}
                      >
                        {tx.type === 'income' ? '+' : '-'}{formatCurrencyFull(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-[2px]" style={{ background: 'rgba(34,197,94,0.5)' }} />
              <span className="text-white/30 text-[10px]">No spend</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-[2px]" style={{ background: 'rgba(239,68,68,0.5)' }} />
              <span className="text-white/30 text-[10px]">Spent</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
