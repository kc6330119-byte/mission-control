import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Search, MousePointerClick, Eye, TrendingUp, FileText } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  )
}

export default function SearchConsoleWidget({ data, project }) {
  if (!data || data.length === 0) return null

  const latest = data[data.length - 1]
  const totals = data.reduce((acc, d) => ({
    clicks: acc.clicks + d.total_clicks,
    impressions: acc.impressions + d.total_impressions,
  }), { clicks: 0, impressions: 0 })
  const avgCtr = totals.impressions > 0 ? ((totals.clicks / totals.impressions) * 100).toFixed(1) : '0.0'
  const avgPosition = (data.reduce((s, d) => s + d.avg_position, 0) / data.length).toFixed(1)

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 p-5 space-y-5">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Search className="w-5 h-5 text-emerald-400" />
        Search Console
      </h2>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-dark-900/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
            <MousePointerClick className="w-3.5 h-3.5" /> Total Clicks (28d)
          </div>
          <p className="text-xl font-bold font-mono">{totals.clicks.toLocaleString()}</p>
        </div>
        <div className="bg-dark-900/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
            <Eye className="w-3.5 h-3.5" /> Impressions (28d)
          </div>
          <p className="text-xl font-bold font-mono">{totals.impressions.toLocaleString()}</p>
        </div>
        <div className="bg-dark-900/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
            <TrendingUp className="w-3.5 h-3.5" /> Avg CTR
          </div>
          <p className="text-xl font-bold font-mono">{avgCtr}%</p>
        </div>
        <div className="bg-dark-900/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
            <FileText className="w-3.5 h-3.5" /> Avg Position
          </div>
          <p className="text-xl font-bold font-mono">{avgPosition}</p>
        </div>
      </div>

      {/* Clicks & Impressions trend */}
      <div>
        <h3 className="text-sm text-gray-400 mb-2">Clicks & Impressions (28-day)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="impGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={d => d.slice(5)} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} width={40} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="total_clicks" stroke="#10b981" fill="url(#clickGrad)" name="Clicks" />
            <Area type="monotone" dataKey="total_impressions" stroke="#8b5cf6" fill="url(#impGrad)" name="Impressions" strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Index coverage */}
      <div className="bg-dark-900/50 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Indexed Pages</p>
            <p className="text-lg font-bold font-mono">{latest.indexed_pages?.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Position Distribution</p>
            <p className="text-sm font-mono text-gray-300">Avg: {latest.avg_position?.toFixed(1)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
