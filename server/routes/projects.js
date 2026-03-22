import { Router } from 'express'
import db from '../db/index.js'

const router = Router()

// List all projects
router.get('/', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects ORDER BY id').all()
  res.json(projects)
})

// Single project with adsense history and related tasks
router.get('/:id', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id)
  if (!project) return res.status(404).json({ error: 'Project not found' })

  const adsenseHistory = db.prepare('SELECT * FROM adsense_history WHERE project_id = ? ORDER BY submission_date DESC').all(req.params.id)
  const tasks = db.prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY sort_order ASC').all(req.params.id)

  res.json({ ...project, adsense_history: adsenseHistory, tasks })
})

// Update project
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Project not found' })

  const { name, url, status, tech_stack, netlify_url, airtable_base, adsense_status, listing_count, blog_post_count, color_tag } = req.body

  db.prepare(`
    UPDATE projects SET name=?, url=?, status=?, tech_stack=?, netlify_url=?, airtable_base=?, adsense_status=?, listing_count=?, blog_post_count=?, color_tag=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(
    name ?? existing.name,
    url ?? existing.url,
    status ?? existing.status,
    tech_stack ?? existing.tech_stack,
    netlify_url ?? existing.netlify_url,
    airtable_base ?? existing.airtable_base,
    adsense_status ?? existing.adsense_status,
    listing_count ?? existing.listing_count,
    blog_post_count ?? existing.blog_post_count,
    color_tag ?? existing.color_tag,
    req.params.id
  )

  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id)
  res.json(updated)
})

export default router
