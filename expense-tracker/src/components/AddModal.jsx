import { useState, useEffect, useRef } from 'react'
import { today } from '../utils/format'
import CalendarPicker from './CalendarPicker'

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function formatDisplay(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`
}

function CalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <rect x="1" y="2.5" width="12" height="10.5" rx="2" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2"/>
      <line x1="1" y1="5.5" x2="13" y2="5.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2"/>
      <line x1="4.5" y1="1" x2="4.5" y2="4" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="9.5" y1="1" x2="9.5" y2="4" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

export default function AddModal({ open, onClose, onAdd, onEdit, editData }) {
  const isEdit = !!editData
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today())
  const [description, setDescription] = useState('')
  const [calOpen, setCalOpen] = useState(false)
  const amountRef = useRef(null)

  useEffect(() => {
    if (open) {
      if (editData) {
        setType(editData.type)
        setAmount(String(editData.amount))
        setDate(editData.date)
        setDescription(editData.description)
      } else {
        setType('expense')
        setAmount('')
        setDate(today())
        setDescription('')
      }
      setCalOpen(false)
      setTimeout(() => amountRef.current?.focus(), 320)
    }
  }, [open, editData])

  function handleSubmit(e) {
    e.preventDefault()
    const val = parseFloat(amount)
    if (!val || val <= 0) return
    if (isEdit) {
      onEdit(editData.id, { type, amount: val, date, description })
    } else {
      onAdd({ type, amount: val, date, description })
    }
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ease-in-out ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(0,0,0,0.28)' }}
        onClick={() => { setCalOpen(false); onClose() }}
      />

      {/* Sheet */}
      <div
        className={`glass-modal fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[480px] rounded-t-3xl px-6 pt-5 pb-10 transition-all duration-300 ease-in-out ${
          open ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        style={{ maxHeight: '85vh', overflowY: 'auto' }}
        onClick={() => setCalOpen(false)}
      >
        {/* Handle */}
        <div className="w-8 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.12)' }} />

        {/* Type toggle — sliding pill, smaller */}
        <div className="relative flex glass rounded-full p-[3px] mb-5">
          <div
            className="absolute top-[3px] bottom-[3px] w-[calc(50%-3px)] rounded-full glass-active"
            style={{
              left: type === 'expense' ? '3px' : 'calc(50%)',
              transition: 'left 0.22s cubic-bezier(0.4,0,0.2,1), background 0.22s ease, border-color 0.22s ease',
            }}
          />
          {['expense', 'income'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`relative z-10 flex-1 py-[6px] rounded-full text-xs font-medium transition-colors duration-200 ${
                type === t ? 'text-white' : 'text-white/35 hover:text-white/60'
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
              <span className="text-4xl font-light text-white/35">₹</span>
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

          {/* Date */}
          <div className="mb-4 relative">
            <label className="block text-white/35 text-xs font-medium mb-2 uppercase tracking-wider">Date</label>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setCalOpen(v => !v) }}
              className="w-full glass rounded-xl px-4 py-3 text-white text-sm text-left flex items-center justify-between gap-2 transition-all duration-200 hover:glass-active"
            >
              <span>{formatDisplay(date)}</span>
              <CalIcon />
            </button>

            {/* Calendar — opens ABOVE */}
            {calOpen && (
              <div
                className="absolute left-0 right-0 bottom-full mb-2 z-[60]"
                onClick={e => e.stopPropagation()}
              >
                <CalendarPicker value={date} onChange={setDate} onClose={() => setCalOpen(false)} />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-white/35 text-xs font-medium mb-2 uppercase tracking-wider">Description</label>
            <input
              type="text"
              placeholder="What was this for?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              onClick={e => { e.stopPropagation(); setCalOpen(false) }}
              className="w-full glass rounded-xl px-4 py-3 text-white text-sm outline-none transition-all duration-200 placeholder-border focus:glass-active"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full py-[14px] rounded-2xl text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed glass-active text-white hover:brightness-110"
          >
            {isEdit ? 'Update' : 'Add'} {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        </form>
      </div>
    </>
  )
}
