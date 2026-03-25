import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { format } from 'date-fns'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import {
  DollarSign, AlertTriangle, TrendingUp, Clock, Zap,
  Plus, Save, Loader, CreditCard, Gauge
} from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {entry.value}{entry.name.includes('$') ? '' : '%'}
        </p>
      ))}
    </div>
  )
}

function UsageGauge({ value, max, label, color, alertAt }) {
  const pct = Math.min(100, (value / max) * 100)
  const isAlert = alertAt && value >= alertAt
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="88" height="88" className="-rotate-90">
          <circle cx="44" cy="44" r="36" fill="none" stroke="#334155" strokeWidth="6" />
          <circle
            cx="44" cy="44" r="36" fill="none"
            stroke={isAlert ? '#ef4444' : color}
            strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold font-mono">{value}</span>
          <span className="text-[10px] text-gray-500">/ {max}</span>
        </div>
      </div>
      <span className="text-xs text-gray-400 mt-1">{label}</span>
    </div>
  )
}

function UsageBar({ value, max, label, color, alertAt, unit }) {
  const pct = Math.min(100, (value / max) * 100)
  const isAlert = alertAt && value >= alertAt
  const alertPct = alertAt ? (alertAt / max) * 100 : null

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs font-mono text-gray-300">
          {unit === '$' ? `$${value.toFixed(2)}` : `${value}%`}
          <span className="text-gray-600"> / {unit === '$' ? `$${max.toFixed(2)}` : `${max}%`}</span>
        </span>
      </div>
      <div className="relative w-full bg-dark-700 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${isAlert ? 'bg-red-500' : ''}`}
          style={{ width: `${pct}%`, backgroundColor: isAlert ? undefined : color }}
        />
        {alertPct && (
          <div
            className="absolute top-0 h-3 w-0.5 bg-yellow-500/70"
            style={{ left: `${alertPct}%` }}
            title={`Alert at ${alertAt}${unit === '$' ? '' : '%'}`}
          />
        )}
      </div>
    </div>
  )
}

export default function CostTracker() {
  const [current, setCurrent] = useState(null)
  const [history, setHistory] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    session_pct: '', weekly_pct: '', sonnet_pct: '',
    extra_spend: '', extra_limit: '100', extra_balance: '',
    plan: 'Max 5x', notes: '',
  })

  function load() {
    api.getUsageCurrent().then(setCurrent)
    api.getUsageHistory(14).then(setHistory)
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await api.logUsage({
      session_pct: parseInt(form.session_pct) || 0,
      weekly_pct: parseInt(form.weekly_pct) || 0,
      sonnet_pct: parseInt(form.sonnet_pct) || 0,
      extra_spend: parseFloat(form.extra_spend) || 0,
      extra_limit: parseFloat(form.extra_limit) || 100,
      extra_balance: parseFloat(form.extra_balance) || 0,
      plan: form.plan,
      notes: form.notes || null,
    })
    setSaving(false)
    setShowForm(false)
    setForm({ session_pct: '', weekly_pct: '', sonnet_pct: '', extra_spend: '', extra_limit: '100', extra_balance: '', plan: 'Max 5x', notes: '' })
    load()
  }

  const alerts = []
  if (current) {
    if (current.weekly_pct >= 60) alerts.push({ type: 'warning', message: `Weekly usage at ${current.weekly_pct}% — approaching limit` })
    if (current.extra_balance !== null && current.extra_balance < 5 && current.extra_spend > 0) alerts.push({ type: 'danger', message: `Extra usage balance low: $${current.extra_balance.toFixed(2)} remaining` })
    if (current.session_pct >= 80) alerts.push({ type: 'warning', message: `Session usage at ${current.session_pct}% — nearing cap` })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="w-7 h-7 text-emerald-400" />
          <h1 className="text-2xl font-bold">Cost Tracker</h1>
          {current && <span className="text-sm text-gray-500">{current.plan}</span>}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Log Usage
        </button>
      </div>

      {/* Last refreshed */}
      {current?.created_at && (
        <p className="text-xs text-gray-500 flex items-center gap-1 -mt-4">
          <Clock className="w-3 h-3" />
          Last refreshed: {format(new Date(current.created_at + (current.created_at.includes('Z') ? '' : 'Z')), 'MMMM d, yyyy \'at\' h:mm a')}
        </p>
      )}

      {/* Alerts */}
      {alerts.map((alert, i) => (
        <div key={i} className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          alert.type === 'danger' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
        }`}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {alert.message}
        </div>
      ))}

      {/* Entry form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-dark-800 rounded-xl border border-dark-700 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-300">Log Current Usage</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'session_pct', label: 'Session %', placeholder: '41' },
              { key: 'weekly_pct', label: 'Weekly %', placeholder: '38' },
              { key: 'sonnet_pct', label: 'Sonnet %', placeholder: '0' },
              { key: 'extra_spend', label: 'Extra Spend ($)', placeholder: '29.05' },
              { key: 'extra_limit', label: 'Extra Limit ($)', placeholder: '100' },
              { key: 'extra_balance', label: 'Extra Balance ($)', placeholder: '0.82' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <input
                  type="number"
                  step="any"
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Plan</label>
              <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))} className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-gray-200">
                <option>Max 5x</option>
                <option>Pro</option>
                <option>Free</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Notes</label>
              <input
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Optional"
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm">
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
            </button>
          </div>
        </form>
      )}

      {current ? (
        <>
          {/* Gauges row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 flex justify-center">
              <UsageGauge value={current.session_pct} max={100} label="Session" color="#3b82f6" alertAt={80} />
            </div>
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 flex justify-center">
              <UsageGauge value={current.weekly_pct} max={100} label="Weekly" color="#8b5cf6" alertAt={60} />
            </div>
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 flex flex-col items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-400 mb-2" />
              <p className="text-2xl font-bold font-mono">${current.extra_spend.toFixed(2)}</p>
              <p className="text-[10px] text-gray-500">Extra Usage Spend</p>
              <p className="text-xs text-gray-400 mt-1">of ${current.extra_limit.toFixed(2)} limit</p>
            </div>
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 flex flex-col items-center justify-center">
              <Zap className={`w-5 h-5 mb-2 ${current.extra_balance < 5 ? 'text-red-400' : 'text-emerald-400'}`} />
              <p className={`text-2xl font-bold font-mono ${current.extra_balance < 5 ? 'text-red-400' : ''}`}>
                ${current.extra_balance.toFixed(2)}
              </p>
              <p className="text-[10px] text-gray-500">Extra Balance</p>
              <p className="text-xs text-gray-400 mt-1">{current.plan}</p>
            </div>
          </div>

          {/* Usage bars */}
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-400" /> Usage Breakdown
            </h2>
            <UsageBar value={current.session_pct} max={100} label="Session Usage" color="#3b82f6" alertAt={80} />
            <UsageBar value={current.weekly_pct} max={100} label="Weekly Usage" color="#8b5cf6" alertAt={60} />
            <UsageBar value={current.extra_spend} max={current.extra_limit} label="Extra Usage Spend" color="#10b981" unit="$" />
          </div>

          {/* Trend chart */}
          {history.length > 1 && (
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
              <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-blue-400" /> Usage Trend
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="sessionGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="weeklyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} width={30} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={60} stroke="#eab308" strokeDasharray="4 4" label={{ value: '60% alert', position: 'right', fill: '#eab308', fontSize: 10 }} />
                  <Area type="monotone" dataKey="session_pct" stroke="#3b82f6" fill="url(#sessionGrad)" name="Session %" />
                  <Area type="monotone" dataKey="weekly_pct" stroke="#8b5cf6" fill="url(#weeklyGrad)" name="Weekly %" />
                </AreaChart>
              </ResponsiveContainer>

              {/* Extra spend trend */}
              <h3 className="text-xs text-gray-400 mt-4 mb-2">Extra Usage Spend ($)</h3>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} width={30} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="extra_spend" stroke="#10b981" fill="url(#spendGrad)" name="$ Spend" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

        </>
      ) : (
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-8 text-center">
          <DollarSign className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No usage data yet. Click "Log Usage" to add your first snapshot.</p>
        </div>
      )}
    </div>
  )
}
