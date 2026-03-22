import { Router } from 'express'
import db from '../db/index.js'

const router = Router()

// Get current mission statement
router.get('/', (req, res) => {
  const mission = db.prepare('SELECT * FROM mission ORDER BY id DESC LIMIT 1').get()
  res.json(mission || { statement: '' })
})

// Update mission statement
router.put('/', (req, res) => {
  const { statement } = req.body
  const existing = db.prepare('SELECT * FROM mission ORDER BY id DESC LIMIT 1').get()
  if (existing) {
    db.prepare('UPDATE mission SET statement=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(statement, existing.id)
  } else {
    db.prepare('INSERT INTO mission (statement) VALUES (?)').run(statement)
  }
  db.prepare('INSERT INTO activity_log (type, message, agent) VALUES (?, ?, ?)').run(
    'mission', 'Mission statement updated', 'Kevin'
  )
  const updated = db.prepare('SELECT * FROM mission ORDER BY id DESC LIMIT 1').get()
  res.json(updated)
})

// Get AI recommendation for next task
router.get('/recommend', (req, res) => {
  const mission = db.prepare('SELECT statement FROM mission ORDER BY id DESC LIMIT 1').get()
  const projects = db.prepare('SELECT * FROM projects ORDER BY id').all()
  const tasks = db.prepare("SELECT t.*, p.name as project_name FROM tasks t LEFT JOIN projects p ON t.project_id = p.id WHERE t.status != 'done' ORDER BY CASE t.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END, t.created_at ASC").all()

  // Simple rule-based recommendation engine
  const blockers = tasks.filter(t => t.status === 'in_progress')
  const highPriority = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high')
  const todoTasks = tasks.filter(t => t.status === 'todo')

  let recommendation = ''
  let reasoning = ''
  let recommendedTask = null

  if (highPriority.length > 0) {
    recommendedTask = highPriority[0]
    reasoning = `This is the highest priority task. ${recommendedTask.project_name ? `It's for ${recommendedTask.project_name}, which` : 'It'} directly supports the mission: "${mission?.statement || 'No mission set'}".`
  } else if (todoTasks.length > 0) {
    recommendedTask = todoTasks[0]
    reasoning = `This is the next task ready to start. Moving it forward keeps momentum toward the mission.`
  } else if (tasks.length > 0) {
    recommendedTask = tasks[0]
    reasoning = `This task is in the backlog and should be prioritized to make progress.`
  }

  if (recommendedTask) {
    recommendation = `Focus on: "${recommendedTask.title}"${recommendedTask.project_name ? ` (${recommendedTask.project_name})` : ''}`
  } else {
    recommendation = 'All tasks are complete! Consider reviewing your mission and adding new goals.'
    reasoning = 'No pending tasks found.'
  }

  const blockersInfo = blockers.length > 0
    ? `Currently in progress: ${blockers.map(b => `"${b.title}"`).join(', ')}`
    : 'No tasks currently in progress.'

  res.json({
    recommendation,
    reasoning,
    task: recommendedTask,
    blockers: blockersInfo,
    mission: mission?.statement || '',
    total_pending: tasks.length,
  })
})

export default router
