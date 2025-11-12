// src/app/api/channels/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Channel from '@/models/Channel'
import { fetchChannelDetails } from '@/lib/youtube/api'

// GET all channels
export async function GET() {
  try {
    await connectDB()
    const channels = await Channel.find().sort({ createdAt: -1 })
    
    return NextResponse.json({
      success: true,
      channels,
    })
  } catch (error) {
    console.error('Error fetching channels:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Add new channel
export async function POST(request) {
  try {
    await connectDB()
    const body = await request.json()
    const { name, channelId } = body

    if (!name || !channelId) {
      return NextResponse.json(
        { success: false, error: 'Name and Channel ID are required' },
        { status: 400 }
      )
    }

    // Check if channel already exists
    const existingChannel = await Channel.findOne({ channelId })
    if (existingChannel) {
      return NextResponse.json(
        { success: false, error: 'Channel already exists' },
        { status: 400 }
      )
    }

    // Fetch channel details from YouTube
    const youtubeData = await fetchChannelDetails(channelId)

    // Create channel with YouTube data
    const channel = await Channel.create({
      name,
      channelId,
      title: youtubeData.title,
      description: youtubeData.description,
      customUrl: youtubeData.customUrl,
      thumbnailUrl: youtubeData.thumbnailUrl,
      subscriberCount: youtubeData.subscriberCount,
      videoCount: youtubeData.videoCount,
      viewCount: youtubeData.viewCount,
      lastSyncedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      channel,
      message: 'Channel added successfully',
    })
  } catch (error) {
    console.error('Error adding channel:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}