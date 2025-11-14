'use client'
// src/app/(public)/view/teams/page.js
import { useState, useEffect } from 'react'
import { 
  Users, TrendingUp, Video, Calendar, CheckCircle, 
  Clock, AlertCircle, RefreshCw, Award, Eye, ThumbsUp
} from 'lucide-react'
import { formatNumber, formatDate } from '@/lib/utils'

export default function PublicTeamsPage() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedTeam, setExpandedTeam] = useState(null)

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/teams/performance')
      const data = await response.json()
      if (data.success) {
        setTeams(data.teams)
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTeams, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw size={32} className="animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Performance</h1>
        <p className="text-gray-600 mt-1">Track performance across all content teams - Read-only view</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Teams"
          value={teams.length}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Total Videos"
          value={teams.reduce((sum, t) => sum + t.stats.totalVideos, 0)}
          icon={Video}
          color="green"
        />
        <StatCard
          label="Total Views"
          value={formatNumber(teams.reduce((sum, t) => sum + t.stats.totalViews, 0))}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          label="This Month"
          value={teams.reduce((sum, t) => sum + t.stats.thisMonthVideos, 0)}
          icon={Calendar}
          color="orange"
        />
      </div>

      {/* Top Performer */}
      {teams.length > 0 && teams[0].stats.totalVideos > 0 && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Award size={32} />
            <div>
              <p className="text-sm opacity-90">Top Performing Team</p>
              <h2 className="text-2xl font-bold">{teams[0].name}</h2>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
            <div>
              <p className="opacity-90">Total Videos</p>
              <p className="text-xl font-bold">{teams[0].stats.totalVideos}</p>
            </div>
            <div>
              <p className="opacity-90">Total Views</p>
              <p className="text-xl font-bold">{formatNumber(teams[0].stats.totalViews)}</p>
            </div>
            <div>
              <p className="opacity-90">Avg Views</p>
              <p className="text-xl font-bold">{formatNumber(teams[0].stats.avgViews)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Team Cards */}
      <div className="space-y-4">
        {teams.map((team, idx) => (
          <TeamCard
            key={team._id}
            team={team}
            rank={idx + 1}
            expanded={expandedTeam === team._id}
            onToggle={() => setExpandedTeam(expandedTeam === team._id ? null : team._id)}
          />
        ))}
      </div>

      {teams.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">No team data available</p>
        </div>
      )}
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

function TeamCard({ team, rank, expanded, onToggle }) {
  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300'
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300'
    return 'bg-blue-100 text-blue-800 border-blue-300'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            {/* Rank Badge */}
            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-lg ${getRankColor(rank)}`}>
              #{rank}
            </div>

            {/* Team Info */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Lead: <span className="font-medium">{team.lead}</span>
              </p>
              {team.members.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {team.members.map((member, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                    >
                      {member}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="text-right">
              <div className="flex items-center gap-2 text-2xl font-bold text-blue-600">
                <Eye size={24} />
                {formatNumber(team.stats.totalViews)}
              </div>
              <p className="text-xs text-gray-500 mt-1">total views</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
          <StatItem icon={Video} label="Videos" value={team.stats.totalVideos} color="blue" />
          <StatItem icon={CheckCircle} label="Uploaded" value={team.stats.uploadedVideos} color="green" />
          <StatItem icon={Clock} label="Scheduled" value={team.stats.scheduledVideos} color="yellow" />
          <StatItem icon={AlertCircle} label="Delayed" value={team.stats.delayedVideos} color="red" />
          <StatItem icon={TrendingUp} label="Avg Views" value={formatNumber(team.stats.avgViews)} color="purple" />
          <StatItem icon={CheckCircle} label="On-Time" value={`${team.stats.onTimePercentage}%`} color="green" />
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t bg-gray-50 p-6 space-y-6">
          {/* Series */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Assigned Series</h4>
            {team.series.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-3">
                {team.series.map((series, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border">
                    <p className="font-medium">{series.name}</p>
                    <p className="text-sm text-gray-600">Channel: {series.channel}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No series assigned</p>
            )}
          </div>

          {/* Recent Videos */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Recent Videos</h4>
            {team.recentVideos.length > 0 ? (
              <div className="space-y-2">
                {team.recentVideos.map((video, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{video.title}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(video.publishedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Eye size={14} className="text-gray-400" />
                        <span className="font-medium">{formatNumber(video.views)}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        video.status === 'uploaded' ? 'bg-green-100 text-green-800' :
                        video.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {video.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No videos yet</p>
            )}
          </div>

          {/* Additional Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Calendar size={16} />
                <span className="text-sm">This Month</span>
              </div>
              <p className="text-2xl font-bold">{team.stats.thisMonthVideos}</p>
              <p className="text-xs text-gray-500 mt-1">videos uploaded</p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <ThumbsUp size={16} />
                <span className="text-sm">Total Likes</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(team.stats.totalLikes)}</p>
              <p className="text-xs text-gray-500 mt-1">across all videos</p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Video size={16} />
                <span className="text-sm">Avg Subtitles</span>
              </div>
              <p className="text-2xl font-bold">{team.stats.avgSubtitles}/100</p>
              <p className="text-xs text-gray-500 mt-1">languages per video</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatItem({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
  }

  return (
    <div className="text-center">
      <Icon size={20} className={`mx-auto mb-1 ${colors[color]}`} />
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  )
}