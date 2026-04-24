import { useState, useEffect, useRef } from 'react'
import { today } from '../utils/format'
import CalendarPicker from './CalendarPicker'

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatDisplay(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`
}

export default function AddModal({ open, onClose, onAdd }) {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today())
  const [description, setDescription] = useState('')
  const [calOpen, setCalOpen] = useState(false)
  const amountRef = useRef(null)

  useEffect(() => {
    if (open) {
      setType('expense')
      setAmount('')
      setDate(today())
      setDescription('')
      setCalOpen(false)
      setTimeout(() => amountRef.current?.focus(), 300)
    }
  }, [open])

  function handleSubmit(e) {
    e.preventDefault()
    const val = parseFloat(amount)
    if (!val || val <= 0) return
    onAdd({ type, amount: val, date, description })
    onClose()
  }

  return (
    <>
      {/* Backdrop — reduced opacity */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(0,0,0,0.35)' }}
        onClick={() => { setCalOpen(false); onClose() }}
      />

      {/* Sheet — glass modal */}
      <div
        className={`glass-modal fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[480px] rounded-t-3xl px-6 pt-5 pb-10 transition-transform duration-300 ease-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85vh', overflowY: 'auto' }}
        onClick={() => setCalOpen(false)}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.15)' }} />

        {/* Type toggle — liquid glass */}
        <div className="flex glass rounded-full p-1 gap-1 mb-6">
          {['expense', 'income'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                type === t ? 'glass-active text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} onClick={e => e.stopPropagation()}>
          {/* Amount */}
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-4xl font-light text-white/50">₹</span>
              <input
                ref={amountRef}
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="bg-transparent text-5xl font-semibold text-center text-white outline-none w-full max-w-[220px] placeholder-border"
              />
            </div>
          </div>

          {/* Date — custom picker trigger */}
          <div className="mb-4 relative">
            <label className="block text-white/40 text-xs font-medium mb-2 uppercase tracking-wider">Date</label>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setCalOpen(v => !v) }}
              className="w-full glass rounded-xl px-4 py-3 text-white text-sm text-left flex items-center justify-between transition-all duration-150 hover:glass-active"
            >
              <span>{formatDisplay(date)}</span>
              <span className="text-white/40 text-xs">📅</span>
            </button>

            {/* Calendar popover */}
            {calOpen && (
              <div
                className="absolute left-0 right-0 mt-2 z-10"
                onClick={e => e.stopPropagation()}
              >
                <CalendarPicker
                  value={date}
                  onChange={setDate}
                  onClose={() => setCalOpen(false)}
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6" style={{ marginTop: calOpen ? '0' : '0' }}>
            <label className="block text-white/40 text-xs font-medium mb-2 uppercase tracking-wider">Description</label>
            <input
              type="text"
              placeholder="What was this for?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              onClick={e => { e.stopPropagation(); setCalOpen(false) }}
              className="w-full glass rounded-xl px-4 py-3 text-white text-sm outline-none transition-all duration-150 placeholder-border focus:glass-active"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full py-4 rounded-2xl text-base font-semibold transition-all duration-200 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed glass-active text-white hover:brightness-110"
          >
            Add {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        </form>
      </div>
    </>
  )
}
