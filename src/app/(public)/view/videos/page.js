'use client'
import { useState, useEffect } from 'react'
import { 
  Video, Search, Eye, ThumbsUp, MessageCircle, 
  Calendar, RefreshCw, Play, Filter, TrendingUp, BarChart3, Lock
} from 'lucide-react'
import { formatNumber, formatDate, getStatusColor } from '@/lib/utils'

export default function PublicVideosPage() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSeries, setFilterSeries] = useState('all')

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const r = await fetch('/api/videos')
      const data = await r.json()
      if (data.success) setVideos(data.videos || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
    const i = setInterval(fetchVideos, 30000)
    return () => clearInterval(i)
  }, [])

  const filteredVideos = videos.filter(v => {
    const s = v.title.toLowerCase().includes(searchTerm.toLowerCase())
    const st = filterStatus === 'all' || v.status === filterStatus
    const sr = filterSeries === 'all' || v.series?.name === filterSeries
    return s && st && sr
  })

  const uniqueSeries = [...new Set(videos.map(v => v.series?.name).filter(Boolean))]

  const stats = {
    total: videos.length,
    uploaded: videos.filter(v => v.status === 'uploaded').length,
    scheduled: videos.filter(v => v.status === 'scheduled').length,
    delayed: videos.filter(v => v.status === 'delayed').length,
    totalViews: videos.reduce((s, v) => s + (v.viewCount || 0), 0),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto space-y-6">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Videos Library
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">Browse all uploaded videos</p>
          </div>

          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Live syncing</span>
            </div>
          </div>
        </div>

        <div className="md:hidden w-full overflow-x-auto no-scroll">
          <div className="inline-flex gap-3 px-1 py-1">
            <MiniStat label="Total" value={stats.total} icon={Video} gradient="from-blue-500 to-blue-600"/>
            <MiniStat label="Uploaded" value={stats.uploaded} icon={TrendingUp} gradient="from-green-500 to-green-600"/>
            <MiniStat label="Scheduled" value={stats.scheduled} icon={Calendar} gradient="from-yellow-500 to-yellow-600"/>
            <MiniStat label="Delayed" value={stats.delayed} icon={RefreshCw} gradient="from-red-500 to-red-600"/>
            <MiniStat label="Views" value={formatNumber(stats.totalViews)} icon={Eye} gradient="from-purple-500 to-purple-600"/>
          </div>
        </div>

        <div className="hidden md:grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total Videos" value={stats.total} icon={Video} gradient="from-blue-500 to-blue-600"/>
          <StatCard label="Uploaded" value={stats.uploaded} icon={TrendingUp} gradient="from-green-500 to-green-600"/>
          <StatCard label="Scheduled" value={stats.scheduled} icon={Calendar} gradient="from-yellow-500 to-yellow-600"/>
          <StatCard label="Delayed" value={stats.delayed} icon={RefreshCw} gradient="from-red-500 to-red-600"/>
          <StatCard label="Total Views" value={formatNumber(stats.totalViews)} icon={Eye} gradient="from-purple-500 to-purple-600"/>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                <input 
                  type="text" 
                  placeholder="Search videos..." 
                  value={searchTerm}
                  onChange={e=>setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm md:text-base"
                />
              </div>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
              <select 
                value={filterStatus}
                onChange={e=>setFilterStatus(e.target.value)}
                className="pl-9 pr-10 py-2.5 bg-gray-50 text-sm md:text-base border border-gray-200 rounded-xl"
              >
                <option value="all">All Status</option>
                <option value="uploaded">Uploaded</option>
                <option value="scheduled">Scheduled</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>

            <div className="relative w-full md:w-auto">
              <select 
                value={filterSeries}
                onChange={e=>setFilterSeries(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-gray-50 text-sm md:text-base border border-gray-200 rounded-xl"
              >
                <option value="all">All Series</option>
                {uniqueSeries.map(s=>(
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
            <div className="w-14 h-14 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"/>
            <p className="text-gray-600 font-medium text-sm md:text-base">Loading videos...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
            <Video size={64} className="text-gray-300 mx-auto mb-3"/>
            <p className="text-gray-600 font-medium text-sm md:text-base">No matching videos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((v,i)=>(
              <VideoCard key={v._id} video={v} index={i}/>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

function MiniStat({label,value,icon:Icon,gradient}) {
  return (
    <div className="rounded-xl p-3 w-[140px] bg-gradient-to-br text-white shadow-md relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80`}/>
      <div className="relative z-10">
        <Icon size={18} className="mb-1"/>
        <p className="text-lg font-bold">{value}</p>
        <p className="text-xs opacity-90">{label}</p>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, gradient }) {
  return (
    <div className="relative rounded-2xl p-6 shadow-lg overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
      <div className="relative">
        <Icon size={24} className="text-white/90 mb-2" />
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-sm text-white/80">{label}</p>
      </div>
    </div>
  )
}

function VideoCard({ video, index }) {
  const [v,setV]=useState(false)
  useEffect(()=>{const t=setTimeout(()=>setV(true),index*50);return()=>clearTimeout(t)},[index])
  const s=getStatusColor(video.status)

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 transition-all duration-500 overflow-hidden ${v?'opacity-100 translate-y-0':'opacity-0 translate-y-6'}`}>
      <a href={`https://youtube.com/watch?v=${video.videoId}`} target="_blank" className="block relative group">
        <div className="w-full aspect-video bg-gray-100 overflow-hidden">
          {video.thumbnailUrl ? (
            <img src={video.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform"/>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video size={40} className="text-gray-300"/>
            </div>
          )}
        </div>

        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full ${s.bg} flex items-center gap-2`}>
          <div className={`w-2 h-2 rounded-full ${s.text.replace('text-','bg-')}`}/>
          <span className={`text-xs font-bold ${s.text}`}>{video.status}</span>
        </div>
      </a>

      <div className="p-5 space-y-4">
        <h3 className="font-medium text-gray-900 text-sm md:text-base leading-snug line-clamp-2">
          {video.title}
        </h3>

        <div className="grid grid-cols-3 gap-2">
          <Stat icon={Eye} value={video.viewCount} label="views"/>
          <Stat icon={ThumbsUp} value={video.likeCount} label="likes"/>
          <Stat icon={MessageCircle} value={video.commentCount} label="comments"/>
        </div>

        <div className="text-xs md:text-sm space-y-1 pt-2 border-t border-gray-100">
          <div className="flex justify-between">
            <span className="text-gray-500">Published:</span>
            <strong>{formatDate(video.publishedAt,true)}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Series:</span>
            <strong>{video.series?.name}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Team:</span>
            <strong>{video.series?.team?.name}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({icon:Icon,value,label}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <Icon size={16} className="text-gray-400 mx-auto mb-1"/>
      <div className="font-bold text-gray-900 text-sm">{formatNumber(value)}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}
