import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { Target, Lightbulb, AlertTriangle, Zap, Save, Loader } from 'lucide-react'

export default function Mission() {
  const [mission, setMission] = useState('')
  const [originalMission, setOriginalMission] = useState('')
  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.getMission().then(m => {
      setMission(m.statement || '')
      setOriginalMission(m.statement || '')
    })
  }, [])

  async function saveMission() {
    setSaving(true)
    await api.updateMission(mission)
    setOriginalMission(mission)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function getRecommendation() {
    setLoading(true)
    const rec = await api.getRecommendation()
    setRecommendation(rec)
    setLoading(false)
  }

  const hasChanges = mission !== originalMission

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Mission Statement</h1>

      {/* Editable mission */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold">North Star</h2>
        </div>
        <textarea
          value={mission}
          onChange={e => setMission(e.target.value)}
          rows={3}
          className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Define your mission..."
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-gray-500">This mission guides task prioritization and recommendations.</p>
          <button
            onClick={saveMission}
            disabled={!hasChanges || saving}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors ${
              hasChanges
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-dark-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Ask Mission Control */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-semibold">Ask Mission Control</h2>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Get intelligent recommendations based on your mission, current project statuses, and task priorities.
        </p>

        <div className="flex gap-3">
          <button
            onClick={getRecommendation}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            What should we focus on next?
          </button>
        </div>

        {/* Recommendation result */}
        {recommendation && (
          <div className="mt-4 space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="font-semibold text-blue-400 mb-1">{recommendation.recommendation}</p>
              <p className="text-sm text-gray-300">{recommendation.reasoning}</p>
            </div>

            <div className="bg-dark-900/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-400">{recommendation.blockers}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400">Pending tasks: {recommendation.total_pending}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
