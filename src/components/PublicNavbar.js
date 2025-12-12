'use client'
// src/components/PublicNavbar.js
import { useState, useEffect } from 'react'
import { Clock, Eye, Menu } from 'lucide-react'

export default function PublicNavbar() {
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleString('en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Kolkata',
        })
      )
    }
    updateTime()
    const i = setInterval(updateTime, 1000)
    return () => clearInterval(i)
  }, [])

  // dispatch a toggle event to the sidebar (sidebar listens)
  const toggleSidebar = () => {
    window.dispatchEvent(new CustomEvent('toggleSidebar'))
  }

  return (
    <>
      {/* Mobile compact navbar strip */}
      <div className="md:hidden bg-gray-800 text-white px-4 py-2 flex items-center justify-between gap-2">
        <button
          onClick={toggleSidebar}
          className="p-2 bg-gray-700 rounded-md"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <Clock size={14} />
          <span>{currentTime}</span>
        </div>
      </div>

      {/* Full navbar for desktop */}
      <nav className="hidden md:block bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Veer Bharat - Public Dashboard
            </h2>
            <p className="text-sm text-gray-600">
              Cultural Department, Government of Madhya Pradesh
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={18} />
              <div className="text-right">
                <p className="text-xs text-gray-500">IST</p>
                <p className="text-sm font-medium">{currentTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
              <Eye size={20} className="text-gray-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">View Only</p>
                <p className="text-xs text-gray-600">Read-only access</p>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
