import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { formatDistanceToNow } from 'date-fns'
import {
  User, Bot, Monitor, Wifi, WifiOff, Clock,
  CheckCircle, ListTodo, Activity
} from 'lucide-react'

const statusIcons = {
  online: { icon: Wifi, color: 'text-emerald-400', bg: 'bg-emerald-500' },
  offline: { icon: WifiOff, color: 'text-gray-500', bg: 'bg-gray-500' },
  busy: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500' },
}

export default function Team() {
  const [members, setMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)
  const [activity, setActivity] = useState([])

  useEffect(() => { api.getTeam().then(setMembers) }, [])

  async function selectMember(member) {
    setSelectedMember(member)
    const act = await api.getTeamActivity(member.id)
    setActivity(act)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Team</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {members.map(member => {
          const st = statusIcons[member.status] || statusIcons.offline
          const isSelected = selectedMember?.id === member.id
          return (
            <button
              key={member.id}
              onClick={() => selectMember(member)}
              className={`bg-dark-800 rounded-xl border p-5 text-left transition-all ${
                isSelected ? 'border-blue-500 ring-1 ring-blue-500/30' : 'border-dark-700 hover:border-dark-600'
              }`}
            >
              {/* Avatar & name */}
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center">
                    {member.type === 'human' ? (
                      <User className="w-6 h-6 text-gray-400" />
                    ) : (
                      <Bot className="w-6 h-6 text-blue-400" />
                    )}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${st.bg} border-2 border-dark-800`} />
                </div>
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-xs text-gray-400">{member.role}</p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm">
                {member.device && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Monitor className="w-4 h-4" />
                    <span className="text-xs">{member.device}</span>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <ListTodo className="w-4 h-4" />
                    <span className="text-xs font-mono">{member.tasks_assigned}</span>
                    <span className="text-xs">assigned</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-mono">{member.tasks_completed}</span>
                    <span className="text-xs">done</span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Activity detail */}
      {selectedMember && (
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold">{selectedMember.name} — Activity Log</h2>
          </div>
          {activity.length === 0 ? (
            <p className="text-gray-500 text-sm">No recorded activity.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {activity.map(entry => (
                <div key={entry.id} className="flex items-start gap-3 p-3 bg-dark-900/50 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-300">{entry.message}</p>
                    <span className="text-xs text-gray-600">
                      {entry.created_at ? formatDistanceToNow(new Date(entry.created_at + 'Z'), { addSuffix: true }) : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
