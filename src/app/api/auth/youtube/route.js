// src/app/api/auth/youtube/route.js
import { NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/youtube/oauth'

export async function GET() {
  try {
    const authUrl = getAuthUrl()
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Error initiating YouTube OAuth:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}