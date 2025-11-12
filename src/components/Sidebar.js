'use client'
// src/components/Sidebar.js
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  LayoutDashboard, 
  Calendar, 
  Video, 
  Users, 
  FileText, 
  Settings,
  Youtube,
  Film,
  LogOut 
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()

  const mainLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Videos', path: '/videos', icon: Video },
    { name: 'Teams', path: '/teams', icon: Users },
    { name: 'Reports', path: '/reports', icon: FileText },
  ]

  const adminLinks = [
    { name: 'Channels', path: '/admin/channels', icon: Youtube },
    { name: 'Series', path: '/admin/series', icon: Film },
    { name: 'Teams Setup', path: '/admin/teams', icon: Settings },
  ]

  const isActive = (path) => pathname === path

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col shadow-xl">
      {/* Logo/Header */}
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-2xl font-bold">Veer Bharat</h1>
        <p className="text-blue-200 text-sm mt-1">Content Management</p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="mb-6">
          {mainLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(link.path)
                    ? 'bg-blue-700 shadow-lg'
                    : 'hover:bg-blue-700/50'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{link.name}</span>
              </Link>
            )
          })}
        </div>

        {/* Admin Section */}
        <div className="pt-4 border-t border-blue-700">
          <p className="text-xs text-blue-300 px-4 mb-2 font-semibold uppercase tracking-wider">
            Admin Tools
          </p>
          {adminLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(link.path)
                    ? 'bg-blue-700 shadow-lg'
                    : 'hover:bg-blue-700/50'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm">{link.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-blue-700">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full bg-red-600 hover:bg-red-700 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}