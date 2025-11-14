// src/app/api/videos/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Video from '@/models/Video'
import { extractVideoId, fetchVideoDetails } from '@/lib/youtube/api'

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

// POST - Add new video
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
      seoNotes 
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

    // Fetch video details from YouTube (now includes subtitle count)
    const youtubeData = await fetchVideoDetails(videoId)

    // Determine status based on publish date
    const now = new Date()
    const publishDate = new Date(youtubeData.publishedAt)
    let status = 'uploaded'
    
    if (publishDate > now) {
      status = 'scheduled'
    } else if (expectedUploadDate) {
      const expected = new Date(expectedUploadDate)
      if (publishDate > expected) {
        status = 'delayed'
      }
    }

    // Create video with auto-fetched subtitle count
    const video = await Video.create({
      videoId,
      title: youtubeData.title,
      description: youtubeData.description,
      thumbnailUrl: youtubeData.thumbnailUrl,
      duration: youtubeData.duration,
      publishedAt: youtubeData.publishedAt,
      channel,
      series,
      viewCount: youtubeData.viewCount,
      likeCount: youtubeData.likeCount,
      commentCount: youtubeData.commentCount,
      // Auto-fetched subtitle data
      subtitleCount: youtubeData.subtitleCount || 0,
      subtitles: youtubeData.subtitles || { count: 0, languages: [], lastSynced: new Date() },
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

    return NextResponse.json({
      success: true,
      video,
      message: `Video added successfully with ${youtubeData.subtitleCount || 0} subtitle(s) detected`,
    })
  } catch (error) {
    console.error('Error adding video:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}