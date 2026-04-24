import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'kexp_transactions'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useTransactions() {
  const [transactions, setTransactions] = useState(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  }, [transactions])

  function addTransaction({ type, amount, date, description }) {
    const tx = {
      id: uuidv4(),
      type,
      amount: parseFloat(amount),
      date,
      description: description.trim(),
      createdAt: new Date().toISOString(),
    }
    setTransactions(prev => [tx, ...prev])
  }

  function deleteTransaction(id) {
    setTransactions(prev => prev.filter(tx => tx.id !== id))
  }

  return { transactions, addTransaction, deleteTransaction }
}
