import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { projectColors } from '../../utils/colors'
import GAWidget from './GAWidget'
import SearchConsoleWidget from './SearchConsoleWidget'
import AdSenseReadiness from './AdSenseReadiness'
import { BarChart3, AlertTriangle } from 'lucide-react'

export default function Analytics() {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getProjects().then(p => {
      setProjects(p)
      if (p.length > 0) setSelectedProject(p[0])
    })
  }, [])

  useEffect(() => {
    if (!selectedProject) return
    setLoading(true)
    api.getAnalytics(selectedProject.id).then(d => {
      setData(d)
      setLoading(false)
    })
  }, [selectedProject])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-blue-400" />
          <h1 className="text-2xl font-bold">Analytics</h1>
        </div>
      </div>

      {/* Project selector tabs */}
      <div className="flex gap-2 border-b border-dark-700 pb-3">
        {projects.map(p => {
          const colors = projectColors[p.color_tag] || projectColors.gray
          const isSelected = selectedProject?.id === p.id
          return (
            <button
              key={p.id}
              onClick={() => setSelectedProject(p)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                isSelected
                  ? `${colors.bg} ${colors.text} border ${colors.border}`
                  : 'text-gray-400 hover:text-gray-200 hover:bg-dark-800'
              }`}
            >
              {p.name}
            </button>
          )
        })}
      </div>

      {/* Placeholder notice */}
      {data?.isPlaceholder && (
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Showing placeholder data. Connect Google Analytics and Search Console APIs for live data.
        </div>
      )}

      {loading ? (
        <div className="text-gray-500 text-sm">Loading analytics...</div>
      ) : data ? (
        <div className="space-y-6">
          {/* AdSense Readiness Score */}
          <AdSenseReadiness readiness={data.readiness} project={data.project} />

          {/* GA + Search Console side by side */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <GAWidget data={data.analytics} project={data.project} />
            <SearchConsoleWidget data={data.searchConsole} project={data.project} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
