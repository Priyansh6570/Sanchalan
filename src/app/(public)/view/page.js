'use client'
import { useState, useEffect } from 'react'
import { 
  Video, Users, Calendar, TrendingUp, Eye, ThumbsUp,
  MessageCircle, RefreshCw, Play, Globe, Award, Clock
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const formatNumber = (n) => {
  if (!n) return '0'
  if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n/1000).toFixed(1)}K`
  return n.toString()
}

const formatDate = (s, short = false) => {
  if (!s) return 'N/A'
  const d = new Date(s)
  if (short) return d.toLocaleDateString('en-US',{month:'short',day:'numeric'})
  return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})
}

const getStatusColor = (s) => {
  const c = {
    uploaded:{bg:'bg-green-50',text:'text-green-600'},
    scheduled:{bg:'bg-yellow-50',text:'text-yellow-600'},
    delayed:{bg:'bg-red-50',text:'text-red-600'}
  }
  return c[s] || {bg:'bg-gray-50',text:'text-gray-600'}
}

export default function ModernDashboard() {
  const [data,setData]=useState(null)
  const [loading,setLoading]=useState(true)
  const [activeMetric,setActiveMetric]=useState('views')

  const fetchDashboard=async()=>{
    try{
      setLoading(true)
      const r=await fetch('/api/dashboard')
      const j=await r.json()
      if(j.success) setData(j)
    }catch(e){}
    finally{setLoading(false)}
  }

  useEffect(()=>{
    fetchDashboard()
    const i=setInterval(fetchDashboard,30000)
    return()=>clearInterval(i)
  },[])

  if(loading) return(
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-600 font-medium">Loading dashboard...</p>
      </div>
    </div>
  )

  if(!data) return(
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <p className="text-gray-600">Error loading dashboard</p>
    </div>
  )

  const {overview,recentVideos,teamPerformance,weeklyTrend}=data

  const engagementRate = overview.totalViews>0 
    ? (((overview.totalLikes+overview.totalComments)/overview.totalViews)*100).toFixed(2)
    : 0

  const avgViews = overview.totalVideos>0 
    ? Math.round(overview.totalViews/overview.totalVideos)
    : 0

  return(
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <style>{`
        .no-scroll::-webkit-scrollbar{display:none}
        .no-scroll{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      <div className="max-w-[1600px] mx-auto space-y-6">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Content Dashboard</h1>
            <p className="text-sm md:text-base text-gray-600 mt-2">Overview of content performance</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
              <span className="text-sm text-gray-600">Live</span>
            </div>
            <button onClick={fetchDashboard} className="p-2 bg-white rounded-xl shadow-sm border border-gray-200">
              <RefreshCw size={20} className="text-gray-600"/>
            </button>
          </div>
        </div>

        <div className="flex gap-4 no-scroll overflow-x-auto w-full md:grid md:grid-cols-3 md:gap-6">
          <HeroCard title="Total Views" value={formatNumber(overview.totalViews)} subtitle={`${avgViews} avg per video`} icon={Eye} gradient="from-blue-500 to-blue-600" delay={0}/>
          <HeroCard title="Engagement Rate" value={`${engagementRate}%`} subtitle={`${formatNumber(overview.totalLikes + overview.totalComments)} interactions`} icon={TrendingUp} gradient="from-purple-500 to-purple-600" delay={0.1}/>
          <HeroCard title="Total Videos" value={overview.totalVideos} subtitle={`${overview.thisMonthVideos} this month`} icon={Video} gradient="from-green-500 to-green-600" delay={0.2}/>
        </div>

        <div className="flex gap-3 no-scroll overflow-x-auto w-full md:grid md:grid-cols-4 lg:grid-cols-6">
          <QuickStat label="Uploaded" value={overview.uploadedCount} icon={TrendingUp} color="green" delay={0}/>
          <QuickStat label="Scheduled" value={overview.scheduledCount} icon={Calendar} color="yellow" delay={0.05}/>
          <QuickStat label="Delayed" value={overview.delayedCount} icon={Clock} color="red" delay={0.1}/>
          <QuickStat label="Active Teams" value={overview.totalTeams} icon={Users} color="indigo" delay={0.15}/>
          <QuickStat label="Series" value={overview.totalSeries} icon={Globe} color="purple" delay={0.2}/>
          <QuickStat label="Channels" value={overview.totalChannels} icon={Award} color="blue" delay={0.25}/>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Weekly Performance</h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1">Views last 7 days</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>setActiveMetric('views')} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm ${activeMetric==='views'?'bg-gray-900 text-white':'bg-gray-100 text-gray-600'}`}>Views</button>
                <button onClick={()=>setActiveMetric('videos')} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm ${activeMetric==='videos'?'bg-gray-900 text-white':'bg-gray-100 text-gray-600'}`}>Videos</button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200} className="md:!h-[280px]">
              <BarChart data={weeklyTrend}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:'#6B7280',fontSize:10}}/>
                <YAxis axisLine={false} tickLine={false} tick={{fill:'#6B7280',fontSize:10}}/>
                <Tooltip cursor={{fill:'rgba(0,0,0,0.05)'}} contentStyle={{background:'white',border:'none',borderRadius:'12px'}} />
                <Bar dataKey={activeMetric} radius={[8,8,0,0]}>
                  {weeklyTrend.map((e,i)=>(<Cell key={i} fill={e[activeMetric]>0?'#111827':'#E5E7EB'}/>))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Team Performance</h2>
              <p className="text-sm text-gray-500 mt-1">Content output by team</p>
            </div>

            {teamPerformance.length>0?(
              <div className="space-y-3 max-h-[280px] overflow-y-auto no-scroll pr-2">
                {teamPerformance.map((t,i)=>{
                  const tot=teamPerformance.reduce((s,x)=>s+x.videos,0)
                  const pct=tot>0?(t.videos/tot*100).toFixed(0):0
                  return(
                    <div key={i} className="group bg-gradient-to-r from-gray-50 to-transparent rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{t.team}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{t.videos} videos</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatNumber(t.views)}</p>
                          <p className="text-xs text-gray-500">views</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-gray-700 to-gray-900 rounded-full" style={{width:`${pct}%`}}/>
                      </div>
                    </div>
                  )
                })}
              </div>
            ):(
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Users size={48} className="mb-3"/>
                <p className="text-sm">No team data yet</p>
              </div>
            )}

          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-4 md:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Recent Videos</h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1">Latest uploads</p>
              </div>
              <span className="text-xs md:text-sm text-gray-500">
                Showing {Math.min(5,recentVideos.length)} of {overview.totalVideos}
              </span>
            </div>
          </div>

          {recentVideos.length>0?(
            <div className="divide-y divide-gray-100">
              {recentVideos.slice(0,5).map((v,i)=>(<VideoRow key={v._id} video={v} index={i}/>))}
            </div>
          ):(
            <div className="p-16 text-center">
              <Video size={64} className="mx-auto text-gray-300 mb-4"/>
              <p className="text-gray-500 font-medium">No videos yet</p>
            </div>
          )}

        </div>

        <div className="flex gap-4 overflow-x-auto no-scroll w-full md:grid md:grid-cols-3">
          <FooterStat icon={ThumbsUp} color="blue" value={overview.totalLikes} label="Total Likes"/>
          <FooterStat icon={MessageCircle} color="green" value={overview.totalComments} label="Total Comments"/>
          <FooterStat icon={Globe} color="purple" value={overview.needsSubtitles} label="Needs Subtitles"/>
        </div>

      </div>
    </div>
  )
}

function HeroCard({title,value,subtitle,icon:Icon,gradient,delay}) {
  const [v,setV]=useState(false)
  useEffect(()=>{const t=setTimeout(()=>setV(true),delay*1000);return()=>clearTimeout(t)},[delay])
  return(
    <div className={`relative min-w-[160px] md:min-w-0 h-[140px] md:h-auto rounded-xl p-4 md:p-8 shadow-lg overflow-hidden transform transition-all duration-700 ${v?'opacity-100 translate-y-0':'opacity-0 translate-y-8'}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}/>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0"/>
      <div className="relative">
        <Icon size={24} className="text-white/80 mb-3 md:mb-4"/>
        <p className="text-2xl md:text-5xl font-bold text-white mb-1 md:mb-2">{value}</p>
        <p className="text-sm md:text-xl text-white/90 font-medium mb-1">{title}</p>
        <p className="text-xs md:text-sm text-white/70">{subtitle}</p>
      </div>
    </div>
  )
}

function QuickStat({label,value,icon:Icon,color,delay}) {
  const [v,setV]=useState(false)
  useEffect(()=>{const t=setTimeout(()=>setV(true),delay*1000);return()=>clearTimeout(t)},[delay])

  const c={
    green:'from-green-50 to-green-100 text-green-600',
    yellow:'from-yellow-50 to-yellow-100 text-yellow-600',
    red:'from-red-50 to-red-100 text-red-600',
    indigo:'from-indigo-50 to-indigo-100 text-indigo-600',
    purple:'from-purple-50 to-purple-100 text-purple-600',
    blue:'from-blue-50 to-blue-100 text-blue-600'
  }

  return(
    <div className={`min-w-[130px] md:min-w-0 bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 md:p-4 hover:shadow-md transition ${v?'opacity-100 scale-100':'opacity-0 scale-95'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${c[color]}`}>
          <Icon size={16}/>
        </div>
      </div>
      <p className="text-lg md:text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs md:text-sm text-gray-500">{label}</p>
    </div>
  )
}

function FooterStat({icon:Icon,color,value,label}) {
  const bg={
    blue:'bg-blue-50 text-blue-600',
    green:'bg-green-50 text-green-600',
    purple:'bg-purple-50 text-purple-600'
  }[color]

  return(
    <div className="min-w-[180px] md:min-w-0 bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 flex items-center gap-3">
      <div className={`p-3 rounded-lg ${bg}`}>
        <Icon size={20}/>
      </div>
      <div>
        <p className="text-lg md:text-2xl font-bold text-gray-900">{formatNumber(value)}</p>
        <p className="text-xs md:text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

function VideoRow({video,index}) {
  const [v,setV]=useState(false)
  useEffect(()=>{const t=setTimeout(()=>setV(true),index*100);return()=>clearTimeout(t)},[index])
  const s=getStatusColor(video.status)

  return(
    <div className={`p-4 md:p-5 transition ${v?'opacity-100 translate-x-0':'opacity-0 -translate-x-4'}`}>
      <div className="flex flex-col sm:flex-row gap-5">
        <a href={`https://youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer" className="group relative flex-shrink-0">
          <div className="w-full sm:w-40 h-44 sm:h-24 rounded-xl overflow-hidden bg-gray-100">
            {video.thumbnailUrl?(
              <img src={video.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition"/>
            ):(
              <div className="w-full h-full flex items-center justify-center">
                <Video size={32} className="text-gray-300"/>
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/90 rounded-full flex items-center justify-center">
              <Play size={18} className="text-gray-900"/>
            </div>
          </div>
        </a>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-medium text-gray-900 text-sm md:text-base leading-snug line-clamp-2">{video.title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>{video.status}</span>
          </div>

          <div className="flex flex-wrap items-start gap-x-4 gap-y-2 text-xs md:text-sm text-gray-600 mb-3">
            <span className="font-medium text-gray-900">{video.series?.name}</span>
            <span className="text-gray-400">•</span>
            <span>{video.series?.team?.name}</span>
            <span className="text-gray-400">•</span>
            <span>{formatDate(video.publishedAt)}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm">
            <div className="flex items-center gap-1.5">
              <Eye size={14} className="text-gray-400"/>
              <span className="font-medium text-gray-900">{formatNumber(video.viewCount)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ThumbsUp size={14} className="text-gray-400"/>
              <span className="font-medium text-gray-900">{formatNumber(video.likeCount)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle size={14} className="text-gray-400"/>
              <span className="font-medium text-gray-900">{formatNumber(video.commentCount)}</span>
            </div>
            <div className="text-gray-500">
              <span className="text-gray-400">Subtitles:</span> {video.subtitleCount}/100
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
