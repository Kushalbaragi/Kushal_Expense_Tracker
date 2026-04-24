import express from 'express'
import cors from 'cors'
import transactionsRouter from './routes/transactions.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }))
app.use(express.json())

app.use('/api/transactions', transactionsRouter)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

app.listen(PORT, () => {
  console.log(`Expense Tracker API running on http://localhost:${PORT}`)
})
