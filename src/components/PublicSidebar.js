'use client'
// src/components/PublicSidebar.js
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Calendar, 
  Video, 
  ListVideo,
  Users,
  Eye,
  X
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function PublicSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onToggle = () => setOpen(prev => !prev)
    const onOpen = (e) => { if (e?.detail?.open) setOpen(true) }
    const onPop = () => setOpen(false)
    const onKey = (ev) => { if (ev.key === 'Escape') setOpen(false) }

    window.addEventListener('toggleSidebar', onToggle)
    window.addEventListener('openSidebar', onOpen)
    window.addEventListener('popstate', onPop)
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('toggleSidebar', onToggle)
      window.removeEventListener('openSidebar', onOpen)
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const links = [
    { name: 'Dashboard', path: '/view', icon: LayoutDashboard },
    { name: 'Calendar', path: '/view/calendar', icon: Calendar },
    { name: 'Videos', path: '/view/videos', icon: Video },
    { name: 'Series', path: '/view/series', icon: ListVideo },
    { name: 'Teams', path: '/view/teams', icon: Users },
  ]

  const isActive = (path) => {
    if (path === '/view') return pathname === '/view'
    return pathname.startsWith(path)
  }

  return (
    <>
      {/* BACKDROP (mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        aria-hidden={!open}
        className={`
          fixed top-0 left-0 h-screen w-64
          bg-gradient-to-b from-gray-700 to-gray-800 text-white shadow-xl
          flex flex-col
          transform transition-transform duration-300 z-50
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:fixed
        `}
      >
        {/* Close button (mobile only) */}
        <button
          className="md:hidden absolute top-3 right-3 p-1 bg-gray-600 rounded-lg z-60"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={24} />
            <h1 className="text-2xl font-bold">Veer Bharat</h1>
          </div>
          <p className="text-gray-300 text-sm">Public Dashboard</p>
          <p className="text-gray-400 text-xs mt-1">Read-Only View</p>
        </div>

        {/* Navigation (scrolls if too tall) */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(link.path) ? 'bg-gray-600 shadow-lg' : 'hover:bg-gray-600/50'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{link.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer + pinned bottom badge */}
        <div className="border-t border-gray-600 mt-auto">
          <div className="p-4 text-xs text-gray-400">
            <p>Cultural Department</p>
            <p>Government of Madhya Pradesh</p>
            <p className="mt-2">Auto-refreshes every 30s</p>
          </div>

          <div className="w-full bg-gray-900 p-4 flex items-center justify-center">
            <span className="text-xs bg-green-600 px-3 py-1 rounded-full text-white">
              View access only
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}
