import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../utils/api'
import { projectColors } from '../../utils/colors'
import { formatDistanceToNow } from 'date-fns'
import {
  Globe, FileText, Users, CalendarClock, Activity,
  ArrowRight, Target, Lightbulb, ExternalLink, TrendingUp
} from 'lucide-react'

function healthColor(status) {
  if (status?.toLowerCase().includes('rejected')) return 'bg-red-500'
  if (status?.toLowerCase().includes('waiting') || status?.toLowerCase().includes('pending')) return 'bg-yellow-500'
  if (status?.toLowerCase().includes('approved')) return 'bg-emerald-500'
  return 'bg-gray-500'
}

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [mission, setMission] = useState(null)
  const [activity, setActivity] = useState([])
  const [tasks, setTasks] = useState([])
  const [recommendation, setRecommendation] = useState(null)

  useEffect(() => {
    Promise.all([
      api.getProjects(),
      api.getMission(),
      api.getActivity({ limit: 10 }),
      api.getTasks(),
    ]).then(([p, m, a, t]) => {
      setProjects(p)
      setMission(m)
      setActivity(a)
      setTasks(t)
    })
  }, [])

  const totalListings = projects.reduce((s, p) => s + (p.listing_count || 0), 0)
  const totalBlogs = projects.reduce((s, p) => s + (p.blog_post_count || 0), 0)
  const activeTasks = tasks.filter(t => t.status === 'in_progress').length

  return (
    <div className="space-y-6">
      {/* Mission Statement Banner */}
      {mission && (
        <div className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
          <Target className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-1">Mission</p>
            <p className="text-gray-100">{mission.statement}</p>
          </div>
          <Link to="/mission" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
            Edit <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={() => api.getRecommendation().then(setRecommendation)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Lightbulb className="w-4 h-4" />
          What should we do next?
        </button>
      </div>

      {/* Recommendation */}
      {recommendation && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-semibold">
            <Lightbulb className="w-5 h-5" />
            Recommendation
          </div>
          <p className="text-gray-100 font-medium">{recommendation.recommendation}</p>
          <p className="text-gray-400 text-sm">{recommendation.reasoning}</p>
          <p className="text-gray-500 text-xs">{recommendation.blockers}</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Listings', value: totalListings.toLocaleString(), icon: Globe, color: 'text-blue-400' },
          { label: 'Blog Posts', value: totalBlogs, icon: FileText, color: 'text-emerald-400' },
          { label: 'Active Tasks', value: activeTasks, icon: Activity, color: 'text-yellow-400' },
          { label: 'Projects', value: projects.length, icon: TrendingUp, color: 'text-purple-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-dark-800 rounded-xl p-4 border border-dark-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">{label}</span>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold font-mono">{value}</p>
          </div>
        ))}
      </div>

      {/* Site Status Cards + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Site Status Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Site Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(project => {
              const colors = projectColors[project.color_tag] || projectColors.gray
              return (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className={`bg-dark-800 rounded-xl p-4 border ${colors.border} hover:border-opacity-60 transition-colors block`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${healthColor(project.adsense_status)}`} />
                      <h3 className="font-semibold text-sm">{project.name}</h3>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{project.url}</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Status</span>
                      <span className="text-gray-300">{project.status}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">AdSense</span>
                      <span className={`${colors.text}`}>{project.adsense_status}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Listings</span>
                      <span className="text-gray-300 font-mono">{project.listing_count?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Blog Posts</span>
                      <span className="text-gray-300 font-mono">{project.blog_post_count}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="bg-dark-800 rounded-xl border border-dark-700 divide-y divide-dark-700">
            {activity.length === 0 && (
              <p className="p-4 text-gray-500 text-sm">No activity yet.</p>
            )}
            {activity.map(entry => (
              <div key={entry.id} className="p-3">
                <p className="text-sm text-gray-300">{entry.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  {entry.agent && <span className="text-xs text-blue-400">{entry.agent}</span>}
                  {entry.project_name && <span className="text-xs text-gray-500">· {entry.project_name}</span>}
                  <span className="text-xs text-gray-600">
                    {entry.created_at ? formatDistanceToNow(new Date(entry.created_at + 'Z'), { addSuffix: true }) : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
