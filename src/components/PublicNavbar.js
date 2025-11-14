'use client'
// src/components/PublicNavbar.js
import { useState, useEffect } from 'react'
import { Clock, Eye } from 'lucide-react'

export default function PublicNavbar() {
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
            Veer Bharat - Public Dashboard
          </h2>
          <p className="text-sm text-gray-600">
            Cultural Department, Government of Madhya Pradesh
          </p>
        </div>

        {/* Right Side - Time & Status */}
        <div className="flex items-center gap-6">
          {/* Current Time */}
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={18} />
            <div className="text-right">
              <p className="text-xs text-gray-500">IST</p>
              <p className="text-sm font-medium">{currentTime}</p>
            </div>
          </div>

          {/* View-Only Badge */}
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
  )
}