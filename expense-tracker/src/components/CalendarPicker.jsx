import { useState } from 'react'

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function parseLocal(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export default function CalendarPicker({ value, onChange, onClose }) {
  const selected = parseLocal(value)
  const [view, setView] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1))

  const year = view.getFullYear()
  const month = view.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const today = toStr(new Date())
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function prev() { setView(new Date(year, month - 1, 1)) }
  function next() { setView(new Date(year, month + 1, 1)) }

  function pick(d) {
    const dateStr = toStr(new Date(year, month, d))
    onChange(dateStr)
    onClose()
  }

  const selStr = toStr(selected)

  return (
    <div className="glass rounded-2xl p-4 w-full" onClick={e => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prev}
          className="w-8 h-8 flex items-center justify-center rounded-full glass hover:glass-active transition-all text-white/60 hover:text-white text-lg"
        >
          ‹
        </button>
        <span className="text-white text-sm font-semibold">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={next}
          className="w-8 h-8 flex items-center justify-center rounded-full glass hover:glass-active transition-all text-white/60 hover:text-white text-lg"
        >
          ›
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-white/30 text-xs py-1 font-medium">{d}</div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />
          const str = toStr(new Date(year, month, d))
          const isSelected = str === selStr
          const isToday = str === today
          return (
            <button
              key={d}
              type="button"
              onClick={() => pick(d)}
              className={`
                aspect-square flex items-center justify-center rounded-full text-sm transition-all duration-150 mx-auto w-8 h-8
                ${isSelected
                  ? 'glass-active text-white font-semibold'
                  : isToday
                    ? 'text-white font-medium ring-1 ring-white/20'
                    : 'text-white/60 hover:text-white hover:glass'
                }
              `}
            >
              {d}
            </button>
          )
        })}
      </div>
    </div>
  )
}
