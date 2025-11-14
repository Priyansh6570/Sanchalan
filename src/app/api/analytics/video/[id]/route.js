// src/app/api/analytics/video/[id]/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Video from '@/models/Video'
import { getValidAccessToken } from '@/lib/youtube/oauth'
import { getVideoAnalytics, getTrafficSources } from '@/lib/youtube/analytics'
import { fetchVideoDetails, fetchVideoCaptions } from '@/lib/youtube/api'

export async function GET(request, { params }) {
  try {
    await connectDB()
    const { id } = await params
    
    const video = await Video.findById(id)
    if (!video) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      )
    }

    // Get access token (this will throw if auth is missing/expired)
    let accessToken
    try {
      accessToken = await getValidAccessToken()
    } catch (authError) {
      console.error('Authentication error:', authError.message)
      return NextResponse.json(
        { 
          success: false, 
          error: authError.message,
          needsAuth: true,
          reconnectUrl: '/api/auth/youtube'
        },
        { status: 401 }
      )
    }

    // Fetch all data in parallel
    const [analyticsData, trafficData, videoDetails, captionsData] = await Promise.allSettled([
      getVideoAnalytics(video.videoId, accessToken),
      getTrafficSources(video.videoId, accessToken),
      fetchVideoDetails(video.videoId),
      fetchVideoCaptions(video.videoId)
    ])

    // Handle analytics data
    const metrics = {}
    if (analyticsData.status === 'fulfilled' && analyticsData.value.rows?.length > 0) {
      const row = analyticsData.value.rows[0]
      const headers = analyticsData.value.columnHeaders.map(h => h.name)
      
      headers.forEach((header, index) => {
        metrics[header] = row[index]
      })
    }

    // Handle traffic sources
    const trafficSources = []
    if (trafficData.status === 'fulfilled' && trafficData.value.rows) {
      trafficData.value.rows.forEach(row => {
        trafficSources.push({
          source: row[0],
          views: row[1],
        })
      })
    }

    // Handle video details
    let currentStats = {
      views: video.viewCount,
      likes: video.likeCount,
      comments: video.commentCount,
    }
    if (videoDetails.status === 'fulfilled') {
      currentStats = {
        views: videoDetails.value.viewCount,
        likes: videoDetails.value.likeCount,
        comments: videoDetails.value.commentCount,
      }
    }

    // Handle captions/subtitles
    let subtitleInfo = {
      count: video.subtitleCount || 0,
      languages: video.subtitles?.languages || []
    }
    
    if (captionsData.status === 'fulfilled') {
      subtitleInfo = captionsData.value
      
      // Update video subtitle info in database
      video.subtitleCount = captionsData.value.count
      video.subtitles = captionsData.value
      await video.save()
    }

    return NextResponse.json({
      success: true,
      video: {
        id: video._id,
        videoId: video.videoId,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        publishedAt: video.publishedAt,
      },
      analytics: {
        views: metrics.views || currentStats.views,
        estimatedMinutesWatched: metrics.estimatedMinutesWatched || 0,
        averageViewDuration: metrics.averageViewDuration || 0,
        averageViewPercentage: metrics.averageViewPercentage || 0,
        subscribersGained: metrics.subscribersGained || 0,
      },
      trafficSources,
      subtitles: subtitleInfo,
      currentStats,
      fetchedAt: new Date(),
      warnings: {
        analyticsUnavailable: analyticsData.status === 'rejected',
        trafficUnavailable: trafficData.status === 'rejected',
        videoDetailsUnavailable: videoDetails.status === 'rejected',
        captionsUnavailable: captionsData.status === 'rejected',
      }
    })
  } catch (error) {
    console.error('Error fetching video analytics:', error)
    
    // Check if it's an authentication error
    const isAuthError = error.message.includes('authentication') || 
                        error.message.includes('expired') ||
                        error.message.includes('invalid')
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        needsAuth: isAuthError,
        reconnectUrl: isAuthError ? '/api/auth/youtube' : null
      },
      { status: isAuthError ? 401 : 500 }
    )
  }
}