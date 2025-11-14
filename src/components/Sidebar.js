// src/components/Sidebar.js
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function Sidebar() {
  const pathname = usePathname()

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Calendar", path: "/calendar", icon: "📅" },
    { name: "Videos", path: "/videos", icon: "🎥" },
    { name: "Teams", path: "/teams", icon: "👥" },
    { name: "Reports", path: "/reports", icon: "📈" },
  ]

  const adminLinks = [
    { name: "Manage Channels", path: "/admin/channels", icon: "📺" },
    { name: "Manage Series", path: "/admin/series", icon: "🎬" },
    { name: "Manage Teams", path: "/admin/teams", icon: "⚙️" },
    { name: "Manage Settings", path: "/admin/settings", icon: "➕" },
  ]

  const isActive = (path) => pathname === path

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white p-5 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Veer Bharat</h2>
        <p className="text-blue-200 text-sm">Control Panel</p>
      </div>

      <nav className="flex flex-col space-y-1 flex-1">
        {links.map((l) => (
          <Link
            key={l.path}
            href={l.path}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              isActive(l.path)
                ? 'bg-blue-700 shadow-lg'
                : 'hover:bg-blue-700/50'
            }`}
          >
            <span className="text-xl">{l.icon}</span>
            <span>{l.name}</span>
          </Link>
        ))}

        <div className="pt-4 mt-4 border-t border-blue-700">
          <p className="text-xs text-blue-300 mb-2 px-3">ADMIN TOOLS</p>
          {adminLinks.map((l) => (
            <Link
              key={l.path}
              href={l.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive(l.path)
                  ? 'bg-blue-700 shadow-lg'
                  : 'hover:bg-blue-700/50'
              }`}
            >
              <span className="text-xl">{l.icon}</span>
              <span className="text-sm">{l.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="mt-auto bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
      >
        Logout 🚪
      </button>
    </aside>
  )
}