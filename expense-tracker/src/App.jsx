import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import SummaryCard from './components/SummaryCard'
import TransactionList from './components/TransactionList'
import AddModal from './components/AddModal'
import Drawer from './components/Drawer'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import { useTransactions } from './hooks/useTransactions'
import { currentMonthYear } from './utils/format'

function Dashboard() {
  const { month: currMonth, year: currYear } = currentMonthYear()
  const [activeTab, setActiveTab] = useState('expense')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTx, setEditTx] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(currMonth)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { transactions, addTransaction, editTransaction, deleteTransaction } = useTransactions()

  function openEdit(tx) {
    setEditTx(tx)
    setModalOpen(true)
  }

  function handleClose() {
    setModalOpen(false)
    setEditTx(null)
  }

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="mx-auto max-w-[480px] min-h-screen relative">

        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onMenuOpen={() => setDrawerOpen(true)}
        />

        <SummaryCard
          transactions={transactions}
          activeTab={activeTab}
          selectedMonth={selectedMonth}
          year={currYear}
          onMonthChange={setSelectedMonth}
        />

        <div className="mt-2">
          <TransactionList
            transactions={transactions}
            activeTab={activeTab}
            selectedMonth={selectedMonth}
            year={currYear}
            onDelete={deleteTransaction}
            onEdit={openEdit}
          />
        </div>

        {/* Floating + button */}
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

        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

        <AddModal
          open={modalOpen}
          onClose={handleClose}
          onAdd={addTransaction}
          onEdit={editTransaction}
          editData={editTx}
        />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  )
}
