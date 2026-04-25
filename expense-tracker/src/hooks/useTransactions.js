import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// Normalize Supabase row → app shape (snake_case → camelCase)
function fromRow(row) {
  return {
    id:          row.id,
    type:        row.type,
    amount:      parseFloat(row.amount),
    date:        row.date,          // 'YYYY-MM-DD'
    description: row.description,
    createdAt:   row.created_at,
  }
}

export function useTransactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch all transactions for the current user
  useEffect(() => {
    if (!user) { setTransactions([]); return }

    setLoading(true)
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setTransactions(data.map(fromRow))
        setLoading(false)
      })
  }, [user])

  async function addTransaction({ type, amount, date, description }) {
    if (!user) return

    const optimistic = {
      id:          crypto.randomUUID(),
      type,
      amount:      parseFloat(amount),
      date,
      description: description.trim(),
      createdAt:   new Date().toISOString(),
      _pending:    true,
    }

    // Optimistic update
    setTransactions(prev => [optimistic, ...prev])

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id:     user.id,
        type,
        amount:      parseFloat(amount),
        date,
        description: description.trim(),
      })
      .select()
      .single()

    if (error) {
      // Rollback
      setTransactions(prev => prev.filter(tx => tx.id !== optimistic.id))
      console.error('addTransaction error:', error.message)
    } else {
      // Replace optimistic row with real row from DB
      setTransactions(prev =>
        prev.map(tx => tx.id === optimistic.id ? fromRow(data) : tx)
      )
    }
  }

  async function editTransaction(id, { type, amount, date, description }) {
    if (!user) return

    // Optimistic update
    setTransactions(prev =>
      prev.map(tx =>
        tx.id === id
          ? { ...tx, type, amount: parseFloat(amount), date, description: description.trim() }
          : tx
      )
    )

    const { error } = await supabase
      .from('transactions')
      .update({ type, amount: parseFloat(amount), date, description: description.trim() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('editTransaction error:', error.message)
      // Refetch to restore correct state
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
      if (data) setTransactions(data.map(fromRow))
    }
  }

  async function deleteTransaction(id) {
    if (!user) return

    // Optimistic update
    setTransactions(prev => prev.filter(tx => tx.id !== id))

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('deleteTransaction error:', error.message)
      // Refetch to restore correct state
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
      if (data) setTransactions(data.map(fromRow))
    }
  }

  return { transactions, loading, addTransaction, editTransaction, deleteTransaction }
}
