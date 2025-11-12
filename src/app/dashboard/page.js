'use client'
// src/app/dashboard/page.js
import { useState, useEffect } from 'react'
import { 
  Video, Users, Calendar, TrendingUp, Eye, ThumbsUp,
  MessageCircle, AlertCircle, Play, RefreshCw
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatNumber, formatDate, getStatusColor } from '@/lib/utils'

export default function DashboardPage() {
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome to Veer Bharat CMS! 🎯
        </h1>
        <p className="text-blue-100 text-lg">
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
        <StatCard
          title="Total Videos"
          value={overview.totalVideos}
          icon={Video}
          color="blue"
        />
        <StatCard
          title="This Month"
          value={overview.thisMonthVideos}
          icon={Calendar}
          color="green"
        />
        <StatCard
          title="Uploaded"
          value={overview.uploadedCount}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Scheduled"
          value={overview.scheduledCount}
          icon={Calendar}
          color="yellow"
        />
        <StatCard
          title="Delayed"
          value={overview.delayedCount}
          icon={AlertCircle}
          color="red"
        />
        <StatCard
          title="Active Teams"
          value={overview.totalTeams}
          icon={Users}
          color="indigo"
        />
      </div>

      {/* Alerts */}
      {(overview.needsSubtitles > 0 || overview.pendingAds > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {overview.needsSubtitles > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-yellow-600" size={24} />
                <div>
                  <p className="font-semibold text-yellow-900">
                    {overview.needsSubtitles} videos need more subtitles
                  </p>
                  <p className="text-sm text-yellow-700">
                    Videos with less than 50 languages
                  </p>
                </div>
              </div>
            </div>
          )}
          {overview.pendingAds > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-orange-600" size={24} />
                <div>
                  <p className="font-semibold text-orange-900">
                    {overview.pendingAds} videos have pending ads
                  </p>
                  <p className="text-sm text-orange-700">
                    Check and update ad status
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Weekly View Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyTrend}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#3b82f6" radius={[8, 8, 0, 0]} />
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
                    <p className="font-bold text-blue-600">{formatNumber(team.views)}</p>
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

      {/* Setup Instructions */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">🚀 Getting Started</h2>
        <div className="space-y-4">
          <SetupStep
            number="1"
            title="Add YouTube Channel"
            description="Go to Admin → Channels and add 'Veer Bharat' channel"
            link="/admin/channels"
          />
          <SetupStep
            number="2"
            title="Create Teams"
            description="Set up your 5 teams with leads and members"
            link="/admin/teams"
          />
          <SetupStep
            number="3"
            title="Add Series"
            description="Create series and assign them to teams with upload schedules"
            link="/admin/series"
          />
          <SetupStep
            number="4"
            title="Start Adding Videos"
            description="Add videos and track their performance"
            link="/videos"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickAction
          title="View Calendar"
          description="Check upload schedule"
          link="/calendar"
          color="blue"
        />
        <QuickAction
          title="Manage Videos"
          description="Add and track videos"
          link="/videos"
          color="green"
        />
        <QuickAction
          title="Generate Report"
          description="Create monthly report"
          link="/reports"
          color="purple"
        />
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}

function SetupStep({ number, title, description, link }) {
  return (
    <a
      href={link}
      className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
    >
      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </a>
  )
}

function QuickAction({ title, description, link, color }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
  }

  return (
    <a
      href={link}
      className={`bg-gradient-to-br ${colors[color]} text-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow`}
    >
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-white/90 text-sm">{description}</p>
    </a>
  )
}