import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../utils/api'
import { projectColors } from '../../utils/colors'
import { Globe, FileText, Database, ArrowRight, ExternalLink } from 'lucide-react'

export default function Projects() {
  const [projects, setProjects] = useState([])

  useEffect(() => { api.getProjects().then(setProjects) }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Projects</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map(project => {
          const colors = projectColors[project.color_tag] || projectColors.gray
          return (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className={`bg-dark-800 rounded-xl border ${colors.border} hover:border-opacity-80 transition-all block group`}
            >
              {/* Header */}
              <div className={`px-5 py-4 border-b ${colors.border}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                    <h2 className="text-lg font-semibold">{project.name}</h2>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-gray-300 transition-colors" />
                </div>
                <div className="flex items-center gap-1.5 mt-1 ml-6">
                  <ExternalLink className="w-3 h-3 text-gray-500" />
                  <span className="text-sm text-gray-400">{project.url}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Status</span>
                  <span className="text-sm text-gray-200">{project.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">AdSense</span>
                  <span className={`text-sm ${colors.text}`}>{project.adsense_status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Tech Stack</span>
                  <span className="text-xs text-gray-500">{project.tech_stack}</span>
                </div>

                {/* Stats row */}
                <div className="flex gap-4 pt-3 border-t border-dark-700">
                  <div className="flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-mono text-gray-300">{project.listing_count?.toLocaleString()}</span>
                    <span className="text-xs text-gray-500">listings</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-mono text-gray-300">{project.blog_post_count}</span>
                    <span className="text-xs text-gray-500">posts</span>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
