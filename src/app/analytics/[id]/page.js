'use client'
// src/app/analytics/[id]/page.js
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import YouTubeAuthStatus from '@/components/YoutubeAuthStatus'
import { 
  TrendingUp, Eye, Clock, Users, RefreshCw, 
  ArrowLeft, ThumbsUp, MessageCircle, Languages,
  Play, AlertCircle
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatNumber } from '@/lib/utils'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function VideoAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/analytics/video/${params.id}`)
      const result = await response.json()
      
      if (!result.success) {
        if (result.needsAuth) {
          setError('YouTube Analytics not connected. Please connect in Settings.')
        } else {
          setError(result.error || 'Failed to fetch analytics')
        }
      } else {
        setData(result)
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [params.id])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAnalytics()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw size={32} className="animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Analytics Unavailable</h2>
          <p className="text-red-700 mb-4">{error}</p>
          {error.includes('not connected') && (
            <a
              href="/admin/settings"
              className="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Go to Settings
            </a>
          )}
        </div>
      </div>
    )
  }

  const { video, analytics, trafficSources, subtitleCount, currentStats } = data

  // Prepare traffic sources for pie chart
  const trafficChartData = trafficSources.map((source, idx) => ({
    name: source.source,
    value: source.views,
    color: COLORS[idx % COLORS.length]
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
   <YouTubeAuthStatus />
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.back()}
            className="mt-1 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Video Analytics</h1>
            <p className="text-gray-600 mt-1">{video.title}</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Video Preview */}
      {video.thumbnailUrl && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex gap-4">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-60 h-36 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h2 className="font-semibold text-lg mb-2">{video.title}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>Video ID: {video.videoId}</span>
                <span>•</span>
                <span>Published: {new Date(video.publishedAt).toLocaleDateString()}</span>
              </div>
              <a
                href={`https://youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Play size={16} />
                Watch on YouTube
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Current Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Views"
          value={formatNumber(currentStats.views)}
          icon={Eye}
          color="blue"
        />
        <StatCard
          label="Likes"
          value={formatNumber(currentStats.likes)}
          icon={ThumbsUp}
          color="green"
        />
        <StatCard
          label="Comments"
          value={formatNumber(currentStats.comments)}
          icon={MessageCircle}
          color="purple"
        />
        <StatCard
          label="Subtitles"
          value={`${subtitleCount} languages`}
          icon={Languages}
          color="orange"
        />
      </div>

      {/* Analytics Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <MetricRow
              label="Watch Time"
              value={`${formatNumber(analytics.estimatedMinutesWatched)} minutes`}
              icon={Clock}
            />
            <MetricRow
              label="Avg View Duration"
              value={`${Math.round(analytics.averageViewDuration)} seconds`}
              icon={Clock}
            />
            <MetricRow
              label="Avg View Percentage"
              value={`${Math.round(analytics.averageViewPercentage)}%`}
              icon={TrendingUp}
            />
            <MetricRow
              label="Subscribers Gained"
              value={formatNumber(analytics.subscribersGained)}
              icon={Users}
            />
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
          {trafficSources.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {trafficChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12">No traffic data available</p>
          )}
        </div>
      </div>

      {/* Traffic Sources Table */}
      {trafficSources.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Traffic Breakdown</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Source</th>
                <th className="text-right p-3">Views</th>
                <th className="text-right p-3">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {trafficSources.map((source, idx) => {
                const totalViews = trafficSources.reduce((sum, s) => sum + s.views, 0)
                const percentage = ((source.views / totalViews) * 100).toFixed(1)
                return (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{source.source}</td>
                    <td className="p-3 text-right">{formatNumber(source.views)}</td>
                    <td className="p-3 text-right">{percentage}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Data Timestamp */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date(data.fetchedAt).toLocaleString()}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
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

function MetricRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-gray-400" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-lg font-bold">{value}</span>
    </div>
  )
}