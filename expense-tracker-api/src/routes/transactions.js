import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../db/db.js'

const router = Router()

// GET /api/transactions?type=expense|income
router.get('/', (req, res) => {
  const { type } = req.query
  let data = db.read()
  if (type === 'expense' || type === 'income') {
    data = data.filter(tx => tx.type === type)
  }
  res.json(data)
})

// GET /api/transactions/:id
router.get('/:id', (req, res) => {
  const tx = db.read().find(t => t.id === req.params.id)
  if (!tx) return res.status(404).json({ error: 'Transaction not found' })
  res.json(tx)
})

// POST /api/transactions
router.post('/', (req, res) => {
  const { type, amount, date, description } = req.body

  if (!type || !['expense', 'income'].includes(type)) {
    return res.status(400).json({ error: 'type must be "expense" or "income"' })
  }
  const parsed = parseFloat(amount)
  if (!parsed || parsed <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' })
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'date must be in YYYY-MM-DD format' })
  }

  const tx = {
    id: uuidv4(),
    type,
    amount: parsed,
    date,
    description: (description ?? '').trim(),
    createdAt: new Date().toISOString(),
  }

  const data = db.read()
  data.unshift(tx)
  db.write(data)
  res.status(201).json(tx)
})

// DELETE /api/transactions/:id
router.delete('/:id', (req, res) => {
  const data = db.read()
  const idx = data.findIndex(t => t.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Transaction not found' })
  const [removed] = data.splice(idx, 1)
  db.write(data)
  res.json(removed)
})

export default router
