import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../utils/api'
import { projectColors, priorityColors, statusColors } from '../../utils/colors'
import { formatDistanceToNow } from 'date-fns'
import {
  ArrowLeft, Globe, FileText, Database, Calendar, Flag,
  User, CheckCircle, XCircle, Clock, ExternalLink
} from 'lucide-react'

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getProject(id).then(p => { setProject(p); setLoading(false) })
  }, [id])

  if (loading) return <div className="text-gray-500">Loading...</div>
  if (!project) return <div className="text-gray-500">Project not found.</div>

  const colors = projectColors[project.color_tag] || projectColors.gray
  const tasks = project.tasks || []
  const adsenseHistory = project.adsense_history || []
  const activeTasks = tasks.filter(t => t.status !== 'done')

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Link to="/projects" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-200 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      {/* Header */}
      <div className={`bg-dark-800 rounded-xl border ${colors.border} p-6`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3.5 h-3.5 rounded-full ${colors.dot}`} />
              <h1 className="text-2xl font-bold">{project.name}</h1>
            </div>
            <div className="flex items-center gap-1.5 ml-6">
              <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-400">{project.url}</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${colors.bg} ${colors.text}`}>{project.status}</span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-dark-900/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
              <Database className="w-3.5 h-3.5" /> Listings
            </div>
            <p className="text-xl font-bold font-mono">{project.listing_count?.toLocaleString()}</p>
          </div>
          <div className="bg-dark-900/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
              <FileText className="w-3.5 h-3.5" /> Blog Posts
            </div>
            <p className="text-xl font-bold font-mono">{project.blog_post_count}</p>
          </div>
          <div className="bg-dark-900/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
              <Globe className="w-3.5 h-3.5" /> AdSense
            </div>
            <p className={`text-sm font-medium ${colors.text}`}>{project.adsense_status}</p>
          </div>
          <div className="bg-dark-900/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
              <Flag className="w-3.5 h-3.5" /> Tech Stack
            </div>
            <p className="text-xs text-gray-300">{project.tech_stack}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AdSense History */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <h2 className="text-lg font-semibold mb-4">AdSense History</h2>
          {adsenseHistory.length === 0 ? (
            <p className="text-gray-500 text-sm">No submission history yet.</p>
          ) : (
            <div className="space-y-3">
              {adsenseHistory.map(entry => (
                <div key={entry.id} className="flex items-start gap-3 p-3 bg-dark-900/50 rounded-lg">
                  {entry.outcome === 'rejected' ? (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  ) : entry.outcome === 'approved' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-200 capitalize">{entry.outcome}</span>
                      <span className="text-xs text-gray-500">{entry.submission_date}</span>
                    </div>
                    {entry.rejection_reason && <p className="text-xs text-red-400 mt-0.5">{entry.rejection_reason}</p>}
                    {entry.notes && <p className="text-xs text-gray-400 mt-0.5">{entry.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Actions (tasks for this project) */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <h2 className="text-lg font-semibold mb-4">Next Actions</h2>
          {activeTasks.length === 0 ? (
            <p className="text-gray-500 text-sm">No pending tasks for this project.</p>
          ) : (
            <div className="space-y-2">
              {activeTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-dark-900/50 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <Flag className={`w-4 h-4 flex-shrink-0 ${priorityColors[task.priority]}`} />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-200 truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusColors[task.status]} text-white`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        {task.assignee && (
                          <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                            <User className="w-3 h-3" /> {task.assignee}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
