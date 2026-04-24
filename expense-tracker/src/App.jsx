import { useState } from 'react'
import Header from './components/Header'
import SummaryCard from './components/SummaryCard'
import TransactionList from './components/TransactionList'
import AddModal from './components/AddModal'
import { useTransactions } from './hooks/useTransactions'

export default function App() {
  const [activeTab, setActiveTab] = useState('expense')
  const [modalOpen, setModalOpen] = useState(false)
  const { transactions, addTransaction, deleteTransaction } = useTransactions()

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="mx-auto max-w-[480px] min-h-screen relative">

        <Header activeTab={activeTab} onTabChange={setActiveTab} />

        <SummaryCard transactions={transactions} activeTab={activeTab} />

        <div className="mt-2">
          <TransactionList
            transactions={transactions}
            activeTab={activeTab}
            onDelete={deleteTransaction}
          />
        </div>

        {/* Floating + button */}
        <button
          onClick={() => setModalOpen(true)}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white text-black text-3xl font-light flex items-center justify-center shadow-lg z-30 active:scale-90 transition-transform duration-150 hover:bg-gray-100"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
          aria-label="Add transaction"
        >
          +
        </button>

        <AddModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onAdd={addTransaction}
        />
      </div>
    </div>
  )
}
