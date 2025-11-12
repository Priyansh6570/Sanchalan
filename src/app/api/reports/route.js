// src/app/api/reports/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Video from '@/models/Video'
import Team from '@/models/Team'
import Series from '@/models/Series'
import Channel from '@/models/Channel'

export async function POST(request) {
  try {
    await connectDB()
    const body = await request.json()
    const { startDate, endDate } = body

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const end = endDate ? new Date(endDate) : new Date()

    // Get videos in date range
    const videos = await Video.find({
      createdAt: { $gte: start, $lte: end }
    })
      .populate('channel', 'name title')
      .populate({
        path: 'series',
        select: 'name',
        populate: {
          path: 'team',
          select: 'name lead'
        }
      })
      .sort({ createdAt: -1 })

    // Calculate overall stats
    const totalVideos = videos.length
    const totalViews = videos.reduce((sum, v) => sum + (v.viewCount || 0), 0)
    const totalLikes = videos.reduce((sum, v) => sum + (v.likeCount || 0), 0)
    const totalComments = videos.reduce((sum, v) => sum + (v.commentCount || 0), 0)
    const avgViews = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0

    // Status breakdown
    const uploadedCount = videos.filter(v => v.status === 'uploaded').length
    const scheduledCount = videos.filter(v => v.status === 'scheduled').length
    const delayedCount = videos.filter(v => v.status === 'delayed').length

    // Top 10 videos by views
    const topVideos = [...videos]
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 10)
      .map(v => ({
        title: v.title,
        views: v.viewCount,
        likes: v.likeCount,
        comments: v.commentCount,
        publishedAt: v.publishedAt,
        series: v.series?.name,
        team: v.series?.team?.name,
        subtitles: v.subtitleCount,
        adStatus: v.adStatus
      }))

    // Team performance
    const teams = await Team.find()
    const teamData = await Promise.all(
      teams.map(async (team) => {
        const teamSeries = await Series.find({ team: team._id })
        const seriesIds = teamSeries.map(s => s._id)
        
        const teamVideos = videos.filter(v => 
          seriesIds.some(id => id.equals(v.series?._id))
        )
        
        return {
          name: team.name,
          lead: team.lead,
          totalVideos: teamVideos.length,
          totalViews: teamVideos.reduce((sum, v) => sum + (v.viewCount || 0), 0),
          avgViews: teamVideos.length > 0 
            ? Math.round(teamVideos.reduce((sum, v) => sum + (v.viewCount || 0), 0) / teamVideos.length)
            : 0,
          uploadedCount: teamVideos.filter(v => v.status === 'uploaded').length,
          delayedCount: teamVideos.filter(v => v.status === 'delayed').length
        }
      })
    )

    // Series breakdown
    const allSeries = await Series.find().populate('channel team')
    const seriesData = await Promise.all(
      allSeries.map(async (series) => {
        const seriesVideos = videos.filter(v => v.series?._id.equals(series._id))
        return {
          name: series.name,
          channel: series.channel?.name,
          team: series.team?.name,
          videoCount: seriesVideos.length,
          totalViews: seriesVideos.reduce((sum, v) => sum + (v.viewCount || 0), 0),
          episodeSchedule: series.episodeUploadDay && series.episodeUploadTime 
            ? `${series.episodeUploadDay} ${series.episodeUploadTime}`
            : 'Not set'
        }
      })
    ).then(data => data.filter(s => s.videoCount > 0))

    // Subtitle progress
    const subtitleProgress = {
      complete: videos.filter(v => v.subtitleCount >= 100).length,
      partial: videos.filter(v => v.subtitleCount > 0 && v.subtitleCount < 100).length,
      none: videos.filter(v => v.subtitleCount === 0).length,
      avgSubtitles: totalVideos > 0 
        ? Math.round(videos.reduce((sum, v) => sum + (v.subtitleCount || 0), 0) / totalVideos)
        : 0
    }

    // Ad status breakdown
    const adStats = {
      running: videos.filter(v => v.adStatus === 'running').length,
      stopped: videos.filter(v => v.adStatus === 'stopped').length,
      pending: videos.filter(v => v.adStatus === 'pending').length,
      notSet: videos.filter(v => v.adStatus === 'not-set').length
    }

    // Daily upload pattern
    const uploadsByDay = {}
    videos.forEach(v => {
      const date = new Date(v.publishedAt || v.createdAt).toLocaleDateString()
      uploadsByDay[date] = (uploadsByDay[date] || 0) + 1
    })

    const channels = await Channel.find()

    return NextResponse.json({
      success: true,
      report: {
        period: {
          startDate: start,
          endDate: end
        },
        overview: {
          totalVideos,
          totalViews,
          totalLikes,
          totalComments,
          avgViews,
          uploadedCount,
          scheduledCount,
          delayedCount
        },
        topVideos,
        teamPerformance: teamData.sort((a, b) => b.totalViews - a.totalViews),
        seriesBreakdown: seriesData.sort((a, b) => b.totalViews - a.totalViews),
        subtitleProgress,
        adStats,
        channels: channels.map(c => ({
          name: c.name,
          title: c.title,
          subscribers: c.subscriberCount,
          totalViews: c.viewCount
        })),
        generatedAt: new Date()
      }
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}