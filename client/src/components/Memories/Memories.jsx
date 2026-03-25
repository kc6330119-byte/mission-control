import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { formatDistanceToNow } from 'date-fns'
import MemoryDetail from './MemoryDetail'
import MemoryTimeline from './MemoryTimeline'
import {
  Brain, Search, RefreshCw, Plus, Filter, Clock, LayoutGrid,
  User, FolderOpen, MessageSquare, Bookmark, Loader,
  CheckCircle, CloudUpload, AlertTriangle
} from 'lucide-react'

const syncStatusConfig = {
  synced: { icon: CheckCircle, color: 'text-emerald-500', label: 'Synced' },
  pending_write: { icon: CloudUpload, color: 'text-yellow-500', label: 'Pending write' },
  conflict: { icon: AlertTriangle, color: 'text-red-500', label: 'Conflict' },
}

const typeConfig = {
  user: { icon: User, color: 'text-blue-400', bg: 'bg-blue-500/15', label: 'User' },
  project: { icon: FolderOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/15', label: 'Project' },
  feedback: { icon: MessageSquare, color: 'text-orange-400', bg: 'bg-orange-500/15', label: 'Feedback' },
  reference: { icon: Bookmark, color: 'text-purple-400', bg: 'bg-purple-500/15', label: 'Reference' },
}

export default function Memories() {
  const [memories, setMemories] = useState([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [sort, setSort] = useState('updated')
  const [view, setView] = useState('grid') // grid | timeline
  const [selected, setSelected] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const [creating, setCreating] = useState(false)
  const [sources, setSources] = useState([])

  function load() {
    const params = {}
    if (search) params.search = search
    if (typeFilter) params.type = typeFilter
    if (sourceFilter) params.source = sourceFilter
    if (sort) params.sort = sort
    api.getMemories(params).then(setMemories)
  }

  useEffect(() => { api.getMemorySources().then(setSources) }, [])
  useEffect(() => { load() }, [typeFilter, sourceFilter, sort])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(load, 300)
    return () => clearTimeout(timer)
  }, [search])

  async function handleSync() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const result = await api.syncMemories()
      setSyncResult(result)
      load()
    } catch (e) {
      setSyncResult({ error: e.message })
    }
    setSyncing(false)
  }

  async function handleCreate() {
    const memory = await api.createMemory({
      name: 'New Memory',
      description: '',
      type: 'project',
      content: '',
    })
    setSelected(memory)
    setCreating(false)
    load()
  }

  async function handleSave(id, data) {
    await api.updateMemory(id, data)
    load()
    // Refresh selected
    const updated = await api.getMemory(id)
    setSelected(updated)
  }

  async function handleDelete(id) {
    await api.deleteMemory(id)
    setSelected(null)
    load()
  }

  const typeCounts = {
    user: memories.filter(m => m.type === 'user').length,
    project: memories.filter(m => m.type === 'project').length,
    feedback: memories.filter(m => m.type === 'feedback').length,
    reference: memories.filter(m => m.type === 'reference').length,
  }

  if (selected) {
    return (
      <MemoryDetail
        memory={selected}
        onBack={() => setSelected(null)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-7 h-7 text-purple-400" />
          <h1 className="text-2xl font-bold">Memories</h1>
          <span className="text-sm text-gray-500 font-mono">{memories.length} total</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-dark-700 text-gray-400 hover:text-gray-200 hover:border-dark-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync Files
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> New Memory
          </button>
        </div>
      </div>

      {/* Sync result */}
      {syncResult && (
        <div className={`p-3 rounded-lg text-sm ${syncResult.error ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
          {syncResult.error
            ? `Sync failed: ${syncResult.error}`
            : (
              <div className="space-y-1">
                <p>Sync complete: {syncResult.imported} imported, {syncResult.updated} updated, {syncResult.written_back || 0} written back, {syncResult.conflicts || 0} conflicts, {syncResult.skipped} unchanged</p>
                {syncResult.directories?.map((d, i) => (
                  <p key={i} className="text-xs opacity-75">
                    {d.label}: {d.status === 'ok' ? `${d.imported} new, ${d.updated} updated${d.written_back ? `, ${d.written_back} written back` : ''}${d.conflicts ? `, ${d.conflicts} conflicts` : ''}, ${d.skipped} unchanged` : 'not found'}
                  </p>
                ))}
              </div>
            )
          }
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="What does Zoe know? Search memories..."
            className="w-full bg-dark-800 border border-dark-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-gray-300"
          >
            <option value="">All Sources</option>
            {sources.map(s => <option key={s.source} value={s.source}>{s.label}</option>)}
          </select>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-gray-300"
          >
            <option value="updated">Recently Updated</option>
            <option value="created">Recently Created</option>
            <option value="name">Name</option>
            <option value="type">Type</option>
          </select>
          <button
            onClick={() => setView(v => v === 'grid' ? 'timeline' : 'grid')}
            className={`p-2 rounded-lg border border-dark-700 text-gray-400 hover:text-gray-200 transition-colors`}
            title={view === 'grid' ? 'Timeline view' : 'Grid view'}
          >
            {view === 'grid' ? <Clock className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Type filter pills */}
      <div className="flex gap-2">
        <button
          onClick={() => setTypeFilter('')}
          className={`px-3 py-1 rounded-full text-xs transition-colors ${!typeFilter ? 'bg-purple-500/20 text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
        >
          All ({memories.length})
        </button>
        {Object.entries(typeConfig).map(([type, config]) => {
          const Icon = config.icon
          return (
            <button
              key={type}
              onClick={() => setTypeFilter(typeFilter === type ? '' : type)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors ${typeFilter === type ? `${config.bg} ${config.color}` : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Icon className="w-3 h-3" /> {config.label} ({typeCounts[type]})
            </button>
          )
        })}
      </div>

      {/* Content */}
      {view === 'timeline' ? (
        <MemoryTimeline memories={memories} onSelect={setSelected} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memories.length === 0 && (
            <p className="text-gray-500 text-sm col-span-full">No memories found. Click "Sync Files" to import from Zoe's memory directory.</p>
          )}
          {memories.map(memory => {
            const config = typeConfig[memory.type] || typeConfig.project
            const Icon = config.icon
            return (
              <button
                key={memory.id}
                onClick={() => setSelected(memory)}
                className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-left hover:border-dark-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-1.5 rounded ${config.bg}`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                    {config.label}
                  </span>
                </div>
                <h3 className="font-semibold text-sm mb-1 line-clamp-1">{memory.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 mb-3">{memory.description}</p>
                <div className="flex items-center justify-between text-[10px] text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {memory.updated_at ? formatDistanceToNow(new Date(memory.updated_at + (memory.updated_at.includes('Z') ? '' : 'Z')), { addSuffix: true }) : 'Unknown'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {memory.sync_status && (() => {
                      const sc = syncStatusConfig[memory.sync_status] || syncStatusConfig.synced
                      const SyncIcon = sc.icon
                      return <SyncIcon className={`w-3 h-3 ${sc.color}`} title={sc.label} />
                    })()}
                    {memory.source && (
                      <span className="px-1.5 py-0.5 rounded bg-dark-700 text-gray-500">{memory.source}</span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
