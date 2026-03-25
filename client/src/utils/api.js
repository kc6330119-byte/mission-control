const API = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const api = {
  // Tasks
  getTasks: (params) => request(`/tasks${params ? '?' + new URLSearchParams(params) : ''}`),
  createTask: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  reorderTasks: (tasks) => request('/tasks/reorder/batch', { method: 'PUT', body: JSON.stringify({ tasks }) }),

  // Projects
  getProjects: () => request('/projects'),
  getProject: (id) => request(`/projects/${id}`),
  updateProject: (id, data) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Team
  getTeam: () => request('/team'),
  getTeamActivity: (id) => request(`/team/${id}/activity`),
  updateTeamMember: (id, data) => request(`/team/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Mission
  getMission: () => request('/mission'),
  updateMission: (statement) => request('/mission', { method: 'PUT', body: JSON.stringify({ statement }) }),
  getRecommendation: () => request('/mission/recommend'),

  // Activity
  getActivity: (params) => request(`/activity${params ? '?' + new URLSearchParams(params) : ''}`),
  logActivity: (data) => request('/activity', { method: 'POST', body: JSON.stringify(data) }),

  // Memories
  getMemories: (params) => request(`/memories${params ? '?' + new URLSearchParams(params) : ''}`),
  getMemory: (id) => request(`/memories/${id}`),
  createMemory: (data) => request('/memories', { method: 'POST', body: JSON.stringify(data) }),
  updateMemory: (id, data) => request(`/memories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMemory: (id) => request(`/memories/${id}`, { method: 'DELETE' }),
  syncMemories: () => request('/memories/sync', { method: 'POST' }),
  getMemorySources: () => request('/memories/sources'),

  // Analytics
  getAnalytics: (projectId) => request(`/analytics/${projectId}`),
  getAdSenseReadiness: () => request('/analytics/readiness/all'),

  // Usage
  getUsageCurrent: () => request('/usage/current'),
  getUsageHistory: (days) => request(`/usage/history${days ? '?days=' + days : ''}`),
  logUsage: (data) => request('/usage', { method: 'POST', body: JSON.stringify(data) }),
}
