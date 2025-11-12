'use client'
// src/app/videos/page.js
import { useState, useEffect } from 'react'
import { 
  Video, RefreshCw, Plus, Check, X, Search, 
  TrendingUp, ThumbsUp, MessageCircle, Calendar,
  Eye, Play, Edit2
} from 'lucide-react'
import { formatNumber, formatDate, getStatusColor } from '@/lib/utils'

export default function VideosPage() {
  const [videos, setVideos] = useState([])
  const [channels, setChannels] = useState([])
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingVideo, setEditingVideo] = useState(null)
  
  const [formData, setFormData] = useState({
    videoUrl: '',
    channel: '',
    series: '',
    expectedUploadDate: '',
    subtitleCount: 0,
    adStatus: 'not-set',
    seoNotes: '',
  })

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true)
      const [videosRes, channelsRes, seriesRes] = await Promise.all([
        fetch('/api/videos'),
        fetch('/api/channels'),
        fetch('/api/series'),
      ])

      const [videosData, channelsData, seriesData] = await Promise.all([
        videosRes.json(),
        channelsRes.json(),
        seriesRes.json(),
      ])

      if (videosData.success) setVideos(videosData.videos)
      if (channelsData.success) setChannels(channelsData.channels)
      if (seriesData.success) setSeries(seriesData.series)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setAdding(true)

    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Video added successfully!')
        setFormData({
          videoUrl: '',
          channel: '',
          series: '',
          expectedUploadDate: '',
          subtitleCount: 0,
          adStatus: 'not-set',
          seoNotes: '',
        })
        setShowForm(false)
        fetchData()
        
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to add video')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setAdding(false)
    }
  }

  // Handle edit video
  const handleUpdateVideo = async (videoId, updates) => {
    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Video updated!')
        fetchData()
        setEditingVideo(null)
        setTimeout(() => setSuccess(''), 2000)
      }
    } catch (err) {
      setError('Failed to update video')
    }
  }

  // Handle refresh stats
  const handleRefreshStats = async (videoId) => {
    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'GET',
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Stats refreshed from YouTube!')
        fetchData()
        setTimeout(() => setSuccess(''), 2000)
      }
    } catch (err) {
      setError('Failed to refresh stats')
    }
  }

  // Filter videos
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || video.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Stats
  const stats = {
    total: videos.length,
    uploaded: videos.filter(v => v.status === 'uploaded').length,
    scheduled: videos.filter(v => v.status === 'scheduled').length,
    delayed: videos.filter(v => v.status === 'delayed').length,
    totalViews: videos.reduce((sum, v) => sum + (v.viewCount || 0), 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Videos Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all your YouTube videos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Cancel' : 'Add Video'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Videos" value={stats.total} icon={Video} color="blue" />
        <StatCard label="Uploaded" value={stats.uploaded} icon={Check} color="green" />
        <StatCard label="Scheduled" value={stats.scheduled} icon={Calendar} color="yellow" />
        <StatCard label="Delayed" value={stats.delayed} icon={X} color="red" />
        <StatCard label="Total Views" value={formatNumber(stats.totalViews)} icon={TrendingUp} color="purple" />
      </div>

      {/* Messages */}
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

      {/* Add Video Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Video</h2>
          
          {channels.length === 0 || series.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <p className="font-medium">Setup Required</p>
              <p className="text-sm mt-1">
                Please add at least one channel and series first.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube Video URL *
                </label>
                <input
                  type="text"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste the full YouTube video URL. We'll automatically fetch title, views, likes, etc.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Channel *
                  </label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Channel</option>
                    {channels.map((channel) => (
                      <option key={channel._id} value={channel._id}>
                        {channel.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Series *
                  </label>
                  <select
                    value={formData.series}
                    onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Series</option>
                    {series.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.team?.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle Count (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.subtitleCount}
                    onChange={(e) => setFormData({ ...formData, subtitleCount: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Status
                  </label>
                  <select
                    value={formData.adStatus}
                    onChange={(e) => setFormData({ ...formData, adStatus: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="not-set">Not Set</option>
                    <option value="running">Running</option>
                    <option value="stopped">Stopped</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Upload Date
                  </label>
                  <input
                    type="date"
                    value={formData.expectedUploadDate}
                    onChange={(e) => setFormData({ ...formData, expectedUploadDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Notes (Optional)
                </label>
                <textarea
                  value={formData.seoNotes}
                  onChange={(e) => setFormData({ ...formData, seoNotes: e.target.value })}
                  placeholder="Notes about SEO, tags, optimization..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw size={20} className="animate-spin" />
                    Adding Video...
                  </span>
                ) : (
                  'Add Video'
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="all">All Status</option>
          <option value="uploaded">Uploaded</option>
          <option value="scheduled">Scheduled</option>
          <option value="delayed">Delayed</option>
        </select>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>

      {/* Videos List */}
      <div className="bg-white rounded-xl shadow-sm border">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <RefreshCw size={32} className="animate-spin mx-auto mb-4" />
            Loading videos...
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="p-12 text-center">
            <Video size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              {searchTerm || filterStatus !== 'all' ? 'No videos match your filters' : 'No videos added yet'}
            </p>
            <p className="text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filters' : 'Click "Add Video" to get started'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredVideos.map((video) => (
              <VideoCard 
                key={video._id} 
                video={video} 
                onUpdate={handleUpdateVideo}
                onRefresh={handleRefreshStats}
                editing={editingVideo === video._id}
                setEditing={setEditingVideo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}

function VideoCard({ video, onUpdate, onRefresh, editing, setEditing }) {
  const [editData, setEditData] = useState({
    subtitleCount: video.subtitleCount,
    adStatus: video.adStatus,
    status: video.status,
    seoNotes: video.seoNotes,
  })

  const statusColor = getStatusColor(video.status)

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex gap-4">
        {/* Thumbnail */}
        {video.thumbnailUrl && (
          <a 
            href={`https://youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0"
          >
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-40 h-24 object-cover rounded-lg hover:opacity-80 transition-opacity"
            />
          </a>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {video.title}
              </h3>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <span>Series: <strong>{video.series?.name}</strong></span>
                <span>•</span>
                <span>Team: <strong>{video.series?.team?.name}</strong></span>
                <span>•</span>
                <span>Channel: <strong>{video.channel?.name}</strong></span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                {video.status}
              </span>
              <button
                onClick={() => setEditing(editing ? null : video._id)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Edit2 size={16} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Eye size={16} className="text-gray-400" />
              <span><strong>{formatNumber(video.viewCount)}</strong> views</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ThumbsUp size={16} className="text-gray-400" />
              <span><strong>{formatNumber(video.likeCount)}</strong> likes</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MessageCircle size={16} className="text-gray-400" />
              <span><strong>{formatNumber(video.commentCount)}</strong> comments</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-gray-400" />
              <span>{formatDate(video.publishedAt)}</span>
            </div>
          </div>

          {/* Edit Mode */}
          {editing ? (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Subtitles (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editData.subtitleCount}
                    onChange={(e) => setEditData({ ...editData, subtitleCount: parseInt(e.target.value) })}
                    className="w-full px-3 py-1 text-sm border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Ad Status
                  </label>
                  <select
                    value={editData.adStatus}
                    onChange={(e) => setEditData({ ...editData, adStatus: e.target.value })}
                    className="w-full px-3 py-1 text-sm border rounded"
                  >
                    <option value="not-set">Not Set</option>
                    <option value="running">Running</option>
                    <option value="stopped">Stopped</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="w-full px-3 py-1 text-sm border rounded"
                  >
                    <option value="uploaded">Uploaded</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onUpdate(video._id, editData)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onRefresh(video._id)}
                  className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Refresh from YouTube
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-sm">
              <span>Subtitles: <strong>{video.subtitleCount}/100</strong></span>
              <span>•</span>
              <span>Ads: <strong className={
                video.adStatus === 'running' ? 'text-green-600' :
                video.adStatus === 'stopped' ? 'text-red-600' :
                video.adStatus === 'pending' ? 'text-yellow-600' :
                'text-gray-500'
              }>{video.adStatus}</strong></span>
              <span>•</span>
              <span className="text-gray-500">Synced: {formatDate(video.lastSyncedAt, true)}</span>
              <a
                href={`https://youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1 text-blue-600 hover:text-blue-700"
              >
                <Play size={16} />
                Watch on YouTube
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}