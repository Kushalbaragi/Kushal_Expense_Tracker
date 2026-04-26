import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import SummaryCard from './components/SummaryCard'
import TransactionList from './components/TransactionList'
import AddModal from './components/AddModal'
import Drawer from './components/Drawer'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AccountPage from './pages/AccountPage'
import SubscriptionPage from './pages/SubscriptionPage'
import SettingsPage from './pages/SettingsPage'
import { useTransactions } from './hooks/useTransactions'
import { useAuth } from './context/AuthContext'
import { currentMonthYear } from './utils/format'

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
  const [editTx,       setEditTx]       = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(currMonth)
  const [selectedYear,  setSelectedYear]  = useState(null)
  const [selectedDay,   setSelectedDay]   = useState(null)
  const [drawerOpen,   setDrawerOpen]   = useState(false)
  const [activePage,   setActivePage]   = useState(null)  // 'account'|'subscription'|'settings'
  const [pageVisible,  setPageVisible]  = useState(false)
  const { transactions, addTransaction, editTransaction, deleteTransaction } = useTransactions()

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

        <div className="flex-1 overflow-y-auto">
          <TransactionList
            transactions={transactions}
            activeTab={activeTab}
            chartTab={chartTab}
            selectedMonth={selectedMonth}
            year={currYear}
            timeRange={timeRange}
            selectedYear={selectedYear}
            selectedDay={selectedDay}
            onDelete={deleteTransaction}
            onEdit={openEdit}
          />
        </div>

        <button
          onClick={() => setModalOpen(true)}
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

        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onOpenPage={openPage} />

        <AddModal
          open={modalOpen}
          onClose={handleClose}
          onAdd={addTransaction}
          onEdit={editTransaction}
          onDelete={deleteTransaction}
          editData={editTx}
        />
      </div>

      {/* In-app page overlay (account / subscription / settings) */}
      {activePage && (
        <div
          className="fixed inset-0 z-50 bg-[#0a0a0a] overflow-y-auto transition-transform duration-[280ms] ease-out"
          style={{ transform: pageVisible ? 'translateX(0)' : 'translateX(100%)' }}
        >
          {activePage === 'account'      && <AccountPage      onBack={closePage} />}
          {activePage === 'subscription' && <SubscriptionPage onBack={closePage} />}
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
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>
  )
}
