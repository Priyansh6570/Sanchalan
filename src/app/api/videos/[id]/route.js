// src/app/api/videos/[id]/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Video from '@/models/Video'
import { fetchVideoDetails } from '@/lib/youtube/api'

// PATCH - Update video
export async function PATCH(request, { params }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()

    const video = await Video.findById(id)
    if (!video) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      )
    }

    // Update fields
    const allowedUpdates = [
      'subtitleCount',
      'adStatus',
      'seoNotes',
      'status',
      'expectedUploadDate'
    ]

    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        video[field] = body[field]
      }
    })

    await video.save()

    // Populate references
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
      message: 'Video updated successfully',
    })
  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// GET - Refresh video stats from YouTube
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

    // Fetch fresh data from YouTube
    const youtubeData = await fetchVideoDetails(video.videoId)

    // Update stats
    video.viewCount = youtubeData.viewCount
    video.likeCount = youtubeData.likeCount
    video.commentCount = youtubeData.commentCount
    video.lastSyncedAt = new Date()

    await video.save()

    // Populate references
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
      message: 'Video stats refreshed from YouTube',
    })
  } catch (error) {
    console.error('Error refreshing video:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}