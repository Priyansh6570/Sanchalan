import { useState, useEffect } from 'react'

export default function YouTubeAuthStatus() {
  const [authStatus, setAuthStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/youtube/status')
      const data = await response.json()
      setAuthStatus(data)
    } catch (error) {
      console.error('Error checking auth status:', error)
      setAuthStatus({ connected: false, error: 'Failed to check status' })
    }
    setLoading(false)
  }

  const handleReconnect = () => {
    window.location.href = '/api/auth/youtube'
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect YouTube?')) return
    
    try {
      await fetch('/api/auth/youtube/disconnect', { method: 'POST' })
      checkAuthStatus()
    } catch (error) {
      console.error('Error disconnecting:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
          <span className="text-sm text-gray-600">Checking YouTube connection...</span>
        </div>
      </div>
    )
  }

  if (!authStatus) return null

  if (!authStatus.connected) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">YouTube Not Connected</h3>
            <p className="text-sm text-red-700 mt-1">
              Connect your YouTube account to access analytics and automatically sync video data.
            </p>
            <button
              onClick={handleReconnect}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
            >
              Connect YouTube Account
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (authStatus.needsReconnect) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔄</span>
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900">YouTube Authentication Expired</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Your YouTube authentication has expired. Please reconnect to continue accessing analytics.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleReconnect}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm font-medium transition-colors"
              >
                Reconnect YouTube
              </button>
              <button
                onClick={handleDisconnect}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h3 className="font-semibold text-green-900">YouTube Connected</h3>
            <p className="text-sm text-green-700 mt-1">
              Your YouTube account is connected and authenticated.
            </p>
            {authStatus.expiresAt && (
              <p className="text-xs text-green-600 mt-1">
                Token expires: {new Date(authStatus.expiresAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={checkAuthStatus}
            className="text-green-700 hover:text-green-900 text-sm font-medium"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleDisconnect}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  )
}