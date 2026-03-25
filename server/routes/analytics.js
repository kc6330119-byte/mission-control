import { Router } from 'express'
import db from '../db/index.js'

const router = Router()

// Get AdSense readiness for all projects (must be before /:projectId)
router.get('/readiness/all', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects ORDER BY id').all()
  const results = projects.map(project => {
    const analytics = db.prepare('SELECT * FROM analytics_snapshots WHERE project_id = ? ORDER BY date DESC LIMIT 1').get(project.id)
    const sc = db.prepare('SELECT * FROM search_console_snapshots WHERE project_id = ? ORDER BY date DESC LIMIT 1').get(project.id)
    return {
      project,
      readiness: calculateAdSenseReadiness(project, analytics || {}, sc || {}),
    }
  })
  res.json(results)
})

// Get analytics for a project (from snapshots, or placeholder)
router.get('/:projectId', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.projectId)
  if (!project) return res.status(404).json({ error: 'Project not found' })

  // Get stored snapshots
  const analytics = db.prepare(
    'SELECT * FROM analytics_snapshots WHERE project_id = ? ORDER BY date DESC LIMIT 28'
  ).all(req.params.projectId)

  const searchConsole = db.prepare(
    'SELECT * FROM search_console_snapshots WHERE project_id = ? ORDER BY date DESC LIMIT 28'
  ).all(req.params.projectId)

  // If no data, return placeholder data for UI development
  if (analytics.length === 0 && searchConsole.length === 0) {
    return res.json(generatePlaceholderData(project))
  }

  // Calculate AdSense readiness
  const latest = analytics[0] || {}
  const latestSC = searchConsole[0] || {}
  const readiness = calculateAdSenseReadiness(project, latest, latestSC)

  res.json({
    project,
    analytics: analytics.reverse(),
    searchConsole: searchConsole.reverse(),
    readiness,
  })
})

// Store new analytics snapshot
router.post('/:projectId', (req, res) => {
  const { date, active_users, new_users, sessions, bounce_rate, avg_session_duration, organic_users, direct_users, referral_users } = req.body
  const result = db.prepare(
    'INSERT INTO analytics_snapshots (project_id, date, active_users, new_users, sessions, bounce_rate, avg_session_duration, organic_users, direct_users, referral_users) VALUES (?,?,?,?,?,?,?,?,?,?)'
  ).run(req.params.projectId, date, active_users || 0, new_users || 0, sessions || 0, bounce_rate || 0, avg_session_duration || 0, organic_users || 0, direct_users || 0, referral_users || 0)
  res.status(201).json({ id: result.lastInsertRowid })
})

// Store new search console snapshot
router.post('/:projectId/search-console', (req, res) => {
  const { date, total_clicks, total_impressions, avg_ctr, avg_position, indexed_pages } = req.body
  const result = db.prepare(
    'INSERT INTO search_console_snapshots (project_id, date, total_clicks, total_impressions, avg_ctr, avg_position, indexed_pages) VALUES (?,?,?,?,?,?,?)'
  ).run(req.params.projectId, date, total_clicks || 0, total_impressions || 0, avg_ctr || 0, avg_position || 0, indexed_pages || 0)
  res.status(201).json({ id: result.lastInsertRowid })
})

function calculateAdSenseReadiness(project, analytics, searchConsole) {
  let score = 0
  const breakdown = []

  // Daily organic users (target: 50+) — 25 points
  const organicUsers = analytics.organic_users || 0
  const organicScore = Math.min(25, Math.round((organicUsers / 50) * 25))
  score += organicScore
  breakdown.push({ metric: 'Daily Organic Users', value: organicUsers, target: 50, points: organicScore, max: 25 })

  // Google as top organic source — 15 points
  const isGoogleTop = organicUsers > (analytics.direct_users || 0) && organicUsers > (analytics.referral_users || 0)
  const googleScore = isGoogleTop ? 15 : 0
  score += googleScore
  breakdown.push({ metric: 'Google Top Source', value: isGoogleTop ? 'Yes' : 'No', target: 'Yes', points: googleScore, max: 15 })

  // Indexed pages — 15 points
  const indexed = searchConsole.indexed_pages || 0
  const indexedScore = Math.min(15, Math.round((indexed / 100) * 15))
  score += indexedScore
  breakdown.push({ metric: 'Indexed Pages', value: indexed, target: 100, points: indexedScore, max: 15 })

  // Bounce rate (target: under 40%) — 15 points
  const bounceRate = analytics.bounce_rate || 100
  const bounceScore = bounceRate <= 40 ? 15 : Math.max(0, Math.round((1 - (bounceRate - 40) / 60) * 15))
  score += bounceScore
  breakdown.push({ metric: 'Bounce Rate', value: `${bounceRate}%`, target: '<40%', points: bounceScore, max: 15 })

  // Session duration (target: 3+ min) — 15 points
  const duration = analytics.avg_session_duration || 0
  const durationScore = Math.min(15, Math.round((duration / 180) * 15))
  score += durationScore
  breakdown.push({ metric: 'Avg Session Duration', value: `${Math.round(duration)}s`, target: '180s', points: durationScore, max: 15 })

  // Blog post count (target: 25+) — 15 points
  const blogs = project.blog_post_count || 0
  const blogScore = Math.min(15, Math.round((blogs / 25) * 15))
  score += blogScore
  breakdown.push({ metric: 'Blog Posts', value: blogs, target: 25, points: blogScore, max: 15 })

  let status, recommendation
  if (score >= 80) { status = 'Ready'; recommendation = 'This site meets most AdSense criteria. Submit when ready.' }
  else if (score >= 50) { status = 'Getting Close'; recommendation = 'Focus on the weakest metrics below to improve your chances.' }
  else { status = 'Not Yet'; recommendation = 'More work needed before submission. Build traffic and content first.' }

  return { score, status, recommendation, breakdown }
}

function generatePlaceholderData(project) {
  const days = 28
  const now = new Date()
  const analytics = []
  const searchConsole = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const trend = (days - i) / days // upward trend

    analytics.push({
      date: dateStr,
      active_users: Math.round(5 + trend * 30 + Math.random() * 10),
      new_users: Math.round(3 + trend * 20 + Math.random() * 8),
      sessions: Math.round(8 + trend * 40 + Math.random() * 15),
      bounce_rate: Math.round(65 - trend * 25 + Math.random() * 10),
      avg_session_duration: Math.round(60 + trend * 120 + Math.random() * 30),
      organic_users: Math.round(2 + trend * 20 + Math.random() * 5),
      direct_users: Math.round(2 + Math.random() * 5),
      referral_users: Math.round(1 + Math.random() * 3),
    })

    searchConsole.push({
      date: dateStr,
      total_clicks: Math.round(10 + trend * 80 + Math.random() * 20),
      total_impressions: Math.round(200 + trend * 1500 + Math.random() * 200),
      avg_ctr: +(2 + trend * 3 + Math.random()).toFixed(1),
      avg_position: +(35 - trend * 15 + Math.random() * 5).toFixed(1),
      indexed_pages: Math.round(50 + trend * 200),
    })
  }

  const latestA = analytics[analytics.length - 1]
  const latestSC = searchConsole[searchConsole.length - 1]

  return {
    project,
    analytics,
    searchConsole,
    readiness: calculateAdSenseReadiness(project, latestA, latestSC),
    isPlaceholder: true,
  }
}

export default router
