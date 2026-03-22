import { Router } from 'express'
import db from '../db/index.js'

const router = Router()

// List all team members
router.get('/', (req, res) => {
  const members = db.prepare('SELECT * FROM team_members ORDER BY id').all()
  // Attach task counts
  const enriched = members.map(m => {
    const assigned = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE assignee = ?").get(m.name)
    const completed = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE assignee = ? AND status = 'done'").get(m.name)
    return { ...m, tasks_assigned: assigned.c, tasks_completed: completed.c }
  })
  res.json(enriched)
})

// Get activity for an agent
router.get('/:id/activity', (req, res) => {
  const member = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id)
  if (!member) return res.status(404).json({ error: 'Team member not found' })

  const activity = db.prepare(
    'SELECT * FROM activity_log WHERE agent = ? ORDER BY created_at DESC LIMIT 50'
  ).all(member.name)
  res.json(activity)
})

// Update team member
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Team member not found' })

  const { status, role, description } = req.body
  db.prepare('UPDATE team_members SET status=?, role=?, description=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(
    status ?? existing.status,
    role ?? existing.role,
    description ?? existing.description,
    req.params.id
  )

  const updated = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id)
  res.json(updated)
})

export default router
