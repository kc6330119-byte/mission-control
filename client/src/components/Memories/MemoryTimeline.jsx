import { format } from 'date-fns'
import {
  User, FolderOpen, MessageSquare, Bookmark, Clock
} from 'lucide-react'

const typeConfig = {
  user: { icon: User, color: 'text-blue-400', bg: 'bg-blue-500', label: 'User' },
  project: { icon: FolderOpen, color: 'text-emerald-400', bg: 'bg-emerald-500', label: 'Project' },
  feedback: { icon: MessageSquare, color: 'text-orange-400', bg: 'bg-orange-500', label: 'Feedback' },
  reference: { icon: Bookmark, color: 'text-purple-400', bg: 'bg-purple-500', label: 'Reference' },
}

export default function MemoryTimeline({ memories, onSelect }) {
  // Group by date
  const grouped = {}
  for (const memory of memories) {
    const date = memory.created_at
      ? format(new Date(memory.created_at + (memory.created_at.includes('Z') ? '' : 'Z')), 'MMM d, yyyy')
      : 'Unknown'
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(memory)
  }

  return (
    <div className="space-y-6">
      {Object.keys(grouped).length === 0 && (
        <p className="text-gray-500 text-sm">No memories to display in timeline.</p>
      )}
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-400">{date}</h3>
            <div className="flex-1 h-px bg-dark-700" />
          </div>
          <div className="ml-6 border-l-2 border-dark-700 space-y-3 pl-4">
            {items.map(memory => {
              const config = typeConfig[memory.type] || typeConfig.project
              const Icon = config.icon
              return (
                <button
                  key={memory.id}
                  onClick={() => onSelect(memory)}
                  className="flex items-start gap-3 w-full text-left hover:bg-dark-800/50 rounded-lg p-2 -ml-2 transition-colors"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${config.bg} mt-1.5 flex-shrink-0 -ml-[1.3rem]`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-gray-200 truncate">{memory.name}</h4>
                      <span className={`text-[10px] ${config.color}`}>{config.label}</span>
                    </div>
                    {memory.description && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{memory.description}</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
