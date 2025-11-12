// src/app/api/dashboard/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Video from '@/models/Video'
import Channel from '@/models/Channel'
import Team from '@/models/Team'
import Series from '@/models/Series'

export async function GET() {
  try {
    await connectDB()

    // Get counts
    const totalVideos = await Video.countDocuments()
    const totalChannels = await Channel.countDocuments()
    const totalTeams = await Team.countDocuments()
    const totalSeries = await Series.countDocuments()

    // Get status counts
    const uploadedCount = await Video.countDocuments({ status: 'uploaded' })
    const scheduledCount = await Video.countDocuments({ status: 'scheduled' })
    const delayedCount = await Video.countDocuments({ status: 'delayed' })

    // Get this month's videos
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthVideos = await Video.countDocuments({
      createdAt: { $gte: startOfMonth }
    })

    // Calculate total views
    const viewsResult = await Video.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$viewCount' },
          totalLikes: { $sum: '$likeCount' },
          totalComments: { $sum: '$commentCount' }
        }
      }
    ])

    const stats = viewsResult[0] || { totalViews: 0, totalLikes: 0, totalComments: 0 }

    // Get recent videos
    const recentVideos = await Video.find()
      .populate('channel', 'name')
      .populate({
        path: 'series',
        select: 'name',
        populate: {
          path: 'team',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .limit(10)

    // Get videos with low subtitles (needs attention)
    const needsSubtitles = await Video.countDocuments({ 
      subtitleCount: { $lt: 50 },
      status: 'uploaded'
    })

    // Get videos with pending ads
    const pendingAds = await Video.countDocuments({ 
      adStatus: { $in: ['pending', 'not-set'] },
      status: 'uploaded'
    })

    // Get team performance
    const teams = await Team.find()
    const teamPerformance = await Promise.all(
      teams.map(async (team) => {
        const teamSeries = await Series.find({ team: team._id })
        const seriesIds = teamSeries.map(s => s._id)
        
        const videoCount = await Video.countDocuments({ 
          series: { $in: seriesIds } 
        })
        
        const viewsData = await Video.aggregate([
          { $match: { series: { $in: seriesIds } } },
          { $group: { _id: null, total: { $sum: '$viewCount' } } }
        ])
        
        return {
          team: team.name,
          videos: videoCount,
          views: viewsData[0]?.total || 0
        }
      })
    )

    // Get weekly view trend (last 7 days)
    const weeklyTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const startOfDay = new Date(date.setHours(0, 0, 0, 0))
      const endOfDay = new Date(date.setHours(23, 59, 59, 999))
      
      const dayVideos = await Video.find({
        publishedAt: { $gte: startOfDay, $lte: endOfDay }
      })
      
      const dayViews = dayVideos.reduce((sum, v) => sum + (v.viewCount || 0), 0)
      
      weeklyTrend.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        views: dayViews,
        videos: dayVideos.length
      })
    }

    return NextResponse.json({
      success: true,
      overview: {
        totalVideos,
        totalChannels,
        totalTeams,
        totalSeries,
        thisMonthVideos,
        uploadedCount,
        scheduledCount,
        delayedCount,
        totalViews: stats.totalViews,
        totalLikes: stats.totalLikes,
        totalComments: stats.totalComments,
        needsSubtitles,
        pendingAds,
      },
      recentVideos,
      teamPerformance,
      weeklyTrend,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}