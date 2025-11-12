'use client'
// src/app/(public)/view/page.js
import { useState, useEffect } from 'react'
import { 
  Video, Users, Calendar, TrendingUp, Eye, ThumbsUp,
  MessageCircle, RefreshCw
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatNumber, formatDate, getStatusColor } from '@/lib/utils'

export default function PublicDashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard')
      const result = await response.json()
      if (result.success) {
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboard, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw size={32} className="animate-spin text-gray-400" />
      </div>
    )
  }

  if (!data) {
    return <div>Error loading dashboard</div>
  }

  const { overview, recentVideos, teamPerformance, weeklyTrend } = data

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Veer Bharat CMS Dashboard 📊
        </h1>
        <p className="text-gray-300 text-lg">
          Managing {overview.totalVideos} videos across {overview.totalSeries} series
        </p>
        <div className="mt-4 flex gap-4 text-sm">
          <span>📊 {formatNumber(overview.totalViews)} total views</span>
          <span>•</span>
          <span>👍 {formatNumber(overview.totalLikes)} likes</span>
          <span>•</span>
          <span>💬 {formatNumber(overview.totalComments)} comments</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard title="Total Videos" value={overview.totalVideos} icon={Video} color="blue" />
        <StatCard title="This Month" value={overview.thisMonthVideos} icon={Calendar} color="green" />
        <StatCard title="Uploaded" value={overview.uploadedCount} icon={TrendingUp} color="purple" />
        <StatCard title="Scheduled" value={overview.scheduledCount} icon={Calendar} color="yellow" />
        <StatCard title="Delayed" value={overview.delayedCount} icon={TrendingUp} color="red" />
        <StatCard title="Active Teams" value={overview.totalTeams} icon={Users} color="indigo" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Weekly View Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyTrend}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#6b7280" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Team Performance */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Team Performance</h2>
          {teamPerformance.length > 0 ? (
            <div className="space-y-3">
              {teamPerformance.map((team, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{team.team}</p>
                    <p className="text-sm text-gray-600">{team.videos} videos</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-700">{formatNumber(team.views)}</p>
                    <p className="text-xs text-gray-500">total views</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No team data yet</p>
          )}
        </div>
      </div>

      {/* Recent Videos */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Videos</h2>
        </div>
        {recentVideos.length > 0 ? (
          <div className="divide-y">
            {recentVideos.slice(0, 5).map((video) => {
              const statusColor = getStatusColor(video.status)
              return (
                <div key={video._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-4">
                    {video.thumbnailUrl && (
                      <a 
                        href={`https://youtube.com/watch?v=${video.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-32 h-20 object-cover rounded-lg hover:opacity-80"
                        />
                      </a>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {video.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColor.bg} ${statusColor.text}`}>
                          {video.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {formatNumber(video.viewCount)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp size={14} />
                          {formatNumber(video.likeCount)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={14} />
                          {formatNumber(video.commentCount)}
                        </span>
                        <span>•</span>
                        <span>{video.series?.name}</span>
                        <span>•</span>
                        <span>{formatDate(video.publishedAt)}</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Subtitles: {video.subtitleCount}/100 • Ads: {video.adStatus}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <Video size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No videos yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}