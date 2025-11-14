// src/app/api/auth/youtube/callback/route.js
import { NextResponse } from 'next/server'
import { exchangeCodeForTokens } from '@/lib/youtube/oauth'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        new URL(`/admin/settings?error=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/admin/settings?error=no_code', request.url)
      )
    }

    // Exchange code for tokens
    await exchangeCodeForTokens(code)

    // Redirect to settings with success message
    return NextResponse.redirect(
      new URL('/admin/settings?success=youtube_connected', request.url)
    )
  } catch (error) {
    console.error('Error in OAuth callback:', error)
    return NextResponse.redirect(
      new URL(`/admin/settings?error=${encodeURIComponent(error.message)}`, request.url)
    )
  }
}