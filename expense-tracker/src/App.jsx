import { useCallback, useEffect, useMemo, useState, lazy, Suspense } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import SummaryCard from './components/SummaryCard'
import TransactionList from './components/TransactionList'
import AddModal from './components/AddModal'
import SpendCalendarModal from './components/SpendCalendarModal'
import DailyInsightModal from './components/DailyInsightModal'
import MonthlyRecapModal from './components/MonthlyRecapModal'
import Drawer from './components/Drawer'
import { useTransactions } from './hooks/useTransactions'
import { useSubscription } from './hooks/useSubscription'
import { useAuth } from './context/AuthContext'
import { currentMonthYear, today, monthLabel } from './utils/format'
import { getDailyInsight } from './utils/insights'
import { getMonthlyRecapSlides, hasAnyRecapData, prevMonthYear, MONTH_NAMES } from './utils/monthlyRecap'
import { getSubscriptionDisplayStatus, getPendingSubscriptionPopup, PRICE_PER_YEAR } from './utils/trial'

const SINGLE_CTA_POPUPS = {
  'trial-tomorrow': {
    emoji: '⏳',
    headline: 'Your Okana Plus trial ends tomorrow',
    message: `Your saved payment method will be charged ₹${PRICE_PER_YEAR} for the annual plan after your trial ends.`,
    cta: 'Continue with Okana Plus',
  },
  'success': {
    emoji: '🎉',
    headline: "You're now subscribed to Okana Plus",
    message: 'Your annual subscription has started successfully.',
    cta: 'Continue Tracking',
  },
}

const DOUBLE_CTA_POPUPS = {
  'trial-ended': {
    emoji: '⏳',
    headline: 'Your free trial ends today',
    message: 'Okana Plus features will no longer be available after today. Subscribe to keep unlimited access.',
  },
  'payment-failed': {
    emoji: '⚠️',
    headline: 'Payment failed',
    message: "We couldn't process your Okana Plus payment. Please update your payment method to continue accessing Plus features.",
  },
  'sub-ended': {
    emoji: '👋',
    headline: 'Your Okana Plus subscription has ended',
    message: "You're now using Okana Free and no longer have access to Plus-only features.",
  },
}

const LoginPage          = lazy(() => import('./pages/LoginPage'))
const SignupPage         = lazy(() => import('./pages/SignupPage'))
const WelcomePage        = lazy(() => import('./pages/WelcomePage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage  = lazy(() => import('./pages/ResetPasswordPage'))
const AccountPage        = lazy(() => import('./pages/AccountPage'))
const SubscriptionPage   = lazy(() => import('./pages/SubscriptionPage'))
const SettingsPage       = lazy(() => import('./pages/SettingsPage'))

function PageFallback() {
  return <div className="min-h-screen bg-bg" />
}

function GuestLanding() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-bg font-sans flex flex-col items-center justify-center px-6 text-center">
      <div style={{ animation: 'fadeSlideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
        <h1 className="text-white text-5xl font-bold tracking-tight mb-2">Okana</h1>
        <p className="text-white/35 text-sm mb-12 tracking-wide">Your money, beautifully tracked.</p>
      </div>

      <div className="w-full max-w-[320px] flex flex-col gap-3" style={{ animation: 'fadeSlideUp 0.4s 0.12s cubic-bezier(0.16,1,0.3,1) both', opacity: 0 }}>
        <button
          onClick={() => navigate('/signup')}
          className="w-full py-[14px] rounded-2xl text-sm font-semibold glass-active text-white active:scale-95 transition-all"
        >
          Get Started
        </button>
        <button
          onClick={() => navigate('/login')}
          className="w-full py-[14px] rounded-2xl text-sm font-semibold text-white/60 active:scale-95 transition-all hover:text-white/80"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          Log In
        </button>
      </div>

      <p className="text-white/15 text-xs mt-14" style={{ animation: 'fadeSlideUp 0.4s 0.22s cubic-bezier(0.16,1,0.3,1) both', opacity: 0 }}>
        Built with ♥ by Kushal
      </p>
    </div>
  )
}

function Dashboard() {
  const { month: currMonth, year: currYear } = currentMonthYear()
  const { user } = useAuth()
  const [activeTab,    setActiveTab]    = useState('expense')
  const [chartTab,     setChartTab]     = useState('expense')
  const [timeRange,    setTimeRange]    = useState('month')
  const [modalOpen,    setModalOpen]    = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [editTx,       setEditTx]       = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(currMonth)
  const [selectedYear,  setSelectedYear]  = useState(null)
  const [selectedDay,   setSelectedDay]   = useState(null)
  const [drawerOpen,   setDrawerOpen]   = useState(false)
  const [activePage,   setActivePage]   = useState(null)  // 'account'|'subscription'|'settings'
  const [pageVisible,  setPageVisible]  = useState(false)
  const [dailyInsight, setDailyInsight] = useState(null)
  const [recapOpen,     setRecapOpen]     = useState(false)
  const [recapSlides,   setRecapSlides]   = useState([])
  const [recapMonthLabel, setRecapMonthLabel] = useState('')
  const [recapMonthName,  setRecapMonthName]  = useState('')
  const [recapAvailable, setRecapAvailable] = useState(false)
  const [recapSeen,     setRecapSeen]     = useState(false)
  const [proRequired,   setProRequired]   = useState(false)
  const [pendingSubPopup, setPendingSubPopup] = useState(null)
  const [activeSubPopup,  setActiveSubPopup]  = useState(null)
  const { transactions, addTransaction, editTransaction, deleteTransaction, refresh: refreshTransactions } = useTransactions()
  const {
    subscription, loading: subLoading, starting: trialStarting, cancelling: trialCancelling,
    error: trialError, paymentMethod, startTrial, cancelSubscription,
  } = useSubscription(user)

  const trialInfo = useMemo(() => getSubscriptionDisplayStatus(subscription, today()), [subscription])

  useEffect(() => {
    if (!user || !transactions.length || subLoading) return
    const todayStr = today()
    const { month, year } = currentMonthYear()
    const prev = prevMonthYear(month, year)

    // Recap stays reopenable for the rest of the day it first became available
    const availKey = `okana_recap_available_date_${user.id}`
    const isAvailableToday = localStorage.getItem(availKey) === todayStr

    if (isAvailableToday && hasAnyRecapData(transactions, prev.month, prev.year)) {
      setRecapSlides(getMonthlyRecapSlides(transactions, prev.month, prev.year))
      setRecapMonthLabel(monthLabel(prev.month, prev.year))
      setRecapMonthName(MONTH_NAMES[prev.month])
      setRecapAvailable(true)
      setRecapSeen(localStorage.getItem(`okana_recap_seen_${user.id}_${todayStr}`) === '1')
    } else {
      setRecapAvailable(false)
    }

    const shownKey = `okana_insight_shown_${user.id}`
    if (localStorage.getItem(shownKey) === todayStr) return
    localStorage.setItem(shownKey, todayStr)

    // First app-open after a month rollover — whatever day that lands on —
    // shows the recap for the month that just ended instead of the daily insight.
    const recapShownKey = `okana_recap_shown_${user.id}`
    const recapMonthId  = `${prev.year}-${String(prev.month).padStart(2, '0')}`
    const alreadyShown  = localStorage.getItem(recapShownKey) === recapMonthId

    if (!alreadyShown && hasAnyRecapData(transactions, prev.month, prev.year)) {
      localStorage.setItem(recapShownKey, recapMonthId)
      localStorage.setItem(availKey, todayStr)
      setRecapSlides(getMonthlyRecapSlides(transactions, prev.month, prev.year))
      setRecapMonthLabel(monthLabel(prev.month, prev.year))
      setRecapMonthName(MONTH_NAMES[prev.month])
      setRecapAvailable(true)
      setRecapSeen(false)
      setRecapOpen(true)
      return
    }

    const insight = getDailyInsight(transactions, todayStr)
    if (insight) setDailyInsight(insight)
  }, [user, transactions, subLoading, subscription])

  // Flag a subscription-lifecycle popup as due — independent of the
  // daily-shown-key logic above, since these are once-per-event notices
  // (see getPendingSubscriptionPopup), not once-per-day ones.
  useEffect(() => {
    if (!user || subLoading) return
    const pending = getPendingSubscriptionPopup(subscription, trialInfo, user.id)
    if (!pending || localStorage.getItem(pending.key) === '1') return
    setPendingSubPopup(pending)
  }, [user, subLoading, subscription, trialInfo.status, trialInfo.paymentFailed, trialInfo.daysLeft, trialInfo.cancelAtPeriodEnd, trialInfo.everBilled])

  // Only actually show it once today's spending summary / recap (if any)
  // has been seen and dismissed — spending data comes first, always.
  useEffect(() => {
    if (!pendingSubPopup) return
    if (dailyInsight || recapOpen) return
    if (localStorage.getItem(pendingSubPopup.key) === '1') { setPendingSubPopup(null); return }
    localStorage.setItem(pendingSubPopup.key, '1')
    setActiveSubPopup(pendingSubPopup.type)
    setPendingSubPopup(null)
  }, [pendingSubPopup, dailyInsight, recapOpen])

  const closeRecap = useCallback(() => {
    setRecapOpen(false)
    if (!user) return
    const todayStr = today()
    localStorage.setItem(`okana_recap_seen_${user.id}_${todayStr}`, '1')
    setRecapSeen(true)
  }, [user])

  const handleChartTabChange = useCallback(tab => {
    setChartTab(tab)
    if (tab !== 'overview') setActiveTab(tab)
  }, [])

  const handleTimeRangeChange = useCallback(range => {
    setTimeRange(range)
    setSelectedDay(null)
    if (range !== '5y') setSelectedYear(null)
  }, [])

  const handleDayChange = useCallback(day => {
    setSelectedDay(prev => prev === day ? null : day)
  }, [])

  const openPage = useCallback(page => {
    setActivePage(page)
    requestAnimationFrame(() => requestAnimationFrame(() => setPageVisible(true)))
  }, [])

  const closePage = useCallback(() => {
    setPageVisible(false)
    setTimeout(() => setActivePage(null), 280)
  }, [])

  const openEdit = useCallback(tx => { setEditTx(tx); setModalOpen(true) }, [])
  const handleClose = useCallback(() => { setModalOpen(false); setEditTx(null) }, [])
  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const openCalendar = useCallback(() => setCalendarOpen(true), [])
  const closeCalendar = useCallback(() => setCalendarOpen(false), [])
  const closeDailyInsight = useCallback(() => setDailyInsight(null), [])
  const closeProRequired = useCallback(() => setProRequired(false), [])
  const closeActiveSubPopup = useCallback(() => setActiveSubPopup(null), [])
  const openAddModal = useCallback(() => {
    if (trialInfo.status === 'expired') setProRequired(true)
    else setModalOpen(true)
  }, [trialInfo.status])
  const subscribeFromProRequired = useCallback(() => { setProRequired(false); openPage('subscription') }, [openPage])
  const subscribeFromPopup = useCallback(() => { setActiveSubPopup(null); openPage('subscription') }, [openPage])
  const openRecapFromCalendar = useCallback(() => { setCalendarOpen(false); setRecapOpen(true) }, [])

  const recapForCalendar = useMemo(() => (
    recapAvailable ? { available: true, seen: recapSeen, monthName: recapMonthName, onOpen: openRecapFromCalendar } : null
  ), [recapAvailable, recapSeen, recapMonthName, openRecapFromCalendar])

  if (!user) return <GuestLanding />

  return (
    <div className="bg-bg font-sans h-screen flex flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-[480px] h-full flex flex-col relative">

        <Header
          onMenuOpen={openDrawer}
          chartTab={chartTab}
          onChartTabChange={handleChartTabChange}
          onCalendarOpen={openCalendar}
        />

        <SummaryCard
          transactions={transactions}
          chartTab={chartTab}
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
          selectedMonth={selectedMonth}
          year={currYear}
          onMonthChange={setSelectedMonth}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          selectedDay={selectedDay}
          onDayChange={handleDayChange}
        />

        <div
          className="flex-1 overflow-y-auto"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent, black 10px)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10px)',
          }}
        >
          <TransactionList
            transactions={transactions}
            activeTab={activeTab}
            chartTab={chartTab}
            selectedMonth={selectedMonth}
            year={currYear}
            timeRange={timeRange}
            selectedYear={selectedYear}
            selectedDay={selectedDay}
            onEdit={openEdit}
          />
        </div>

        <button
          onClick={openAddModal}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center z-30 active:scale-90 transition-transform duration-150"
          style={{
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.16)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
          }}
          aria-label="Add transaction"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <line x1="10" y1="2" x2="10" y2="18" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="2" y1="10" x2="18" y2="10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>

        <Drawer
          open={drawerOpen}
          onClose={closeDrawer}
          onOpenPage={openPage}
          planLabel={trialInfo.status === 'subscribed' ? 'Pro' : 'Free'}
        />

        <SpendCalendarModal
          open={calendarOpen}
          onClose={closeCalendar}
          transactions={transactions}
          recap={recapForCalendar}
        />

        <DailyInsightModal
          insight={dailyInsight}
          onClose={closeDailyInsight}
        />

        <MonthlyRecapModal
          open={recapOpen}
          slides={recapSlides}
          monthLabel={recapMonthLabel}
          onClose={closeRecap}
        />

        <AddModal
          open={modalOpen}
          onClose={handleClose}
          onAdd={addTransaction}
          onEdit={editTransaction}
          onDelete={deleteTransaction}
          editData={editTx}
        />

        {proRequired && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={closeProRequired}
          >
            <div
              className="w-full max-w-sm rounded-2xl p-6 text-center"
              style={{ background: 'rgba(20,20,20,0.98)', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-3xl mb-3">🔒</div>
              <p className="text-white font-semibold text-base mb-2">Pro subscription required</p>
              <p className="text-white/45 text-sm leading-relaxed mb-6">
                Your subscription has ended. You can still view everything — subscribe to Okana Plus to keep adding new transactions.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeProRequired}
                  className="flex-1 py-[11px] rounded-xl text-sm font-medium text-white/60"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  Not now
                </button>
                <button
                  onClick={subscribeFromProRequired}
                  className="flex-1 py-[11px] rounded-xl text-sm font-semibold active:scale-95 transition-all"
                  style={{ background: 'rgba(74,222,128,0.25)', color: '#4ade80' }}
                >
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSubPopup && SINGLE_CTA_POPUPS[activeSubPopup] && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={closeActiveSubPopup}
          >
            <div
              className="w-full max-w-sm rounded-2xl p-6 text-center"
              style={{ background: 'rgba(20,20,20,0.98)', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-3xl mb-3">{SINGLE_CTA_POPUPS[activeSubPopup].emoji}</div>
              <p className="text-white font-semibold text-base mb-2">{SINGLE_CTA_POPUPS[activeSubPopup].headline}</p>
              <p className="text-white/45 text-sm leading-relaxed mb-6">{SINGLE_CTA_POPUPS[activeSubPopup].message}</p>
              <button
                onClick={closeActiveSubPopup}
                className="w-full py-[13px] rounded-2xl text-sm font-semibold active:scale-95 transition-all"
                style={{ background: 'rgba(74,222,128,0.25)', color: '#4ade80' }}
              >
                {SINGLE_CTA_POPUPS[activeSubPopup].cta}
              </button>
            </div>
          </div>
        )}

        {activeSubPopup && DOUBLE_CTA_POPUPS[activeSubPopup] && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={closeActiveSubPopup}
          >
            <div
              className="w-full max-w-sm rounded-2xl p-6 text-center"
              style={{ background: 'rgba(20,20,20,0.98)', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-3xl mb-3">{DOUBLE_CTA_POPUPS[activeSubPopup].emoji}</div>
              <p className="text-white font-semibold text-base mb-2">{DOUBLE_CTA_POPUPS[activeSubPopup].headline}</p>
              <p className="text-white/45 text-sm leading-relaxed mb-6">{DOUBLE_CTA_POPUPS[activeSubPopup].message}</p>
              <div className="flex gap-3">
                <button
                  onClick={closeActiveSubPopup}
                  className="flex-1 py-[11px] rounded-xl text-sm font-medium text-white/60"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  Not now
                </button>
                <button
                  onClick={subscribeFromPopup}
                  className="flex-1 py-[11px] rounded-xl text-sm font-semibold active:scale-95 transition-all"
                  style={{ background: 'rgba(74,222,128,0.25)', color: '#4ade80' }}
                >
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* In-app page overlay (account / subscription / settings) */}
      {activePage && (
        <div
          className="fixed inset-0 z-50 bg-bg overflow-y-auto transition-transform duration-[280ms] ease-out"
          style={{ transform: pageVisible ? 'translateX(0)' : 'translateX(100%)' }}
        >
          <Suspense fallback={<PageFallback />}>
            {activePage === 'account'      && <AccountPage      onBack={closePage} onDataErased={refreshTransactions} />}
            {activePage === 'subscription' && (
              <SubscriptionPage
                onBack={closePage}
                trialInfo={trialInfo}
                onStartTrial={startTrial}
                onCancel={cancelSubscription}
                starting={trialStarting}
                cancelling={trialCancelling}
                error={trialError}
                paymentMethod={paymentMethod}
              />
            )}
            {activePage === 'settings'     && <SettingsPage     onBack={closePage} />}
          </Suspense>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </Suspense>
  )
}
