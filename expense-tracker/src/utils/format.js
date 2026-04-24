const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTHS_SHORT = ['J','F','M','A','M','J','J','A','S','O','N','D']

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCurrencyFull(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function today() {
  return new Date().toISOString().slice(0, 10)
}

export function formatDateLabel(dateStr) {
  const t = today()
  if (dateStr === t) return 'Today'
  const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (dateStr === y) return 'Yesterday'
  const d = new Date(dateStr)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export function getMonthYear(dateStr) {
  const d = new Date(dateStr)
  return { month: d.getMonth(), year: d.getFullYear() }
}

export function currentMonthYear() {
  const now = new Date()
  return { month: now.getMonth(), year: now.getFullYear() }
}

export function monthLabel(month, year) {
  return `${MONTHS[month]} ${year}`
}

export function monthShortLabel(index) {
  return MONTHS_SHORT[index]
}

export function getMonthlyTotals(transactions, year) {
  const income = new Array(12).fill(0)
  const expense = new Array(12).fill(0)
  transactions.forEach(tx => {
    const d = new Date(tx.date)
    if (d.getFullYear() !== year) return
    const m = d.getMonth()
    if (tx.type === 'income') income[m] += tx.amount
    else expense[m] += tx.amount
  })
  return { income, expense }
}

export function getMonthTotal(transactions, type, month, year) {
  return transactions
    .filter(tx => {
      const d = new Date(tx.date)
      return tx.type === type && d.getMonth() === month && d.getFullYear() === year
    })
    .reduce((sum, tx) => sum + tx.amount, 0)
}

export function getDelta(transactions, type, month, year) {
  const current = getMonthTotal(transactions, type, month, year)
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const prev = getMonthTotal(transactions, type, prevMonth, prevYear)
  return { current, prev, diff: current - prev }
}
