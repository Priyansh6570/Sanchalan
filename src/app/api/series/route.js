// src/app/api/series/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Series from '@/models/Series'

// GET all series
export async function GET() {
  try {
    await connectDB()
    const series = await Series.find()
      .populate('channel', 'name title')
      .populate('team', 'name lead')
      .sort({ createdAt: -1 })
    
    return NextResponse.json({
      success: true,
      series,
    })
  } catch (error) {
    console.error('Error fetching series:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Add new series
export async function POST(request) {
  try {
    await connectDB()
    const body = await request.json()
    const {
      name,
      description,
      channel,
      team,
      episodeUploadDay,
      episodeUploadTime,
      trailerUploadDay,
      trailerUploadTime,
      status,
    } = body

    if (!name || !channel || !team) {
      return NextResponse.json(
        { success: false, error: 'Name, Channel, and Team are required' },
        { status: 400 }
      )
    }

    // Create series
    const series = await Series.create({
      name,
      description: description || '',
      channel,
      team,
      episodeUploadDay: episodeUploadDay || '',
      episodeUploadTime: episodeUploadTime || '',
      trailerUploadDay: trailerUploadDay || '',
      trailerUploadTime: trailerUploadTime || '',
      status: status || 'active',
    })

    // Populate the references before sending response
    await series.populate('channel', 'name title')
    await series.populate('team', 'name lead')

    return NextResponse.json({
      success: true,
      series,
      message: 'Series added successfully',
    })
  } catch (error) {
    console.error('Error adding series:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}