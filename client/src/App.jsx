import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Layout/Sidebar'
import Dashboard from './components/Dashboard/Dashboard'
import TaskBoard from './components/TaskBoard/TaskBoard'
import Projects from './components/Projects/Projects'
import ProjectDetail from './components/Projects/ProjectDetail'
import Mission from './components/Mission/Mission'
import Team from './components/Team/Team'
import Analytics from './components/Analytics/Analytics'
import Memories from './components/Memories/Memories'
import CostTracker from './components/CostTracker/CostTracker'

export default function App() {
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return (
    <div className="flex min-h-screen bg-dark-900 text-gray-100">
      <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<TaskBoard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/memories" element={<Memories />} />
            <Route path="/costs" element={<CostTracker />} />
            <Route path="/mission" element={<Mission />} />
            <Route path="/team" element={<Team />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
