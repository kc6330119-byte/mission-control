import { Router } from 'express'
import db from '../db/index.js'

const router = Router()

// List recent activity
router.get('/', (req, res) => {
  const { agent, limit } = req.query
  let sql = 'SELECT a.*, p.name as project_name FROM activity_log a LEFT JOIN projects p ON a.project_id = p.id WHERE 1=1'
  const params = []

  if (agent) { sql += ' AND a.agent = ?'; params.push(agent) }
  sql += ' ORDER BY a.created_at DESC LIMIT ?'
  params.push(parseInt(limit) || 50)

  res.json(db.prepare(sql).all(...params))
})

// Create activity entry
router.post('/', (req, res) => {
  const { type, message, agent, project_id } = req.body
  const result = db.prepare(
    'INSERT INTO activity_log (type, message, agent, project_id) VALUES (?, ?, ?, ?)'
  ).run(type || 'system', message, agent || null, project_id || null)
  const entry = db.prepare('SELECT * FROM activity_log WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(entry)
})

export default router
