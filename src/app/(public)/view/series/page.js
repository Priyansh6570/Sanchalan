'use client'
import { useState, useEffect } from 'react'
import { 
  Search, Filter, Play, Calendar, Users, Video, Globe,
  TrendingUp, Eye, ThumbsUp, Clock, Sparkles
} from 'lucide-react'

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}

const formatTime12Hour = (time) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
}

// Check if series has upcoming upload
const getNextUploadInfo = (series) => {
  const now = new Date()
  const currentDay = now.toLocaleString('en-US', { weekday: 'long' })
  const currentTime = now.getHours() * 60 + now.getMinutes()
  
  const daysOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const currentDayIndex = daysOrder.indexOf(currentDay)
  
  // Check episode uploads
  const allUploads = [
    ...(series.episodeUploadDays || []).map(s => ({ ...s, type: 'Episode' })),
    ...(series.trailerUploadDays || []).map(s => ({ ...s, type: 'Trailer' }))
  ]
  
  if (allUploads.length === 0) return null
  
  // Find next upload
  let nextUpload = null
  let minDaysAway = 8 // More than a week
  
  allUploads.forEach(upload => {
    const uploadDayIndex = daysOrder.indexOf(upload.day)
    let daysAway = (uploadDayIndex - currentDayIndex + 7) % 7
    
    // If it's today, check time
    if (daysAway === 0 && upload.time) {
      const [hours, minutes] = upload.time.split(':').map(Number)
      const uploadTime = hours * 60 + minutes
      if (uploadTime <= currentTime) {
        daysAway = 7 // Next week
      }
    }
    
    if (daysAway === 0) daysAway = 7 // If today but time passed, next week
    
    if (daysAway < minDaysAway) {
      minDaysAway = daysAway
      nextUpload = { ...upload, daysAway }
    }
  })
  
  return nextUpload
}

export default function PublicSeriesPage() {
  const [series, setSeries] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterTeam, setFilterTeam] = useState('all')

  const fetchData = async () => {
    try {
      setLoading(true)
      const [seriesRes, videosRes] = await Promise.all([
        fetch('/api/series'),
        fetch('/api/videos')
      ])
      
      const seriesData = await seriesRes.json()
      const videosData = await videosRes.json()

      if (seriesData.success) setSeries(seriesData.series || [])
      if (videosData.success) setVideos(videosData.videos || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  // Get video stats for each series
  const seriesWithStats = series.map(s => {
    const seriesVideos = videos.filter(v => v.series?._id === s._id)
    const totalViews = seriesVideos.reduce((sum, v) => sum + (v.viewCount || 0), 0)
    const totalLikes = seriesVideos.reduce((sum, v) => sum + (v.likeCount || 0), 0)
    const latestVideos = seriesVideos
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 3)
    
    const nextUpload = getNextUploadInfo(s)
    
    return {
      ...s,
      videoCount: seriesVideos.length,
      totalViews,
      totalLikes,
      latestVideos,
      nextUpload
    }
  })

  const filteredSeries = seriesWithStats.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus
    const matchesTeam = filterTeam === 'all' || s.team?._id === filterTeam
    return matchesSearch && matchesStatus && matchesTeam
  })

  // Sort: upcoming uploads first, then by status
  const sortedSeries = [...filteredSeries].sort((a, b) => {
    if (a.nextUpload && !b.nextUpload) return -1
    if (!a.nextUpload && b.nextUpload) return 1
    if (a.nextUpload && b.nextUpload) {
      return a.nextUpload.daysAway - b.nextUpload.daysAway
    }
    return 0
  })

  const uniqueTeams = [...new Set(series.map(s => s.team).filter(Boolean))]

  const stats = {
    total: series.length,
    active: series.filter(s => s.status === 'active').length,
    totalVideos: videos.length,
    totalViews: videos.reduce((sum, v) => sum + (v.viewCount || 0), 0),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Series Library
            </h1>
            <p className="text-gray-600 mt-2">Explore all content series and their schedules</p>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Live updates</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Series" value={stats.total} icon={Play} gradient="from-blue-500 to-blue-600" delay={0} />
          <StatCard label="Active Series" value={stats.active} icon={TrendingUp} gradient="from-green-500 to-green-600" delay={0.1} />
          <StatCard label="Total Videos" value={stats.totalVideos} icon={Video} gradient="from-purple-500 to-purple-600" delay={0.2} />
          <StatCard label="Total Views" value={formatNumber(stats.totalViews)} icon={Eye} gradient="from-orange-500 to-orange-600" delay={0.3} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search series..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none appearance-none cursor-pointer transition-all"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <div className="relative min-w-[180px]">
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none appearance-none cursor-pointer transition-all"
              >
                <option value="all">All Teams</option>
                {uniqueTeams.map(team => (
                  <option key={team._id} value={team._id}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Series Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading series...</p>
          </div>
        ) : sortedSeries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
            <Play size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 font-medium mb-2">
              {searchTerm || filterStatus !== 'all' ? 'No series match your filters' : 'No series available'}
            </p>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedSeries.map((s, index) => (
              <SeriesCard key={s._id} series={s} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, gradient, delay }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div 
      className={`relative rounded-2xl p-6 shadow-lg overflow-hidden transform transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <Icon size={24} className="text-white/80" />
          <div className="w-2 h-2 rounded-full bg-white/50 animate-pulse" />
        </div>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <p className="text-sm text-white/80 font-medium">{label}</p>
      </div>
    </div>
  )
}

function SeriesCard({ series, index }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 50)
    return () => clearTimeout(timer)
  }, [index])

  const statusConfig = {
    active: { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' },
    upcoming: { bg: 'bg-yellow-50', text: 'text-yellow-600', dot: 'bg-yellow-500' },
    completed: { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500' },
    paused: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' }
  }

  const config = statusConfig[series.status] || statusConfig.active
  const hasUpcomingUpload = series.nextUpload && series.nextUpload.daysAway <= 2

  return (
    <div 
      className={`bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transform transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } hover:-translate-y-1`}
    >
      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Header with Title and Status */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 flex-1">
            {series.name}
          </h3>
          <div className={`px-3 py-1.5 rounded-lg ${config.bg} flex items-center gap-2 flex-shrink-0`}>
            <div className={`w-2 h-2 rounded-full ${config.dot}`} />
            <span className={`text-xs font-semibold ${config.text} capitalize`}>
              {series.status}
            </span>
          </div>
        </div>

        {/* Upcoming Upload Alert */}
        {hasUpcomingUpload && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-600 flex-shrink-0" />
              <span className="text-sm font-semibold text-amber-900">
                {series.nextUpload.type} {series.nextUpload.daysAway === 0 ? 'Today' : series.nextUpload.daysAway === 1 ? 'Tomorrow' : `in ${series.nextUpload.daysAway} days`}
                {series.nextUpload.time && ` at ${formatTime12Hour(series.nextUpload.time)}`}
              </span>
            </div>
          </div>
        )}

        {/* Description */}
        {series.description && (
          <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
            {series.description}
          </p>
        )}

        {/* Team & Channel Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <Globe size={12} />
              Channel
            </p>
            <p className="font-semibold text-gray-900 truncate text-sm">
              {series.channel?.name || 'N/A'}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <Users size={12} />
              Team
            </p>
            <p className="font-semibold text-gray-900 truncate text-sm">
              {series.team?.name || 'Not assigned'}
            </p>
          </div>
        </div>

        {series.team?.lead && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Lead: <span className="font-medium text-gray-700">{series.team.lead}</span>
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
          <div className="text-center">
            <Video size={18} className="text-gray-400 mx-auto mb-1.5" />
            <div className="font-bold text-gray-900 text-lg">{series.videoCount}</div>
            <div className="text-xs text-gray-500 font-medium">Videos</div>
          </div>
          <div className="text-center border-x border-gray-100">
            <Eye size={18} className="text-gray-400 mx-auto mb-1.5" />
            <div className="font-bold text-gray-900 text-lg">{formatNumber(series.totalViews)}</div>
            <div className="text-xs text-gray-500 font-medium">Views</div>
          </div>
          <div className="text-center">
            <ThumbsUp size={18} className="text-gray-400 mx-auto mb-1.5" />
            <div className="font-bold text-gray-900 text-lg">{formatNumber(series.totalLikes)}</div>
            <div className="text-xs text-gray-500 font-medium">Likes</div>
          </div>
        </div>

        {/* Upload Schedule */}
        {(series.episodeUploadDays?.length > 0 || series.trailerUploadDays?.length > 0) && (
          <div className="pt-4 border-t border-gray-100 space-y-3">
            {series.episodeUploadDays?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={13} className="text-gray-400" />
                  <p className="text-xs font-semibold text-gray-700">Episode Schedule</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {series.episodeUploadDays.map((schedule, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                      {schedule.day} {schedule.time && `• ${formatTime12Hour(schedule.time)}`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {series.trailerUploadDays?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Video size={13} className="text-gray-400" />
                  <p className="text-xs font-semibold text-gray-700">Trailer Schedule</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {series.trailerUploadDays.map((schedule, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium border border-purple-100">
                      {schedule.day} {schedule.time && `• ${formatTime12Hour(schedule.time)}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Latest Videos */}
        {series.latestVideos?.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-gray-400" />
              <p className="text-xs font-medium text-gray-500">Latest Videos</p>
            </div>
            <div className="space-y-2">
              {series.latestVideos.map((video) => (
                <a
                  key={video._id}
                  href={`https://youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <p className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {formatNumber(video.viewCount)}
                    </span>
                    <span>•</span>
                    <span>{formatDate(video.publishedAt)}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}