// src/app/api/auth/youtube/status/route.js
import { NextResponse } from 'next/server'
import { getAuthStatus } from '@/lib/youtube/oauth'

export async function GET() {
  try {
    const status = await getAuthStatus()
    
    return NextResponse.json({
      ...status,
      message: status.needsReconnect 
        ? 'YouTube authentication expired. Please reconnect.' 
        : status.connected 
          ? 'YouTube is connected and authenticated.' 
          : 'YouTube is not connected.'
    })
  } catch (error) {
    console.error('Error checking auth status:', error)
    return NextResponse.json({ 
      connected: false,
      needsReconnect: true,
      error: error.message 
    })
  }
}