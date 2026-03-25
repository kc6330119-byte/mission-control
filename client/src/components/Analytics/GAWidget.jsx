import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Users, UserPlus, Timer, TrendingDown } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

export default function GAWidget({ data, project }) {
  if (!data || data.length === 0) return null

  const latest = data[data.length - 1]
  const yesterday = data.length >= 2 ? data[data.length - 2] : latest
  const lastWeek = data.length >= 7 ? data[data.length - 7] : data[0]

  // Traffic sources from latest
  const sources = [
    { name: 'Organic', value: latest.organic_users, fill: '#10b981' },
    { name: 'Direct', value: latest.direct_users, fill: '#3b82f6' },
    { name: 'Referral', value: latest.referral_users, fill: '#8b5cf6' },
  ]

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 p-5 space-y-5">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Users className="w-5 h-5 text-blue-400" />
        Google Analytics
      </h2>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-dark-900/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
            <Users className="w-3.5 h-3.5" /> Users Today
          </div>
          <p className="text-xl font-bold font-mono">{latest.active_users}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-gray-500">Yesterday: {yesterday.active_users}</span>
            <span className="text-[10px] text-gray-500">Last week: {lastWeek.active_users}</span>
          </div>
        </div>
        <div className="bg-dark-900/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
            <UserPlus className="w-3.5 h-3.5" /> New Users
          </div>
          <p className="text-xl font-bold font-mono">{latest.new_users}</p>
        </div>
        <div className="bg-dark-900/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
            <Timer className="w-3.5 h-3.5" /> Avg Session
          </div>
          <p className="text-xl font-bold font-mono">{Math.floor(latest.avg_session_duration / 60)}m {latest.avg_session_duration % 60}s</p>
        </div>
        <div className="bg-dark-900/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
            <TrendingDown className="w-3.5 h-3.5" /> Bounce Rate
          </div>
          <p className="text-xl font-bold font-mono">{latest.bounce_rate}%</p>
        </div>
      </div>

      {/* Users trend chart */}
      <div>
        <h3 className="text-sm text-gray-400 mb-2">Users (28-day trend)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={d => d.slice(5)} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} width={30} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="active_users" stroke="#3b82f6" fill="url(#userGrad)" name="Users" />
            <Area type="monotone" dataKey="new_users" stroke="#10b981" fill="none" strokeDasharray="4 4" name="New Users" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Traffic sources */}
      <div>
        <h3 className="text-sm text-gray-400 mb-2">Traffic Sources (Today)</h3>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={sources} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={60} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Users">
              {sources.map((entry, i) => (
                <rect key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
