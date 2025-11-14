// src/lib/youtube/oauth.js
import axios from 'axios'
import connectDB from '@/lib/db/connect'
import Auth from '@/models/Auth'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI

/**
 * Generate OAuth authorization URL
 */
export function getAuthUrl() {
  const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
    'https://www.googleapis.com/auth/youtube.force-ssl',
  ]

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code) {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    })

    const { access_token, refresh_token, expires_in, scope, token_type } = response.data

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + expires_in * 1000)

    // Store in database
    await connectDB()
    
    // Delete existing tokens
    await Auth.deleteMany({ provider: 'youtube' })
    
    // Create new token entry
    await Auth.create({
      provider: 'youtube',
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt,
      scope,
      tokenType: token_type,
    })

    console.log('✅ YouTube tokens stored successfully')

    return {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt,
    }
  } catch (error) {
    console.error('Error exchanging code for tokens:', error.response?.data || error.message)
    throw new Error('Failed to exchange authorization code')
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken) {
  try {
    console.log('🔄 Refreshing access token...')
    
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
    })

    const { access_token, expires_in } = response.data
    const expiresAt = new Date(Date.now() + expires_in * 1000)

    console.log('✅ Access token refreshed successfully')

    return {
      accessToken: access_token,
      expiresAt,
    }
  } catch (error) {
    console.error('❌ Error refreshing token:', error.response?.data || error.message)
    
    // If refresh token is invalid, clear auth data
    if (error.response?.data?.error === 'invalid_grant') {
      console.error('🔴 Refresh token is invalid or expired. Please reconnect YouTube.')
      await connectDB()
      await Auth.deleteMany({ provider: 'youtube' })
      throw new Error('YouTube authentication expired. Please reconnect your YouTube account.')
    }
    
    throw new Error('Failed to refresh access token')
  }
}

/**
 * Get valid access token (refresh if expired)
 */
export async function getValidAccessToken() {
  try {
    await connectDB()
    
    const auth = await Auth.findOne({ provider: 'youtube' })
    
    if (!auth) {
      throw new Error('No YouTube authentication found. Please connect your YouTube account.')
    }

    if (!auth.refreshToken) {
      console.error('🔴 No refresh token found. Deleting invalid auth entry.')
      await Auth.deleteMany({ provider: 'youtube' })
      throw new Error('YouTube authentication is invalid. Please reconnect your YouTube account.')
    }

    // Check if token is expired or will expire in next 5 minutes
    const now = new Date()
    const expiryBuffer = new Date(now.getTime() + 5 * 60 * 1000)

    if (auth.expiresAt <= expiryBuffer) {
      console.log('⏰ Token expired or expiring soon. Refreshing...')
      
      try {
        // Token expired or about to expire, refresh it
        const { accessToken, expiresAt } = await refreshAccessToken(auth.refreshToken)
        
        // Update in database
        auth.accessToken = accessToken
        auth.expiresAt = expiresAt
        await auth.save()
        
        return accessToken
      } catch (refreshError) {
        // If refresh fails, throw the specific error
        throw refreshError
      }
    }

    console.log('✅ Using existing valid access token')
    return auth.accessToken
  } catch (error) {
    console.error('Error getting valid access token:', error.message)
    throw error
  }
}

/**
 * Check if YouTube is connected
 */
export async function isYouTubeConnected() {
  try {
    await connectDB()
    const auth = await Auth.findOne({ provider: 'youtube' })
    return !!auth && !!auth.refreshToken
  } catch (error) {
    return false
  }
}

/**
 * Disconnect YouTube account
 */
export async function disconnectYouTube() {
  try {
    await connectDB()
    await Auth.deleteMany({ provider: 'youtube' })
    console.log('✅ YouTube disconnected successfully')
    return true
  } catch (error) {
    console.error('Error disconnecting YouTube:', error)
    return false
  }
}

/**
 * Get auth status with details
 */
export async function getAuthStatus() {
  try {
    await connectDB()
    const auth = await Auth.findOne({ provider: 'youtube' })
    
    if (!auth) {
      return {
        connected: false,
        needsReconnect: false,
        expiresAt: null
      }
    }

    const needsReconnect = !auth.refreshToken || auth.expiresAt < new Date()

    return {
      connected: true,
      needsReconnect,
      expiresAt: auth.expiresAt,
      hasRefreshToken: !!auth.refreshToken
    }
  } catch (error) {
    console.error('Error getting auth status:', error)
    return {
      connected: false,
      needsReconnect: true,
      error: error.message
    }
  }
}