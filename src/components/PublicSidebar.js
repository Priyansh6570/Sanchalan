'use client'
// src/components/PublicSidebar.js
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Calendar, 
  Video, 
  Users,
  Eye
} from 'lucide-react'

export default function PublicSidebar() {
  const pathname = usePathname()

  const links = [
    { name: 'Dashboard', path: '/view', icon: LayoutDashboard },
    { name: 'Calendar', path: '/view/calendar', icon: Calendar },
    { name: 'Videos', path: '/view/videos', icon: Video },
    { name: 'Teams', path: '/view/teams', icon: Users },
  ]

  const isActive = (path) => {
    if (path === '/view') {
      return pathname === '/view'
    }
    return pathname.startsWith(path)
  }

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-700 to-gray-800 text-white flex flex-col shadow-xl">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-600">
        <div className="flex items-center gap-2 mb-2">
          <Eye size={24} />
          <h1 className="text-2xl font-bold">Veer Bharat</h1>
        </div>
        <p className="text-gray-300 text-sm">Public Dashboard</p>
        <p className="text-gray-400 text-xs mt-1">Read-Only View</p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(link.path)
                  ? 'bg-gray-600 shadow-lg'
                  : 'hover:bg-gray-600/50'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{link.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-600 text-xs text-gray-400">
        <p>Cultural Department</p>
        <p>Government of Madhya Pradesh</p>
        <p className="mt-2">Auto-refreshes every 30s</p>
      </div>
    </aside>
  )
}