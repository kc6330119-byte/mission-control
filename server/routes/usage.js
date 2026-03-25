import { Router } from 'express'
import db from '../db/index.js'

const router = Router()

// Get latest snapshot
router.get('/current', (req, res) => {
  const latest = db.prepare('SELECT * FROM usage_snapshots ORDER BY date DESC, id DESC LIMIT 1').get()
  if (!latest) return res.json(null)
  res.json(latest)
})

// Get history for trend charts
router.get('/history', (req, res) => {
  const { days } = req.query
  const limit = parseInt(days) || 30
  const snapshots = db.prepare(
    'SELECT * FROM usage_snapshots ORDER BY date ASC, id ASC'
  ).all()
  // Deduplicate by date — keep the latest entry per day
  const byDate = {}
  for (const s of snapshots) {
    byDate[s.date] = s
  }
  const result = Object.values(byDate).slice(-limit)
  res.json(result)
})

// Add new snapshot
router.post('/', (req, res) => {
  const { date, session_pct, weekly_pct, sonnet_pct, extra_spend, extra_limit, extra_balance, plan, notes } = req.body
  const snapshotDate = date || new Date().toISOString().split('T')[0]

  const result = db.prepare(
    'INSERT INTO usage_snapshots (date, session_pct, weekly_pct, sonnet_pct, extra_spend, extra_limit, extra_balance, plan, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    snapshotDate,
    session_pct ?? 0,
    weekly_pct ?? 0,
    sonnet_pct ?? 0,
    extra_spend ?? 0,
    extra_limit ?? 100,
    extra_balance ?? 0,
    plan || 'Max 5x',
    notes || null
  )

  db.prepare('INSERT INTO activity_log (type, message, agent) VALUES (?, ?, ?)').run(
    'system', `Usage snapshot logged: session ${session_pct ?? 0}%, weekly ${weekly_pct ?? 0}%, extra $${(extra_spend ?? 0).toFixed(2)}`, null
  )

  const snapshot = db.prepare('SELECT * FROM usage_snapshots WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(snapshot)
})

// Automated usage logging (for scheduled tasks / external scripts)
router.post('/auto', (req, res) => {
  const { date, session_pct, weekly_pct, sonnet_pct, extra_spend, extra_limit, extra_balance, plan, notes } = req.body
  const snapshotDate = date || new Date().toISOString().split('T')[0]

  const result = db.prepare(
    'INSERT INTO usage_snapshots (date, session_pct, weekly_pct, sonnet_pct, extra_spend, extra_limit, extra_balance, plan, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    snapshotDate,
    session_pct ?? 0,
    weekly_pct ?? 0,
    sonnet_pct ?? 0,
    extra_spend ?? 0,
    extra_limit ?? 100,
    extra_balance ?? 0,
    plan || 'Max 5x',
    notes || 'auto'
  )

  db.prepare('INSERT INTO activity_log (type, message, agent) VALUES (?, ?, ?)').run(
    'system', `Auto usage snapshot: session ${session_pct ?? 0}%, weekly ${weekly_pct ?? 0}%, extra $${(extra_spend ?? 0).toFixed(2)}`, 'Zoe'
  )

  const snapshot = db.prepare('SELECT * FROM usage_snapshots WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(snapshot)
})

export default router
