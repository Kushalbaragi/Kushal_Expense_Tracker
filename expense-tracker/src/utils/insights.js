import { formatCurrency, formatCurrencyFull, getMonthTotal, getEarliestDate, today } from './format'

const TX_MILESTONES = [10, 50, 100, 250, 500, 1000]
const MONTH_STREAK_MILESTONES = [3, 6, 12, 24]

function shiftDate(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function sumInRange(transactions, type, startStr, endStr) {
  return transactions
    .filter(tx => tx.type === type && tx.date >= startStr && tx.date <= endStr)
    .reduce((s, tx) => s + tx.amount, 0)
}

export function getTrendInsight(transactions, todayStr) {
  const weekStart     = shiftDate(todayStr, -6)
  const prevWeekEnd   = shiftDate(todayStr, -7)
  const prevWeekStart = shiftDate(todayStr, -13)

  const thisWeek = sumInRange(transactions, 'expense', weekStart, todayStr)
  const lastWeek = sumInRange(transactions, 'expense', prevWeekStart, prevWeekEnd)

  if (lastWeek <= 0) return null
  const pctChange = ((thisWeek - lastWeek) / lastWeek) * 100
  if (Math.abs(pctChange) < 10) return null

  const up = pctChange > 0
  return {
    key: 'trend',
    tone: up ? 'neutral' : 'positive',
    emoji: up ? '📈' : '📉',
    headline: up ? `Spending up ${Math.round(pctChange)}%` : `Spending down ${Math.round(Math.abs(pctChange))}%`,
    message: up
      ? `You've spent ${formatCurrency(thisWeek)} this week — ${Math.round(pctChange)}% more than last week.`
      : `You've spent ${formatCurrency(thisWeek)} this week — ${Math.round(Math.abs(pctChange))}% less than last week. Nice.`,
  }
}

export function getSavingsRateInsight(transactions, todayStr) {
  const d = new Date(todayStr)
  const month = d.getMonth(), year = d.getFullYear()
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear  = month === 0 ? year - 1 : year

  const incomeThis  = getMonthTotal(transactions, 'income', month, year)
  const expenseThis = getMonthTotal(transactions, 'expense', month, year)
  if (incomeThis <= 0) return null
  const rateThis = ((incomeThis - expenseThis) / incomeThis) * 100

  const incomePrev  = getMonthTotal(transactions, 'income', prevMonth, prevYear)
  const expensePrev = getMonthTotal(transactions, 'expense', prevMonth, prevYear)

  if (incomePrev <= 0) {
    if (rateThis < 5) return null
    return {
      key: 'savings',
      tone: 'positive',
      emoji: '💰',
      headline: `Saving ${Math.round(rateThis)}%`,
      message: `You're saving ${Math.round(rateThis)}% of your income this month.`,
    }
  }

  const ratePrev = ((incomePrev - expensePrev) / incomePrev) * 100
  const delta = rateThis - ratePrev
  if (Math.abs(delta) < 3) return null

  const up = delta > 0
  return {
    key: 'savings',
    tone: up ? 'positive' : 'neutral',
    emoji: up ? '💰' : '📊',
    headline: `Saving ${Math.round(rateThis)}%`,
    message: up
      ? `You saved ${Math.round(rateThis)}% of your income this month — up from ${Math.round(ratePrev)}% last month.`
      : `You've saved ${Math.round(rateThis)}% of your income this month, down from ${Math.round(ratePrev)}% last month.`,
  }
}

export function getMilestoneInsight(transactions, celebrated) {
  const count = transactions.length

  for (const m of TX_MILESTONES) {
    const id = `count-${m}`
    if (count >= m && !celebrated.has(id)) {
      return {
        id, key: 'milestone', tone: 'positive', emoji: '🎉',
        headline: `${m} transactions logged`,
        message: `You've logged ${m} transactions in Okana. Keep it up!`,
      }
    }
  }

  const activeMonths = new Set(transactions.map(tx => tx.date.slice(0, 7)))
  const now = new Date()
  let streak = 0
  for (let i = 0; ; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (activeMonths.has(key)) streak++
    else break
  }
  for (const m of MONTH_STREAK_MILESTONES) {
    const id = `months-${m}`
    if (streak >= m && !celebrated.has(id)) {
      return {
        id, key: 'milestone', tone: 'positive', emoji: '🗓️',
        headline: `${m} months of tracking`,
        message: `You've tracked your money for ${m} months in a row. That consistency adds up.`,
      }
    }
  }

  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const py = prevMonthDate.getFullYear(), pm = prevMonthDate.getMonth()
  const inc = getMonthTotal(transactions, 'income', pm, py)
  const exp = getMonthTotal(transactions, 'expense', pm, py)
  const id = 'first-positive-month'
  if (inc > 0 && inc - exp > 0 && !celebrated.has(id)) {
    const earliest = getEarliestDate(transactions)
    if (earliest) {
      let anyEarlierPositive = false
      const cursor = new Date(earliest)
      cursor.setDate(1)
      while (cursor < new Date(py, pm, 1)) {
        const ci = getMonthTotal(transactions, 'income', cursor.getMonth(), cursor.getFullYear())
        const ce = getMonthTotal(transactions, 'expense', cursor.getMonth(), cursor.getFullYear())
        if (ci > 0 && ci - ce > 0) { anyEarlierPositive = true; break }
        cursor.setMonth(cursor.getMonth() + 1)
      }
      if (!anyEarlierPositive) {
        return {
          id, key: 'milestone', tone: 'positive', emoji: '✨',
          headline: 'First month in the green',
          message: 'Last month you spent less than you earned — your first positive month tracked.',
        }
      }
    }
  }

  return null
}

export function getAnomalyInsight(transactions, todayStr) {
  const recentCutoff = shiftDate(todayStr, -1)
  const recentBig = transactions
    .filter(tx => tx.type === 'expense' && tx.date >= recentCutoff && tx.date <= todayStr)
    .sort((a, b) => b.amount - a.amount)[0]
  if (!recentBig) return null

  const windowStart = shiftDate(todayStr, -60)
  const history = transactions.filter(
    tx => tx.type === 'expense' && tx.date >= windowStart && tx.date < recentBig.date,
  )
  if (history.length < 5) return null

  const maxHistory = Math.max(...history.map(tx => tx.amount))
  if (recentBig.amount <= maxHistory) return null

  return {
    key: 'anomaly',
    tone: 'neutral',
    emoji: '👀',
    headline: 'Biggest expense in a while',
    message: `${recentBig.description || 'That expense'} (${formatCurrencyFull(recentBig.amount)}) is your largest in the last 60 days.`,
  }
}

export function getNeglectInsight(transactions, todayStr) {
  if (!transactions.length) return null
  const lastDate = transactions.reduce((max, tx) => (tx.date > max ? tx.date : max), transactions[0].date)
  const daysSince = Math.round((new Date(todayStr) - new Date(lastDate)) / 86400000)
  if (daysSince < 4) return null
  return {
    key: 'neglect',
    tone: 'nudge',
    emoji: '👋',
    headline: `It's been ${daysSince} days`,
    message: `You haven't logged anything in ${daysSince} days — still tracking?`,
  }
}

export function getDailyInsight(transactions, celebrated) {
  const todayStr = today()

  const neglect = getNeglectInsight(transactions, todayStr)
  if (neglect) return neglect

  const milestone = getMilestoneInsight(transactions, celebrated)
  if (milestone) return milestone

  const anomaly = getAnomalyInsight(transactions, todayStr)
  if (anomaly) return anomaly

  const savings = getSavingsRateInsight(transactions, todayStr)
  if (savings) return savings

  const trend = getTrendInsight(transactions, todayStr)
  if (trend) return trend

  return null
}
