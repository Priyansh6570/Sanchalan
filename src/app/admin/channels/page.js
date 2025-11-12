'use client'
// src/app/admin/channels/page.js
import { useState, useEffect } from 'react'
import { Youtube, RefreshCw, Plus, Check, X } from 'lucide-react'
import { formatNumber, formatDate } from '@/lib/utils'

export default function ChannelsAdminPage() {
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    channelId: '',
  })

  // Fetch channels
  const fetchChannels = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/channels')
      const data = await response.json()
      
      if (data.success) {
        setChannels(data.channels)
      }
    } catch (err) {
      console.error('Error fetching channels:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChannels()
  }, [])

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setAdding(true)

    try {
      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Channel added successfully!')
        setFormData({ name: '', channelId: '' })
        setShowForm(false)
        fetchChannels()
        
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to add channel')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">YouTube Channels</h1>
          <p className="text-gray-600 mt-1">Manage your YouTube channels</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Cancel' : 'Add Channel'}
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check size={20} />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <X size={20} />
          {error}
        </div>
      )}

      {/* Add Channel Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Channel</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Channel Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Veer Bharat"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">A friendly name for this channel</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Channel ID
              </label>
              <input
                type="text"
                value={formData.channelId}
                onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
                placeholder="UCxxxxxxxxxxxxxxxxxx"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Find it in your YouTube channel URL or settings
              </p>
            </div>

            <button
              type="submit"
              disabled={adding}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw size={20} className="animate-spin" />
                  Adding Channel...
                </span>
              ) : (
                'Add Channel'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Channels List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Existing Channels</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <RefreshCw size={32} className="animate-spin mx-auto mb-4" />
            Loading channels...
          </div>
        ) : channels.length === 0 ? (
          <div className="p-12 text-center">
            <Youtube size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">No channels added yet</p>
            <p className="text-sm text-gray-500">Click "Add Channel" to get started</p>
          </div>
        ) : (
          <div className="divide-y">
            {channels.map((channel) => (
              <div key={channel._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Channel Thumbnail */}
                  {channel.thumbnailUrl && (
                    <img
                      src={channel.thumbnailUrl}
                      alt={channel.title}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  )}

                  {/* Channel Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {channel.name}
                        </h3>
                        <p className="text-gray-600">{channel.title}</p>
                        {channel.customUrl && (
                          <p className="text-sm text-gray-500">@{channel.customUrl}</p>
                        )}
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                        Active
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-600">Subscribers</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatNumber(channel.subscriberCount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Videos</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatNumber(channel.videoCount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Views</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatNumber(channel.viewCount)}
                        </p>
                      </div>
                    </div>

                    {/* Last Synced */}
                    <div className="mt-4 text-xs text-gray-500">
                      Last synced: {formatDate(channel.lastSyncedAt, true)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}