'use client'
// src/components/Navbar.js
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Clock, User } from 'lucide-react'

export default function Navbar() {
  const { data: session } = useSession()
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleString('en-IN', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Kolkata',
        })
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side - Title */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Veer Bharat Control Panel
          </h2>
          <p className="text-sm text-gray-600">
            Cultural Department, Government of Madhya Pradesh
          </p>
        </div>

        {/* Right Side - Time & User */}
        <div className="flex items-center gap-6">
          {/* Current Time */}
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={18} />
            <div className="text-right">
              <p className="text-xs text-gray-500">IST</p>
              <p className="text-sm font-medium">{currentTime}</p>
            </div>
          </div>

          {/* User Info */}
          {session && (
            <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {session.user?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-600">
                  {session.user?.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}