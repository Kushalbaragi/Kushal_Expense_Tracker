export const TRIAL_DAYS = 30
export const PRICE_PER_YEAR = 499

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function shiftDate(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getTrialInfo(trialStartStr, todayStr) {
  if (!trialStartStr) {
    return { status: 'not_started', daysLeft: TRIAL_DAYS, chargeDate: null }
  }

  const daysElapsed = Math.floor((new Date(todayStr) - new Date(trialStartStr)) / 86400000)
  const daysLeft = TRIAL_DAYS - daysElapsed
  const chargeDate = shiftDate(trialStartStr, TRIAL_DAYS)

  if (daysLeft <= 0) {
    return { status: 'expired', daysLeft: 0, chargeDate }
  }
  return { status: 'active', daysLeft, chargeDate }
}

export function formatChargeDate(dateStr) {
  const d = new Date(dateStr)
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

// Maps a `subscriptions` row (Razorpay status) to what the UI needs to show.
// Statuses: not_started (no row) · trial (mandate set up, 30-day window running)
// · subscribed (first charge succeeded) · expired (trial lapsed / cancelled / halted)
export function getSubscriptionDisplayStatus(subscription, todayStr) {
  if (!subscription) {
    return { status: 'not_started', daysLeft: TRIAL_DAYS, chargeDate: null, cancelAtPeriodEnd: false, paymentFailed: false }
  }

  if (subscription.status === 'active') {
    return {
      status: 'subscribed',
      daysLeft: 0,
      chargeDate: subscription.current_end,
      cancelAtPeriodEnd: !!subscription.cancel_at_period_end,
      paymentFailed: false,
    }
  }
  if (subscription.status === 'halted') {
    return { status: 'expired', daysLeft: 0, chargeDate: subscription.current_end, cancelAtPeriodEnd: false, paymentFailed: true }
  }
  if (['cancelled', 'expired'].includes(subscription.status)) {
    return { status: 'expired', daysLeft: 0, chargeDate: subscription.current_end, cancelAtPeriodEnd: false, paymentFailed: false }
  }

  // created / authenticated / pending — mandate is set up, trial window is running
  const trial = getTrialInfo(subscription.trial_start, todayStr)
  if (trial.status === 'expired') {
    return { status: 'expired', daysLeft: 0, chargeDate: trial.chargeDate, cancelAtPeriodEnd: false, paymentFailed: false }
  }
  return {
    status: 'trial',
    daysLeft: trial.daysLeft,
    chargeDate: trial.chargeDate,
    cancelAtPeriodEnd: !!subscription.cancel_at_period_end,
    paymentFailed: false,
  }
}

// Shown once, the day before the trial converts to a paid subscription.
export function getTrialReminderInsight(trialInfo) {
  if (!trialInfo || trialInfo.status !== 'trial' || trialInfo.daysLeft !== 1) return null
  return {
    key: 'trial-ending',
    tone: 'nudge',
    emoji: '⏳',
    headline: 'Your trial ends tomorrow',
    message: `You'll be charged ₹${PRICE_PER_YEAR} tomorrow to continue with Okana Plus. Manage this anytime from Subscription.`,
  }
}
