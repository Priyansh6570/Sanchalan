// src/app/api/test/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Channel from '@/models/Channel'
import Team from '@/models/Team'
import Series from '@/models/Series'
import Video from '@/models/Video'

export async function GET() {
  try {
    // Test database connection
    await connectDB()

    // Count documents in each collection
    const channelCount = await Channel.countDocuments()
    const teamCount = await Team.countDocuments()
    const seriesCount = await Series.countDocuments()
    const videoCount = await Video.countDocuments()

    return NextResponse.json({
      success: true,
      message: '✅ Database connection successful!',
      data: {
        channels: channelCount,
        teams: teamCount,
        series: seriesCount,
        videos: videoCount,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '❌ Database connection failed',
        error: error.message,
      },
      { status: 500 }
    )
  }
}