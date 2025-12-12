// src/app/api/videos/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Video from '@/models/Video'
import Channel from '@/models/Channel'
import Series from '@/models/Series'
import Team from '@/models/Team'
import { extractVideoId, fetchVideoDetails } from '@/lib/youtube/api'
import { isYouTubeConnected } from '@/lib/youtube/oauth'

// GET all videos
export async function GET() {
  try {
    await connectDB()
    const videos = await Video.find()
      .populate('channel', 'name title')
      .populate({
        path: 'series',
        select: 'name',
        populate: {
          path: 'team',
          select: 'name lead'
        }
      })
      .sort({ publishedAt: -1 })
    
    return NextResponse.json({
      success: true,
      videos,
    })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Add new video (supports both published and scheduled videos)
export async function POST(request) {
  try {
    await connectDB()
    const body = await request.json()
    const { 
      videoUrl, 
      channel, 
      series,
      expectedUploadDate,
      adStatus,
      seoNotes,
    } = body

    if (!videoUrl || !channel || !series) {
      return NextResponse.json(
        { success: false, error: 'Video URL, Channel, and Series are required' },
        { status: 400 }
      )
    }

    // Extract video ID from URL
    const videoId = extractVideoId(videoUrl)
    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'Invalid YouTube URL. Please provide a valid YouTube video link.' },
        { status: 400 }
      )
    }

    // Check if video already exists
    const existingVideo = await Video.findOne({ videoId })
    if (existingVideo) {
      return NextResponse.json(
        { success: false, error: 'This video has already been added to the system' },
        { status: 400 }
      )
    }

    // Check if YouTube OAuth is connected
    const isOAuthConnected = await isYouTubeConnected()
    
    // Try to fetch video details
    let youtubeData
    let videoIsScheduled = false
    let fetchMethod = 'API Key'
    
    try {
      console.log('📡 Attempting to fetch video with API key...')
      youtubeData = await fetchVideoDetails(videoId, { useOAuth: false })
      videoIsScheduled = youtubeData.isScheduled
      fetchMethod = 'API Key'
    } catch (firstError) {
      console.log('⚠️ API key fetch failed:', firstError.message)
      
      // If first attempt fails and OAuth is available, try with OAuth
      if (isOAuthConnected) {
        try {
          console.log('🔐 Attempting to fetch video with OAuth...')
          youtubeData = await fetchVideoDetails(videoId, { useOAuth: true })
          videoIsScheduled = youtubeData.isScheduled || youtubeData.privacyStatus === 'private'
          fetchMethod = 'OAuth'
          console.log('✅ Successfully fetched video with OAuth')
        } catch (secondError) {
          console.error('❌ OAuth fetch also failed:', secondError.message)
          
          return NextResponse.json(
            { 
              success: false, 
              error: secondError.message,
              needsAuth: !isOAuthConnected,
              suggestion: !isOAuthConnected 
                ? 'This video appears to be private or scheduled. Please connect your YouTube account to add private/scheduled videos.'
                : 'Unable to access this video. Please verify the video URL and ensure you have permission to access it.'
            },
            { status: 400 }
          )
        }
      } else {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Unable to fetch video details. This video may be private or scheduled.',
            needsAuth: true,
            suggestion: 'Please connect your YouTube account to add private or scheduled videos. Go to Settings → Connect YouTube.'
          },
          { status: 400 }
        )
      }
    }

    console.log(`✅ Video fetched using: ${fetchMethod}`)
    console.log(`📊 Privacy: ${youtubeData.privacyStatus}, Scheduled: ${videoIsScheduled}`)
    console.log(`📝 Subtitles: ${youtubeData.subtitleCount || 0}`)

    // Determine video status based on various factors
    const now = new Date()
    const publishDate = youtubeData.scheduledPublishTime 
      ? new Date(youtubeData.scheduledPublishTime) 
      : new Date(youtubeData.publishedAt)
    
    let status = 'uploaded'
    
    // Check if video is scheduled for future
    if (videoIsScheduled || youtubeData.scheduledPublishTime) {
      status = 'scheduled'
    } else if (publishDate > now) {
      status = 'scheduled'
    } else if (expectedUploadDate) {
      const expected = new Date(expectedUploadDate)
      if (publishDate > expected) {
        status = 'delayed'
      }
    }

    // Prepare publish date field
    const actualPublishDate = youtubeData.scheduledPublishTime 
      ? new Date(youtubeData.scheduledPublishTime)
      : youtubeData.privacyStatus === 'private' && expectedUploadDate
        ? new Date(expectedUploadDate)
        : new Date(youtubeData.publishedAt)

    // Create video with auto-fetched data
    const video = await Video.create({
      videoId,
      title: youtubeData.title,
      description: youtubeData.description,
      thumbnailUrl: youtubeData.thumbnailUrl,
      duration: youtubeData.duration,
      publishedAt: actualPublishDate,
      channel,
      series,
      viewCount: youtubeData.viewCount || 0,
      likeCount: youtubeData.likeCount || 0,
      commentCount: youtubeData.commentCount || 0,
      
      // Auto-fetched subtitle data - FIXED: Store in both places
      subtitleCount: youtubeData.subtitleCount || 0,
      subtitles: {
        count: youtubeData.subtitleCount || 0,
        languages: youtubeData.subtitles?.languages || [],
        lastSynced: new Date()
      },
      
      // Store privacy status
      privacyStatus: youtubeData.privacyStatus || 'public',
      uploadStatus: youtubeData.uploadStatus || 'processed',
      
      // User-provided data
      adStatus: adStatus || 'not-set',
      seoNotes: seoNotes || '',
      expectedUploadDate: expectedUploadDate || null,
      status,
      lastSyncedAt: new Date(),
    })

    // Populate the references
    await video.populate('channel', 'name title')
    await video.populate({
      path: 'series',
      select: 'name',
      populate: {
        path: 'team',
        select: 'name lead'
      }
    })

    // Create success message based on video status
    let successMessage = `Video added successfully`
    
    if (youtubeData.subtitleCount > 0) {
      successMessage += ` with ${youtubeData.subtitleCount} subtitle(s)`
    }
    
    if (status === 'scheduled') {
      if (youtubeData.scheduledPublishTime) {
        successMessage += `. Scheduled to publish on ${new Date(youtubeData.scheduledPublishTime).toLocaleString()}`
      } else {
        successMessage += `. This video is marked as scheduled`
      }
    }

    return NextResponse.json({
      success: true,
      video,
      message: successMessage,
      isScheduled: videoIsScheduled,
      scheduledPublishTime: youtubeData.scheduledPublishTime,
      fetchMethod,
      privacyStatus: youtubeData.privacyStatus,
    })
  } catch (error) {
    console.error('Error adding video:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
// return Response.json({ videos })