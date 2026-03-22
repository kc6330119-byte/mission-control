import { Router } from 'express'
import db from '../db/index.js'

const router = Router()

// List all tasks with optional filters
router.get('/', (req, res) => {
  const { status, project_id, assignee, priority } = req.query
  let sql = 'SELECT t.*, p.name as project_name, p.color_tag FROM tasks t LEFT JOIN projects p ON t.project_id = p.id WHERE 1=1'
  const params = []

  if (status) { sql += ' AND t.status = ?'; params.push(status) }
  if (project_id) { sql += ' AND t.project_id = ?'; params.push(project_id) }
  if (assignee) { sql += ' AND t.assignee = ?'; params.push(assignee) }
  if (priority) { sql += ' AND t.priority = ?'; params.push(priority) }

  sql += ' ORDER BY t.sort_order ASC, t.created_at DESC'
  res.json(db.prepare(sql).all(...params))
})

// Create task
router.post('/', (req, res) => {
  const { title, description, status, priority, project_id, assignee, due_date } = req.body
  const result = db.prepare(
    'INSERT INTO tasks (title, description, status, priority, project_id, assignee, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(title, description, status || 'backlog', priority || 'medium', project_id || null, assignee || null, due_date || null)

  // Log activity
  db.prepare('INSERT INTO activity_log (type, message, agent, project_id) VALUES (?, ?, ?, ?)').run(
    'task', `Created task: ${title}`, assignee, project_id || null
  )

  const task = db.prepare('SELECT t.*, p.name as project_name, p.color_tag FROM tasks t LEFT JOIN projects p ON t.project_id = p.id WHERE t.id = ?').get(result.lastInsertRowid)
  res.status(201).json(task)
})

// Update task
router.put('/:id', (req, res) => {
  const { title, description, status, priority, project_id, assignee, due_date, sort_order } = req.body
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Task not found' })

  db.prepare(`
    UPDATE tasks SET title=?, description=?, status=?, priority=?, project_id=?, assignee=?, due_date=?, sort_order=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(
    title ?? existing.title,
    description ?? existing.description,
    status ?? existing.status,
    priority ?? existing.priority,
    project_id !== undefined ? project_id : existing.project_id,
    assignee ?? existing.assignee,
    due_date !== undefined ? due_date : existing.due_date,
    sort_order ?? existing.sort_order,
    req.params.id
  )

  // Log status changes
  if (status && status !== existing.status) {
    db.prepare('INSERT INTO activity_log (type, message, agent, project_id) VALUES (?, ?, ?, ?)').run(
      'task', `Moved "${existing.title}" to ${status}`, assignee || existing.assignee, existing.project_id
    )
  }

  const task = db.prepare('SELECT t.*, p.name as project_name, p.color_tag FROM tasks t LEFT JOIN projects p ON t.project_id = p.id WHERE t.id = ?').get(req.params.id)
  res.json(task)
})

// Batch reorder
router.put('/reorder/batch', (req, res) => {
  const { tasks } = req.body // [{id, status, sort_order}]
  const stmt = db.prepare('UPDATE tasks SET status=?, sort_order=?, updated_at=CURRENT_TIMESTAMP WHERE id=?')
  const updateMany = db.transaction((items) => {
    for (const t of items) stmt.run(t.status, t.sort_order, t.id)
  })
  updateMany(tasks)
  res.json({ ok: true })
})

// Delete task
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Task not found' })
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id)
  db.prepare('INSERT INTO activity_log (type, message, agent, project_id) VALUES (?, ?, ?, ?)').run(
    'task', `Deleted task: ${existing.title}`, null, existing.project_id
  )
  res.json({ ok: true })
})

export default router
