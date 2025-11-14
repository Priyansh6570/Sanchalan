'use client'
// src/app/admin/settings/page.js
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Youtube, Check, X, RefreshCw, Settings as SettingsIcon } from 'lucide-react'

export default function SettingsPage() {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  const success = searchParams.get('success')
  const error = searchParams.get('error')

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/auth/youtube/status')
      const data = await response.json()
      setConnected(data.connected)
    } catch (err) {
      console.error('Error checking connection:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = () => {
    window.location.href = '/api/auth/youtube'
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect YouTube Analytics?')) {
      return
    }

    try {
      const response = await fetch('/api/auth/youtube/disconnect', {
        method: 'POST',
      })
      
      if (response.ok) {
        setConnected(false)
        alert('✅ YouTube disconnected successfully')
      }
    } catch (err) {
      alert('Failed to disconnect YouTube')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage integrations and configurations</p>
      </div>

      {/* Success/Error Messages */}
      {success === 'youtube_connected' && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check size={20} />
          YouTube Analytics connected successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <X size={20} />
          {error === 'no_code' ? 'Authorization failed. No code received.' :
           error === 'access_denied' ? 'You denied access to YouTube.' :
           `Error: ${error}`}
        </div>
      )}

      {/* YouTube Analytics Integration */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <Youtube size={32} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">YouTube Analytics Integration</h2>
              <p className="text-gray-600 text-sm mb-4">
                Connect your YouTube account to access detailed analytics, traffic sources, and subtitle information.
              </p>
              
              {loading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <RefreshCw size={16} className="animate-spin" />
                  Checking connection...
                </div>
              ) : connected ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <Check size={20} />
                    Connected
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800 mb-3">
                      ✓ You can now view detailed analytics for your videos<br />
                      ✓ Traffic sources and audience insights available<br />
                      ✓ Automatic subtitle detection enabled
                    </p>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Disconnect YouTube
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-500 font-medium">
                    <X size={20} />
                    Not Connected
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 mb-2 font-medium">
                      Connect YouTube to unlock:
                    </p>
                    <ul className="text-sm text-yellow-800 space-y-1 ml-4">
                      <li>• Detailed video analytics (watch time, retention)</li>
                      <li>• Traffic source breakdown</li>
                      <li>• Subscriber growth tracking</li>
                      <li>• Automatic subtitle language detection</li>
                      <li>• Real-time performance metrics</li>
                    </ul>
                  </div>
                  <button
                    onClick={handleConnect}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Youtube size={20} />
                    Connect YouTube Analytics
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <SettingsIcon size={32} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2">API Configuration</h2>
            <p className="text-gray-600 text-sm mb-4">
              API keys are configured in environment variables
            </p>
            
            <div className="space-y-3">
              <ApiKeyStatus 
                label="YouTube Data API" 
                status={!!process.env.NEXT_PUBLIC_HAS_YOUTUBE_KEY}
              />
              <ApiKeyStatus 
                label="Google OAuth Client" 
                status={!!process.env.NEXT_PUBLIC_HAS_OAUTH}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Setup Instructions</h3>
        <div className="text-blue-800 text-sm space-y-2">
          <p><strong>1. YouTube Data API Key:</strong> Already configured ✓</p>
          <p><strong>2. OAuth Credentials:</strong> Add to .env.local:</p>
          <pre className="bg-blue-100 p-3 rounded mt-2 overflow-x-auto text-xs">
{`GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/youtube/callback`}
          </pre>
          <p className="mt-3"><strong>3. Click "Connect YouTube Analytics"</strong> to authorize access</p>
        </div>
      </div>
    </div>
  )
}

function ApiKeyStatus({ label, status }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium">{label}</span>
      {status ? (
        <div className="flex items-center gap-2 text-green-600">
          <Check size={16} />
          <span className="text-sm">Configured</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-red-600">
          <X size={16} />
          <span className="text-sm">Not configured</span>
        </div>
      )}
    </div>
  )
}