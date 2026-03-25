import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, KanbanSquare, FolderOpen, BarChart3, Brain,
  TrendingUp, Calendar, FileText, DollarSign, Briefcase,
  Users, Target, ChevronLeft, ChevronRight, Moon, Sun, Rocket
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: KanbanSquare, label: 'Task Board' },
  { to: '/projects', icon: FolderOpen, label: 'Projects' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/memories', icon: Brain, label: 'Memories' },
  { to: '/costs', icon: DollarSign, label: 'Cost Tracker' },
  { to: '/mission', icon: Target, label: 'Mission' },
  { to: '/team', icon: Users, label: 'Team' },
]

// Future items shown as disabled
const futureItems = [
  { icon: TrendingUp, label: 'Investments' },
  { icon: Calendar, label: 'Calendar' },
  { icon: FileText, label: 'Docs' },
  { icon: Briefcase, label: 'SAP' },
]

export default function Sidebar({ darkMode, setDarkMode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-56'} flex-shrink-0 bg-dark-800 border-r border-dark-700 flex flex-col transition-all duration-200 h-screen sticky top-0`}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-dark-700">
        <Rocket className="w-6 h-6 text-blue-500 flex-shrink-0" />
        {!collapsed && <span className="font-bold text-lg whitespace-nowrap">Mission Control</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        <div className="space-y-0.5 px-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-dark-700'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </div>

        {/* Future items */}
        <div className="mt-4 pt-4 border-t border-dark-700 space-y-0.5 px-2">
          {!collapsed && <p className="px-3 text-xs text-gray-600 uppercase tracking-wider mb-1">Coming Soon</p>}
          {futureItems.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 cursor-not-allowed"
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer controls */}
      <div className="border-t border-dark-700 p-2 space-y-1">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-dark-700 w-full"
        >
          {darkMode ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
          {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-dark-700 w-full"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
