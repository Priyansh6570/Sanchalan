// src/app/api/auth/youtube/disconnect/route.js
import { NextResponse } from 'next/server'
import { disconnectYouTube } from '@/lib/youtube/oauth'

export async function POST() {
  try {
    await disconnectYouTube()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}