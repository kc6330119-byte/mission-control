import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { formatDistanceToNow } from 'date-fns'
import { Activity, ChevronRight, ChevronLeft, User } from 'lucide-react'

const agentColors = {
  Kevin: 'text-blue-400',
  Zoe: 'text-emerald-400',
  'Claude Code': 'text-orange-400',
}

export default function ActivitySidebar() {
  const [activity, setActivity] = useState([])
  const [collapsed, setCollapsed] = useState(false)
  const [agentFilter, setAgentFilter] = useState('')

  useEffect(() => {
    const params = { limit: 30 }
    if (agentFilter) params.agent = agentFilter
    api.getActivity(params).then(setActivity)
  }, [agentFilter])

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      const params = { limit: 30 }
      if (agentFilter) params.agent = agentFilter
      api.getActivity(params).then(setActivity)
    }, 30000)
    return () => clearInterval(interval)
  }, [agentFilter])

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-4 bg-dark-800 rounded-xl border border-dark-700 w-10">
        <button onClick={() => setCollapsed(false)} className="text-gray-500 hover:text-gray-300">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <Activity className="w-4 h-4 text-gray-500 mt-2" />
      </div>
    )
  }

  return (
    <div className="w-72 flex-shrink-0 bg-dark-800 rounded-xl border border-dark-700 flex flex-col">
      <div className="px-3 py-3 border-b border-dark-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold">Live Activity</h3>
        </div>
        <button onClick={() => setCollapsed(true)} className="text-gray-500 hover:text-gray-300">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Agent filter */}
      <div className="px-3 py-2 border-b border-dark-700 flex gap-1">
        {['', 'Kevin', 'Zoe', 'Claude Code'].map(agent => (
          <button
            key={agent}
            onClick={() => setAgentFilter(agent)}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
              agentFilter === agent
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {agent || 'All'}
          </button>
        ))}
      </div>

      {/* Activity entries */}
      <div className="flex-1 overflow-y-auto divide-y divide-dark-700">
        {activity.length === 0 && (
          <p className="p-3 text-gray-500 text-xs">No activity to show.</p>
        )}
        {activity.map(entry => (
          <div key={entry.id} className="px-3 py-2.5">
            <div className="flex items-start gap-2">
              <User className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-300 leading-relaxed">{entry.message}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {entry.agent && (
                    <span className={`text-[10px] font-medium ${agentColors[entry.agent] || 'text-gray-400'}`}>
                      {entry.agent}
                    </span>
                  )}
                  {entry.project_name && (
                    <span className="text-[10px] text-gray-600">· {entry.project_name}</span>
                  )}
                  <span className="text-[10px] text-gray-600">
                    {entry.created_at ? formatDistanceToNow(new Date(entry.created_at + 'Z'), { addSuffix: true }) : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
