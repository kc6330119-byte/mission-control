import { useState } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import {
  ArrowLeft, Save, Trash2, Loader, Clock, FileText,
  User, FolderOpen, MessageSquare, Bookmark,
  CheckCircle, CloudUpload, AlertTriangle
} from 'lucide-react'

const syncStatusConfig = {
  synced: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/15', label: 'Synced' },
  pending_write: { icon: CloudUpload, color: 'text-yellow-400', bg: 'bg-yellow-500/15', label: 'Pending write-back' },
  conflict: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/15', label: 'Conflict — file and DB both changed' },
}

const typeConfig = {
  user: { icon: User, color: 'text-blue-400', bg: 'bg-blue-500/15', label: 'User' },
  project: { icon: FolderOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/15', label: 'Project' },
  feedback: { icon: MessageSquare, color: 'text-orange-400', bg: 'bg-orange-500/15', label: 'Feedback' },
  reference: { icon: Bookmark, color: 'text-purple-400', bg: 'bg-purple-500/15', label: 'Reference' },
}

export default function MemoryDetail({ memory, onBack, onSave, onDelete }) {
  const [form, setForm] = useState({
    name: memory.name,
    description: memory.description || '',
    type: memory.type,
    content: memory.content || '',
  })
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const hasChanges = form.name !== memory.name || form.description !== (memory.description || '') || form.type !== memory.type || form.content !== (memory.content || '')

  async function handleSave() {
    setSaving(true)
    await onSave(memory.id, form)
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    await onDelete(memory.id)
  }

  const config = typeConfig[form.type] || typeConfig.project

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back nav */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-200 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Memories
      </button>

      {/* Header */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Brief description..."
              />
            </div>
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-gray-200"
                >
                  <option value="user">User</option>
                  <option value="project">Project</option>
                  <option value="feedback">Feedback</option>
                  <option value="reference">Reference</option>
                </select>
              </div>
              {memory.source && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Source</label>
                  <div className="text-xs text-gray-400 bg-dark-700 rounded-lg px-3 py-2">{memory.source}</div>
                </div>
              )}
              {memory.file_path && (
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Source File</label>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-dark-700 rounded-lg px-3 py-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="truncate">{memory.file_path}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timestamps and sync status */}
        <div className="flex items-center flex-wrap gap-4 text-xs text-gray-500 border-t border-dark-700 pt-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Created: {memory.created_at ? format(new Date(memory.created_at + (memory.created_at.includes('Z') ? '' : 'Z')), 'MMM d, yyyy h:mm a') : 'Unknown'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Updated: {memory.updated_at ? formatDistanceToNow(new Date(memory.updated_at + (memory.updated_at.includes('Z') ? '' : 'Z')), { addSuffix: true }) : 'Unknown'}
          </span>
          {memory.sync_status && (() => {
            const sc = syncStatusConfig[memory.sync_status] || syncStatusConfig.synced
            const SyncIcon = sc.icon
            return (
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
                <SyncIcon className="w-3 h-3" />
                {sc.label}
              </span>
            )
          })()}
          {memory.last_synced_at && (
            <span className="flex items-center gap-1 text-gray-600">
              Last synced: {formatDistanceToNow(new Date(memory.last_synced_at + (memory.last_synced_at.includes('Z') ? '' : 'Z')), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>

      {/* Content editor */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
        <label className="block text-sm text-gray-400 mb-2">Content</label>
        <textarea
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          rows={20}
          className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-sm text-gray-200 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
          placeholder="Memory content (markdown)..."
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleDelete}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors ${
            confirmDelete ? 'bg-red-600 hover:bg-red-700 text-white' : 'text-red-400 hover:text-red-300 border border-dark-700'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          {confirmDelete ? 'Confirm Delete' : 'Delete'}
        </button>
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors ${
              hasChanges ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-dark-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
