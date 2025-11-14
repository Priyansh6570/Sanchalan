'use client'
// src/app/(public)/view/videos/page.js
import { useState, useEffect } from 'react'
import { 
  Video, Search, Eye, ThumbsUp, MessageCircle, 
  Calendar, RefreshCw, Play
} from 'lucide-react'
import { formatNumber, formatDate, getStatusColor } from '@/lib/utils'

export default function PublicVideosPage() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/videos')
      const data = await response.json()
      if (data.success) {
        setVideos(data.videos || [])
      }
    } catch (err) {
      console.error('Error fetching videos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchVideos, 30000)
    return () => clearInterval(interval)
  }, [])

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Videos Library</h1>
        <p className="text-gray-600 mt-1">Browse all uploaded videos - Read-only view</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Videos" value={stats.total} color="blue" />
        <StatCard label="Uploaded" value={stats.uploaded} color="green" />
        <StatCard label="Scheduled" value={stats.scheduled} color="yellow" />
        <StatCard label="Delayed" value={stats.delayed} color="red" />
        <StatCard label="Total Views" value={formatNumber(stats.totalViews)} color="purple" />
      </div>

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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none"
        >
          <option value="all">All Status</option>
          <option value="uploaded">Uploaded</option>
          <option value="scheduled">Scheduled</option>
          <option value="delayed">Delayed</option>
        </select>
      </div>

      {/* Videos Grid */}
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
          </div>
        ) : (
          <div className="divide-y">
            {filteredVideos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  const colors = {
    blue: 'border-blue-500 bg-blue-50',
    green: 'border-green-500 bg-green-50',
    yellow: 'border-yellow-500 bg-yellow-50',
    red: 'border-red-500 bg-red-50',
    purple: 'border-purple-500 bg-purple-50'
  }

  return (
    <div className={`rounded-xl p-4 border-l-4 ${colors[color]} shadow-sm`}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}

function VideoCard({ video }) {
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
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
              {video.status}
            </span>
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
              className="ml-auto flex items-center gap-1 text-red-600 hover:text-red-700"
            >
              <Play size={16} />
              Watch on YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}