// src/app/api/teams/performance/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Team from '@/models/Team'
import Series from '@/models/Series'
import Video from '@/models/Video'

export async function GET() {
  try {
    await connectDB()

    const teams = await Team.find()
    
    const teamPerformance = await Promise.all(
      teams.map(async (team) => {
        // Get all series for this team
        const teamSeries = await Series.find({ team: team._id })
          .populate('channel', 'name')
        const seriesIds = teamSeries.map(s => s._id)
        
        // Get all videos for team's series
        const videos = await Video.find({ series: { $in: seriesIds } })
        
        // Calculate stats
        const totalVideos = videos.length
        const uploadedVideos = videos.filter(v => v.status === 'uploaded').length
        const scheduledVideos = videos.filter(v => v.status === 'scheduled').length
        const delayedVideos = videos.filter(v => v.status === 'delayed').length
        
        const totalViews = videos.reduce((sum, v) => sum + (v.viewCount || 0), 0)
        const totalLikes = videos.reduce((sum, v) => sum + (v.likeCount || 0), 0)
        const totalComments = videos.reduce((sum, v) => sum + (v.commentCount || 0), 0)
        
        const avgViews = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0
        const avgSubtitles = totalVideos > 0 
          ? Math.round(videos.reduce((sum, v) => sum + (v.subtitleCount || 0), 0) / totalVideos)
          : 0
        
        // Get this month's videos
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const thisMonthVideos = videos.filter(v => 
          new Date(v.createdAt) >= startOfMonth
        ).length
        
        // Calculate on-time percentage
        const completedVideos = videos.filter(v => v.status === 'uploaded')
        const onTimeVideos = completedVideos.filter(v => {
          if (!v.expectedUploadDate) return true
          return new Date(v.publishedAt) <= new Date(v.expectedUploadDate)
        })
        const onTimePercentage = completedVideos.length > 0 
          ? Math.round((onTimeVideos.length / completedVideos.length) * 100)
          : 100
        
        // Get recent videos
        const recentVideos = videos
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(v => ({
            title: v.title,
            views: v.viewCount,
            status: v.status,
            publishedAt: v.publishedAt
          }))
        
        return {
          _id: team._id,
          name: team.name,
          lead: team.lead,
          members: team.members,
          series: teamSeries.map(s => ({
            name: s.name,
            channel: s.channel?.name
          })),
          stats: {
            totalVideos,
            uploadedVideos,
            scheduledVideos,
            delayedVideos,
            thisMonthVideos,
            totalViews,
            totalLikes,
            totalComments,
            avgViews,
            avgSubtitles,
            onTimePercentage
          },
          recentVideos
        }
      })
    )
    
    // Sort by total views (descending)
    teamPerformance.sort((a, b) => b.stats.totalViews - a.stats.totalViews)

    return NextResponse.json({
      success: true,
      teams: teamPerformance,
      timestamp: new Date()
    })
  } catch (error) {
    console.error('Error fetching team performance:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}