import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { api } from '../../utils/api'
import { projectColors, priorityColors } from '../../utils/colors'
import { formatDistanceToNow } from 'date-fns'
import TaskModal from './TaskModal'
import ActivitySidebar from './ActivitySidebar'
import {
  Plus, Filter, Calendar, User, Flag, X
} from 'lucide-react'

const COLUMNS = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
]

const columnColors = {
  backlog: 'border-t-gray-500',
  todo: 'border-t-blue-500',
  in_progress: 'border-t-yellow-500',
  review: 'border-t-purple-500',
  done: 'border-t-emerald-500',
}

export default function TaskBoard() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [team, setTeam] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filters, setFilters] = useState({ project_id: '', assignee: '', priority: '' })
  const [showFilters, setShowFilters] = useState(false)

  const loadTasks = useCallback(() => {
    const params = {}
    if (filters.project_id) params.project_id = filters.project_id
    if (filters.assignee) params.assignee = filters.assignee
    if (filters.priority) params.priority = filters.priority
    api.getTasks(params).then(setTasks)
  }, [filters])

  useEffect(() => { loadTasks() }, [loadTasks])
  useEffect(() => { api.getProjects().then(setProjects) }, [])
  useEffect(() => { api.getTeam().then(setTeam) }, [])

  const tasksByColumn = {}
  COLUMNS.forEach(col => {
    tasksByColumn[col.id] = tasks.filter(t => t.status === col.id).sort((a, b) => a.sort_order - b.sort_order)
  })

  function onDragEnd(result) {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const taskId = parseInt(draggableId)
    const srcCol = source.droppableId
    const dstCol = destination.droppableId

    // Optimistic update
    const newTasks = [...tasks]
    const taskIdx = newTasks.findIndex(t => t.id === taskId)
    if (taskIdx === -1) return
    newTasks[taskIdx] = { ...newTasks[taskIdx], status: dstCol }
    setTasks(newTasks)

    // Build reorder payload
    const dstTasks = newTasks.filter(t => t.status === dstCol).sort((a, b) => a.sort_order - b.sort_order)
    // Remove the dragged task and reinsert at destination index
    const withoutDragged = dstTasks.filter(t => t.id !== taskId)
    withoutDragged.splice(destination.index, 0, newTasks[taskIdx])

    const reorderPayload = withoutDragged.map((t, i) => ({ id: t.id, status: dstCol, sort_order: i }))

    // If moving across columns, also reorder source
    if (srcCol !== dstCol) {
      const srcTasks = newTasks.filter(t => t.status === srcCol && t.id !== taskId).sort((a, b) => a.sort_order - b.sort_order)
      srcTasks.forEach((t, i) => reorderPayload.push({ id: t.id, status: srcCol, sort_order: i }))
    }

    api.reorderTasks(reorderPayload).then(loadTasks)
  }

  function openCreate() {
    setEditingTask(null)
    setModalOpen(true)
  }

  function openEdit(task) {
    setEditingTask(task)
    setModalOpen(true)
  }

  async function handleSave(data) {
    if (editingTask) {
      await api.updateTask(editingTask.id, data)
    } else {
      await api.createTask(data)
    }
    setModalOpen(false)
    loadTasks()
  }

  async function handleDelete(id) {
    await api.deleteTask(id)
    setModalOpen(false)
    loadTasks()
  }

  const assignees = team.length > 0 ? team.map(m => m.name) : [...new Set(tasks.map(t => t.assignee).filter(Boolean))]

  return (
    <div className="flex gap-4 h-[calc(100vh-5rem)]">
      {/* Main board area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Task Board</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                showFilters ? 'border-blue-500 text-blue-400' : 'border-dark-700 text-gray-400 hover:text-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-dark-800 rounded-lg border border-dark-700">
            <select
              value={filters.project_id}
              onChange={e => setFilters(f => ({ ...f, project_id: e.target.value }))}
              className="bg-dark-700 border border-dark-600 rounded px-2 py-1 text-sm text-gray-300"
            >
              <option value="">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select
              value={filters.assignee}
              onChange={e => setFilters(f => ({ ...f, assignee: e.target.value }))}
              className="bg-dark-700 border border-dark-600 rounded px-2 py-1 text-sm text-gray-300"
            >
              <option value="">All Assignees</option>
              {assignees.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select
              value={filters.priority}
              onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}
              className="bg-dark-700 border border-dark-600 rounded px-2 py-1 text-sm text-gray-300"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            {(filters.project_id || filters.assignee || filters.priority) && (
              <button
                onClick={() => setFilters({ project_id: '', assignee: '', priority: '' })}
                className="text-gray-500 hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Columns */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-3 flex-1 overflow-x-auto pb-2">
            {COLUMNS.map(col => (
              <div key={col.id} className={`flex-1 min-w-[220px] bg-dark-800/50 rounded-xl border border-dark-700 border-t-2 ${columnColors[col.id]} flex flex-col`}>
                <div className="px-3 py-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-300">{col.label}</h3>
                  <span className="text-xs text-gray-500 font-mono">{tasksByColumn[col.id].length}</span>
                </div>
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 px-2 pb-2 space-y-2 overflow-y-auto ${snapshot.isDraggingOver ? 'bg-dark-700/30' : ''}`}
                    >
                      {tasksByColumn[col.id].map((task, index) => (
                        <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => openEdit(task)}
                              className={`bg-dark-800 rounded-lg p-3 border border-dark-700 cursor-pointer hover:border-dark-600 transition-colors ${
                                snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500/30' : ''
                              }`}
                            >
                              {/* Project tag */}
                              {task.project_name && (
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium mb-1.5 ${projectColors[task.color_tag]?.bg || 'bg-gray-500/20'} ${projectColors[task.color_tag]?.text || 'text-gray-400'}`}>
                                  {task.project_name}
                                </span>
                              )}
                              <p className="text-sm font-medium text-gray-200 mb-2">{task.title}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Flag className={`w-3 h-3 ${priorityColors[task.priority]}`} />
                                  {task.due_date && (
                                    <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                                      <Calendar className="w-3 h-3" />
                                      {task.due_date}
                                    </span>
                                  )}
                                </div>
                                {task.assignee && (
                                  <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                                    <User className="w-3 h-3" />
                                    {task.assignee}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Activity Sidebar */}
      <ActivitySidebar />

      {/* Task Modal */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          projects={projects}
          team={team}
          onSave={handleSave}
          onDelete={editingTask ? () => handleDelete(editingTask.id) : null}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
