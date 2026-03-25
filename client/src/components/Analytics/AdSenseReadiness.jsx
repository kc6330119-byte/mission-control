import { projectColors } from '../../utils/colors'
import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

const statusConfig = {
  'Ready': { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/15', ring: 'ring-emerald-500/30' },
  'Getting Close': { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/15', ring: 'ring-yellow-500/30' },
  'Not Yet': { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/15', ring: 'ring-red-500/30' },
}

export default function AdSenseReadiness({ readiness, project }) {
  if (!readiness) return null

  const config = statusConfig[readiness.status] || statusConfig['Not Yet']
  const StatusIcon = config.icon
  const colors = projectColors[project?.color_tag] || projectColors.gray

  // Ring progress calculation
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (readiness.score / 100) * circumference

  return (
    <div className={`bg-dark-800 rounded-xl border border-dark-700 p-5`}>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-semibold">AdSense Readiness Score</h2>
      </div>

      <div className="flex items-start gap-6">
        {/* Score circle */}
        <div className="relative flex-shrink-0">
          <svg width="100" height="100" className="-rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="40" fill="none"
              stroke={readiness.score >= 80 ? '#10b981' : readiness.score >= 50 ? '#eab308' : '#ef4444'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold font-mono">{readiness.score}</span>
            <span className="text-[10px] text-gray-500">/100</span>
          </div>
        </div>

        {/* Status and recommendation */}
        <div className="flex-1">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${config.bg} ${config.color} text-sm font-medium mb-2`}>
            <StatusIcon className="w-4 h-4" />
            {readiness.status}
          </div>
          <p className="text-sm text-gray-300">{readiness.recommendation}</p>
        </div>
      </div>

      {/* Breakdown table */}
      <div className="mt-5 space-y-2">
        {readiness.breakdown?.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400">{item.metric}</span>
                <span className="text-gray-300 font-mono">
                  {item.value} <span className="text-gray-600">/ {item.target}</span>
                </span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    item.points >= item.max ? 'bg-emerald-500' : item.points >= item.max * 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(item.points / item.max) * 100}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-mono text-gray-500 w-10 text-right">{item.points}/{item.max}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
