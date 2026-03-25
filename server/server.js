import express from 'express'
import cors from 'cors'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { initDb } from './db/index.js'
import tasksRouter from './routes/tasks.js'
import projectsRouter from './routes/projects.js'
import teamRouter from './routes/team.js'
import missionRouter from './routes/mission.js'
import activityRouter from './routes/activity.js'
import memoriesRouter from './routes/memories.js'
import analyticsRouter from './routes/analytics.js'
import usageRouter from './routes/usage.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3333

app.use(cors())
app.use(express.json())

// Initialize database
initDb()

// API routes
app.use('/api/tasks', tasksRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/team', teamRouter)
app.use('/api/mission', missionRouter)
app.use('/api/activity', activityRouter)
app.use('/api/memories', memoriesRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/usage', usageRouter)

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '..', 'dist')))
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '..', 'dist', 'index.html'))
  })
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mission Control running at http://localhost:${PORT}`)
})
