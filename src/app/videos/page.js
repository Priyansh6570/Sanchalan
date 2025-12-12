'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function VideosPage() {
  const [videos, setVideos] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/videos')
      const data = await response.json()
      console.log('Fetched videos:', data)
      setVideos(data.videos || [])
    } catch (error) {
      console.error('Error fetching videos:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const filteredVideos = videos.filter(v => {
    const matchesFilter = filter === 'all' || v.status === filter
    const matchesSearch = v.title?.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = {
    total: videos.length,
    uploaded: videos.filter(v => v.status === 'uploaded').length,
    scheduled: videos.filter(v => v.status === 'scheduled').length,
    delayed: videos.filter(v => v.status === 'delayed').length,
    totalViews: videos.reduce((sum, v) => sum + (v.viewCount || 0), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500 text-lg">Loading videos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Videos" value={stats.total} color="blue" />
        <StatCard label="Uploaded" value={stats.uploaded} color="green" />
        <StatCard label="Scheduled" value={stats.scheduled} color="yellow" />
        <StatCard label="Delayed" value={stats.delayed} color="red" />
        <StatCard label="Total Views" value={stats.totalViews.toLocaleString()} color="purple" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search videos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 flex-1 min-w-[200px]"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="all">All Status</option>
          <option value="uploaded">Uploaded</option>
          <option value="scheduled">Scheduled</option>
          <option value="delayed">Delayed</option>
        </select>
        <button
          onClick={fetchVideos}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors"
        >
          ➕ Add Video
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVideos.map((video, i) => (
          <VideoCard key={video._id} video={video} delay={i * 0.05} />
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-gray-500 text-lg">No videos found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
        </div>
      )}

      <AddVideoModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false)
          fetchVideos()
        }}
      />
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

function VideoCard({ video, delay }) {
  const statusColors = {
    uploaded: 'bg-green-100 text-green-800',
    scheduled: 'bg-yellow-100 text-yellow-800',
    delayed: 'bg-red-100 text-red-800'
  }

  const adStatusColors = {
    running: 'bg-blue-100 text-blue-800',
    stopped: 'bg-gray-100 text-gray-800',
    pending: 'bg-orange-100 text-orange-800',
    'not-set': 'bg-gray-100 text-gray-600'
  }

  const privacyColors = {
    public: 'bg-green-100 text-green-800',
    unlisted: 'bg-yellow-100 text-yellow-800',
    private: 'bg-purple-100 text-purple-800'
  }

  const privacyIcons = {
    public: '🌐',
    unlisted: '🔗',
    private: '🔒'
  }

  // Get subtitle count from either location
  const subtitleCount = video.subtitles?.count || video.subtitleCount || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 space-y-3"
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-semibold text-lg line-clamp-2">{video.title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[video.status]}`}>
          {video.status}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Series:</span>
          <span className="font-medium">{video.series?.name || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span>Channel:</span>
          <span className="font-medium">{video.channel?.name || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span>Views:</span>
          <span className="font-bold text-green-600">{(video.viewCount || 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Likes:</span>
          <span className="font-medium">{(video.likeCount || 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Subtitles:</span>
          <span className="font-medium">{video.subtitleCount || 0} languages</span>
        </div>
        {video.adStatus && video.adStatus !== 'not-set' && (
          <div className="flex justify-between items-center">
            <span>Ads:</span>
            <span className={`px-2 py-1 rounded-full text-xs ${adStatusColors[video.adStatus]}`}>
              {video.adStatus}
            </span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t text-xs text-gray-500">
        {video.publishedAt ? (
          <>Published: {new Date(video.publishedAt).toLocaleDateString()}</>
        ) : (
          <>Expected: {video.expectedUploadDate ? new Date(video.expectedUploadDate).toLocaleDateString() : 'TBD'}</>
        )}
      </div>

      {video.videoId && (
        <div className="flex gap-2">
          <a
            href={`/analytics/${video._id}`}
            className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            📊 Analytics
          </a>
          <a
            href={`https://youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            YouTube 🎥
          </a>
        </div>
      )}
    </motion.div>
  )
}

function AddVideoModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [youtubeConnected, setYoutubeConnected] = useState(false)
  
  const [videoUrl, setVideoUrl] = useState('')
  const [channels, setChannels] = useState([])
  const [series, setSeries] = useState([])
  
  const [formData, setFormData] = useState({
    channel: '',
    series: '',
    expectedUploadDate: '',
    subtitleCount: 0,
    adStatus: 'not-set',
    seoNotes: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchChannelsAndSeries()
      checkYouTubeStatus()
    }
  }, [isOpen])

  const checkYouTubeStatus = async () => {
    try {
      const response = await fetch('/api/auth/youtube/status')
      const data = await response.json()
      setYoutubeConnected(data.connected && !data.needsReconnect)
    } catch (error) {
      setYoutubeConnected(false)
    }
  }

  const fetchChannelsAndSeries = async () => {
    try {
      const [channelsRes, seriesRes] = await Promise.all([
        fetch('/api/channels').then(r => r.json()),
        fetch('/api/series').then(r => r.json())
      ])
      setChannels(channelsRes.channels || [])
      setSeries(seriesRes.series || [])
      console.log('Channels loaded:', channelsRes.channels?.length || 0)
      console.log('Series loaded:', seriesRes.series?.length || 0)
    } catch (error) {
      console.error('Error fetching channels/series:', error)
    }
  }

  const handleSubmit = async () => {
    if (!videoUrl.trim()) {
      setError('Please enter a YouTube URL')
      return
    }

    if (!formData.channel || !formData.series) {
      setError('Please select both channel and series')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl,
          ...formData,
          isScheduled: true
        })
      })

      const data = await response.json()

      if (data.success) {
        // Show success message with schedule info if applicable
        if (data.isScheduled && data.scheduledPublishTime) {
          alert(`✅ ${data.message}`)
        }
        onSuccess()
        resetForm()
      } else {
        // Provide helpful error for videos requiring authentication
        if (data.needsAuth) {
          setError(
            `${data.error}\n\n${data.suggestion || ''}\n\n` +
            `🔗 To add private or scheduled videos, connect your YouTube account in Settings.`
          )
        } else {
          setError(data.error || 'Failed to add video')
        }
      }
    } catch (error) {
      console.error('Error adding video:', error)
      setError('Failed to add video. Please try again.')
    }

    setLoading(false)
  }

  const resetForm = () => {
    setStep(1)
    setVideoUrl('')
    setFormData({
      channel: '',
      series: '',
      expectedUploadDate: '',
      subtitleCount: 0,
      adStatus: 'not-set',
      seoNotes: ''
    })
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold">Add New Video</h2>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg whitespace-pre-line">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {!youtubeConnected && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <p className="text-sm font-medium text-orange-900">YouTube Not Connected</p>
                        <p className="text-xs text-orange-700 mt-1">
                          You can add public videos, but private/scheduled videos require YouTube authentication.
                        </p>
                        <a 
                          href="/api/auth/youtube"
                          className="inline-block mt-2 text-xs text-orange-800 underline hover:text-orange-900"
                        >
                          Connect YouTube Account →
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube Video URL *
                  </label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    The video details will be automatically fetched from YouTube
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Channel *
                    </label>
                    <select
                      value={formData.channel}
                      onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Channel</option>
                      {channels.map(channel => (
                        <option key={channel._id} value={channel._id}>
                          {channel.name}
                        </option>
                      ))}
                    </select>
                    {channels.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">Loading channels...</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Series *
                    </label>
                    <select
                      value={formData.series}
                      onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Series</option>
                      {series.map(s => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    {series.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">Loading series...</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad Status
                    </label>
                    <select
                      value={formData.adStatus}
                      onChange={(e) => setFormData({ ...formData, adStatus: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional - for tracking delays</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Automatic Subtitle Detection</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Subtitle count will be automatically fetched from YouTube when you add the video. No manual entry needed!
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Notes
                  </label>
                  <textarea
                    value={formData.seoNotes}
                    onChange={(e) => setFormData({ ...formData, seoNotes: e.target.value })}
                    rows={3}
                    placeholder="Add any SEO-related notes or optimizations..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleClose}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {loading ? 'Adding Video...' : 'Add Video'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}