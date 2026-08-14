import { useCallback, useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import SummaryCard from './components/SummaryCard'
import TransactionList from './components/TransactionList'
import AddModal from './components/AddModal'
import SpendCalendarModal from './components/SpendCalendarModal'
import DailyInsightModal from './components/DailyInsightModal'
import MonthlyRecapModal from './components/MonthlyRecapModal'
import Drawer from './components/Drawer'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import WelcomePage from './pages/WelcomePage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AccountPage from './pages/AccountPage'
import SubscriptionPage from './pages/SubscriptionPage'
import SettingsPage from './pages/SettingsPage'
import { useTransactions } from './hooks/useTransactions'
import { useSubscription } from './hooks/useSubscription'
import { useAuth } from './context/AuthContext'
import { currentMonthYear, today, monthLabel } from './utils/format'
import { getDailyInsight } from './utils/insights'
import { getMonthlyRecapSlides, hasAnyRecapData, prevMonthYear, MONTH_NAMES } from './utils/monthlyRecap'
import { getSubscriptionDisplayStatus, getTrialReminderInsight } from './utils/trial'

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
  const { transactions, addTransaction, editTransaction, deleteTransaction } = useTransactions()
  const {
    subscription, loading: subLoading, starting: trialStarting, cancelling: trialCancelling,
    error: trialError, paymentMethod, startTrial, cancelSubscription, updatePaymentMethod,
  } = useSubscription(user)

  const trialInfo = getSubscriptionDisplayStatus(subscription, today())

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

    // Trial-ending reminder takes priority over everything else that day.
    const trialReminder = getTrialReminderInsight(trialInfo)
    if (trialReminder) { setDailyInsight(trialReminder); return }

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

  const closeRecap = useCallback(() => {
    setRecapOpen(false)
    if (!user) return
    const todayStr = today()
    localStorage.setItem(`okana_recap_seen_${user.id}_${todayStr}`, '1')
    setRecapSeen(true)
  }, [user])

  if (!user) return <GuestLanding />

  function handleChartTabChange(tab) {
    setChartTab(tab)
    if (tab !== 'overview') setActiveTab(tab)
  }

  function handleTimeRangeChange(range) {
    setTimeRange(range)
    setSelectedDay(null)
    if (range !== '5y') setSelectedYear(null)
  }

  function handleDayChange(day) {
    setSelectedDay(prev => prev === day ? null : day)
  }

  function openPage(page) {
    setActivePage(page)
    requestAnimationFrame(() => requestAnimationFrame(() => setPageVisible(true)))
  }

  function closePage() {
    setPageVisible(false)
    setTimeout(() => setActivePage(null), 280)
  }

  function openEdit(tx) { setEditTx(tx); setModalOpen(true) }
  function handleClose() { setModalOpen(false); setEditTx(null) }

  return (
    <div className="bg-bg font-sans h-screen flex flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-[480px] h-full flex flex-col relative">

        <Header
          onMenuOpen={() => setDrawerOpen(true)}
          chartTab={chartTab}
          onChartTabChange={handleChartTabChange}
          onCalendarOpen={() => setCalendarOpen(true)}
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
          onClick={() => trialInfo.status === 'expired' ? setProRequired(true) : setModalOpen(true)}
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
          onClose={() => setDrawerOpen(false)}
          onOpenPage={openPage}
          planLabel={trialInfo.status === 'subscribed' ? 'Pro' : 'Free'}
        />

        <SpendCalendarModal
          open={calendarOpen}
          onClose={() => setCalendarOpen(false)}
          transactions={transactions}
          recap={recapAvailable ? {
            available: true,
            seen: recapSeen,
            monthName: recapMonthName,
            onOpen: () => { setCalendarOpen(false); setRecapOpen(true) },
          } : null}
        />

        <DailyInsightModal
          insight={dailyInsight}
          onClose={() => setDailyInsight(null)}
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
            onClick={() => setProRequired(false)}
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
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => { setProRequired(false); openPage('subscription') }}
                  className="w-full py-[13px] rounded-2xl text-sm font-semibold glass-active text-white active:scale-95 transition-all"
                >
                  View Plans
                </button>
                <button
                  onClick={() => setProRequired(false)}
                  className="w-full py-[10px] text-white/40 text-sm"
                >
                  Not now
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
          {activePage === 'account'      && <AccountPage      onBack={closePage} />}
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
              onEditPaymentMethod={updatePaymentMethod}
            />
          )}
          {activePage === 'settings'     && <SettingsPage     onBack={closePage} />}
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>
  )
}
