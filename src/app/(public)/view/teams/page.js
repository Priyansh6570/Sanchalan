'use client'
import { useState, useEffect } from 'react'
import { 
  Users, TrendingUp, Video, Calendar, CheckCircle, 
  Clock, AlertCircle, RefreshCw, Award, Eye, ThumbsUp,
  MessageCircle, ChevronDown, ChevronUp, Sparkles,
  Target, TrendingDown, BarChart3
} from 'lucide-react'

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ModernTeamsPage() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedTeam, setExpandedTeam] = useState(null)

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/teams/performance')
      const data = await response.json()
      console.log('Fetched teams:', data)
      if (data.success) {
        setTeams(data.teams || [])
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

  // Calculate overall stats
  const overallStats = {
    totalTeams: teams.length,
    activeTeams: teams.filter(t => t.stats.totalVideos > 0).length,
    totalVideos: teams.reduce((sum, t) => sum + t.stats.totalVideos, 0),
    totalViews: teams.reduce((sum, t) => sum + t.stats.totalViews, 0),
    thisMonth: teams.reduce((sum, t) => sum + t.stats.thisMonthVideos, 0),
    avgOnTime: teams.length > 0 
      ? Math.round(teams.reduce((sum, t) => sum + t.stats.onTimePercentage, 0) / teams.length)
      : 0
  }

  // Get top performer
  const topPerformer = teams.length > 0 
    ? [...teams].sort((a, b) => b.stats.totalViews - a.stats.totalViews)[0]
    : null

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading teams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Users size={24} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-700 bg-clip-text text-transparent">
                Team Performance
              </h1>
            </div>
            <p className="text-gray-600 ml-15">Real-time insights across all content production teams</p>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-200 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-gray-600">Live</span>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard 
            label="Total Teams" 
            value={overallStats.totalTeams}
            subValue={`${overallStats.activeTeams} active`}
            icon={Users}
            gradient="from-blue-500 to-blue-600"
            delay={0}
          />
          <StatCard 
            label="Total Videos" 
            value={overallStats.totalVideos}
            icon={Video}
            gradient="from-purple-500 to-purple-600"
            delay={0.1}
          />
          <StatCard 
            label="Total Views" 
            value={formatNumber(overallStats.totalViews)}
            icon={Eye}
            gradient="from-pink-500 to-pink-600"
            delay={0.2}
          />
          <StatCard 
            label="This Month" 
            value={overallStats.thisMonth}
            subValue="videos"
            icon={Calendar}
            gradient="from-orange-500 to-orange-600"
            delay={0.3}
          />
          <StatCard 
            label="Avg On-Time" 
            value={`${overallStats.avgOnTime}%`}
            icon={Target}
            gradient="from-green-500 to-green-600"
            delay={0.4}
          />
          <StatCard 
            label="Performance" 
            value={overallStats.totalViews > 1000 ? "Excellent" : "Growing"}
            icon={TrendingUp}
            gradient="from-indigo-500 to-indigo-600"
            delay={0.5}
          />
        </div>

        {/* Top Performer Spotlight */}
        {topPerformer && topPerformer.stats.totalVideos > 0 && (
          <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.01] transition-transform duration-300">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
            
            <div className="relative p-8">
              <div className="flex items-start justify-between flex-wrap gap-6">
                {/* Left: Team Info */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-xl">
                    <Award size={32} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={20} className="text-yellow-200" />
                      <p className="text-sm font-semibold text-white/90 uppercase tracking-wider">
                        Top Performing Team
                      </p>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">{topPerformer.name}</h2>
                    <div className="flex items-center gap-2 text-white/90">
                      <Users size={16} />
                      <span className="text-sm">Led by {topPerformer.lead}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 min-w-[300px]">
                  <TopStatItem 
                    label="Videos" 
                    value={topPerformer.stats.totalVideos}
                    icon={Video}
                  />
                  <TopStatItem 
                    label="Views" 
                    value={formatNumber(topPerformer.stats.totalViews)}
                    icon={Eye}
                  />
                  <TopStatItem 
                    label="Avg Views" 
                    value={formatNumber(topPerformer.stats.avgViews)}
                    icon={TrendingUp}
                  />
                  <TopStatItem 
                    label="On-Time" 
                    value={`${topPerformer.stats.onTimePercentage}%`}
                    icon={CheckCircle}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Teams Grid */}
        <div className="space-y-4">
          {teams.map((team, idx) => (
            <TeamCard
              key={team._id}
              team={team}
              rank={idx + 1}
              expanded={expandedTeam === team._id}
              onToggle={() => setExpandedTeam(expandedTeam === team._id ? null : team._id)}
              index={idx}
            />
          ))}
        </div>

        {teams.length === 0 && (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-16 text-center">
            <Users size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 font-medium mb-2">No teams found</p>
            <p className="text-gray-500 text-sm">Teams will appear here once added</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, subValue, icon: Icon, gradient, delay }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div 
      className={`relative rounded-2xl p-5 shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-105 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <Icon size={22} className="text-white/80" />
          <div className="w-2 h-2 rounded-full bg-white/50 animate-pulse" />
        </div>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        {subValue && <p className="text-xs text-white/70 font-medium">{subValue}</p>}
        <p className="text-sm text-white/80 font-medium mt-1">{label}</p>
      </div>
    </div>
  )
}

function TopStatItem({ label, value, icon: Icon }) {
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
      <Icon size={18} className="text-white/80 mb-2" />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/80 font-medium mt-1">{label}</p>
    </div>
  )
}

function TeamCard({ team, rank, expanded, onToggle, index }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100)
    return () => clearTimeout(timer)
  }, [index])

  const getRankConfig = (rank) => {
    if (rank === 1) return { 
      bg: 'from-yellow-400 to-yellow-500', 
      border: 'border-yellow-300',
      text: 'text-yellow-900',
      shadow: 'shadow-yellow-200'
    }
    if (rank === 2) return { 
      bg: 'from-gray-300 to-gray-400', 
      border: 'border-gray-300',
      text: 'text-gray-800',
      shadow: 'shadow-gray-200'
    }
    if (rank === 3) return { 
      bg: 'from-orange-400 to-orange-500', 
      border: 'border-orange-300',
      text: 'text-orange-900',
      shadow: 'shadow-orange-200'
    }
    return { 
      bg: 'from-indigo-400 to-indigo-500', 
      border: 'border-indigo-300',
      text: 'text-indigo-900',
      shadow: 'shadow-indigo-200'
    }
  }

  const rankConfig = getRankConfig(rank)
  const hasVideos = team.stats.totalVideos > 0

  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transform transition-all duration-500 hover:shadow-xl ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${expanded ? 'ring-2 ring-indigo-500' : ''}`}
    >
      {/* Header */}
      <div
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start gap-6">
          {/* Rank Badge */}
          <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${rankConfig.bg} flex items-center justify-center border-2 ${rankConfig.border} shadow-lg ${rankConfig.shadow}`}>
            <span className={`text-xl font-bold ${rankConfig.text}`}>#{rank}</span>
            {rank <= 3 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
                <Award size={12} className={rankConfig.text} />
              </div>
            )}
          </div>

          {/* Team Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{team.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={14} />
                  <span>Lead: <strong className="text-gray-900">{team.lead}</strong></span>
                </div>
              </div>
              
              {/* Main Stat */}
              <div className="text-right">
                <div className="flex items-center gap-2 text-2xl font-bold text-indigo-600">
                  <Eye size={24} />
                  {formatNumber(team.stats.totalViews)}
                </div>
                <p className="text-xs text-gray-500 mt-1">total views</p>
              </div>
            </div>

            {/* Members */}
            {team.members.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {team.members.map((member, idx) => (
                  <span
                    key={idx}
                    className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full font-medium border border-indigo-100"
                  >
                    {member}
                  </span>
                ))}
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              <QuickStat 
                icon={Video} 
                label="Videos" 
                value={team.stats.totalVideos}
                color="text-blue-600"
                bg="bg-blue-50"
              />
              <QuickStat 
                icon={CheckCircle} 
                label="Uploaded" 
                value={team.stats.uploadedVideos}
                color="text-green-600"
                bg="bg-green-50"
              />
              <QuickStat 
                icon={Clock} 
                label="Scheduled" 
                value={team.stats.scheduledVideos}
                color="text-yellow-600"
                bg="bg-yellow-50"
              />
              <QuickStat 
                icon={AlertCircle} 
                label="Delayed" 
                value={team.stats.delayedVideos}
                color="text-red-600"
                bg="bg-red-50"
              />
              <QuickStat 
                icon={TrendingUp} 
                label="Avg Views" 
                value={formatNumber(team.stats.avgViews)}
                color="text-purple-600"
                bg="bg-purple-50"
              />
              <QuickStat 
                icon={Target} 
                label="On-Time" 
                value={`${team.stats.onTimePercentage}%`}
                color="text-green-600"
                bg="bg-green-50"
              />
            </div>

            {/* Expand Button */}
            <button 
              className="mt-4 w-full py-2 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-gray-700 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp size={16} />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  View Details
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t bg-gradient-to-br from-gray-50 to-white p-6 space-y-6">
          {/* Series Section */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-600" />
              Assigned Series
            </h4>
            {team.series.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-3">
                {team.series.map((series, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{series.name}</p>
                        <p className="text-sm text-gray-600 mt-1">Channel: {series.channel}</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Video size={16} className="text-indigo-600" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-300">
                <Video size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No series assigned yet</p>
              </div>
            )}
          </div>

          {/* Recent Videos */}
          {hasVideos && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Video size={18} className="text-indigo-600" />
                Recent Videos
              </h4>
              {team.recentVideos.length > 0 ? (
                <div className="space-y-3">
                  {team.recentVideos.map((video, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 mb-2 line-clamp-2">{video.title}</p>
                          <p className="text-sm text-gray-600">{formatDate(video.publishedAt)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm bg-gray-50 px-3 py-1.5 rounded-lg">
                            <Eye size={14} className="text-gray-400" />
                            <span className="font-semibold text-gray-900">{formatNumber(video.views)}</span>
                          </div>
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                            video.status === 'uploaded' ? 'bg-green-100 text-green-800' :
                            video.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {video.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-300">
                  <Video size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">No recent videos</p>
                </div>
              )}
            </div>
          )}

          {/* Additional Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <DetailStatCard 
              icon={Calendar}
              label="This Month"
              value={team.stats.thisMonthVideos}
              subtext="videos uploaded"
              gradient="from-orange-500 to-orange-600"
            />
            <DetailStatCard 
              icon={ThumbsUp}
              label="Total Likes"
              value={formatNumber(team.stats.totalLikes)}
              subtext="across videos"
              gradient="from-pink-500 to-pink-600"
            />
            <DetailStatCard 
              icon={MessageCircle}
              label="Comments"
              value={formatNumber(team.stats.totalComments)}
              subtext="total engagement"
              gradient="from-blue-500 to-blue-600"
            />
            <DetailStatCard 
              icon={BarChart3}
              label="Subtitles"
              value={`${team.stats.avgSubtitles}/100`}
              subtext="languages avg"
              gradient="from-purple-500 to-purple-600"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function QuickStat({ icon: Icon, label, value, color, bg }) {
  return (
    <div className={`${bg} rounded-xl p-3 text-center hover:scale-105 transition-transform`}>
      <Icon size={16} className={`${color} mx-auto mb-1`} />
      <p className={`text-base font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-600 mt-0.5">{label}</p>
    </div>
  )
}

function DetailStatCard({ icon: Icon, label, value, subtext, gradient }) {
  return (
    <div className="relative rounded-xl p-5 overflow-hidden shadow-md hover:shadow-lg transition-all">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
      
      <div className="relative">
        <Icon size={20} className="text-white/80 mb-2" />
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        <p className="text-xs text-white/90 font-medium">{label}</p>
        <p className="text-xs text-white/70 mt-1">{subtext}</p>
      </div>
    </div>
  )
}