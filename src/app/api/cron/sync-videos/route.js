// app/api/cron/sync-videos/route.js
import connectDB from "@/lib/db/connect"
import Video from "@/models/Video"
import { google } from 'googleapis'

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
})

async function syncVideoFromYouTube(videoId) {
  try {
    console.log(`Syncing video: ${videoId}`)
    
    // Fetch video details from YouTube
    const response = await youtube.videos.list({
      part: ['snippet', 'statistics', 'status', 'contentDetails'],
      id: [videoId]
    })

    if (!response.data.items || response.data.items.length === 0) {
      console.log(`Video not found: ${videoId}`)
      return null
    }

    const videoData = response.data.items[0]
    
    // Update video in database
    const updatedVideo = await Video.findOneAndUpdate(
      { videoId },
      {
        title: videoData.snippet.title,
        description: videoData.snippet.description,
        thumbnailUrl: videoData.snippet.thumbnails?.maxres?.url || 
                      videoData.snippet.thumbnails?.high?.url ||
                      videoData.snippet.thumbnails?.medium?.url,
        publishedAt: videoData.snippet.publishedAt,
        viewCount: parseInt(videoData.statistics.viewCount || 0),
        likeCount: parseInt(videoData.statistics.likeCount || 0),
        commentCount: parseInt(videoData.statistics.commentCount || 0),
        status: videoData.status.privacyStatus === 'public' ? 'uploaded' : 
                videoData.status.privacyStatus === 'unlisted' ? 'uploaded' : 'private',
        duration: videoData.contentDetails.duration,
        tags: videoData.snippet.tags || [],
        lastSyncedAt: new Date()
      },
      { new: true }
    )

    console.log(`Successfully synced: ${videoId}`)
    return updatedVideo
    
  } catch (error) {
    console.error(`Error syncing video ${videoId}:`, error.message)
    return null
  }
}

export async function GET(request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Connect to database
    await connectDB()

    console.log('Starting video sync cron job...')

    // Sync all videos (or videos updated > 6 hours ago)
    const videos = await Video.find({
      $or: [
        { lastSyncedAt: { $lt: new Date(Date.now() - 6 * 60 * 60 * 1000) } },
        { lastSyncedAt: { $exists: false } }
      ]
    })

    console.log(`Found ${videos.length} videos to sync`)

    let successCount = 0
    let failCount = 0

    // Sync videos one by one
    for (const video of videos) {
      const result = await syncVideoFromYouTube(video.videoId)
      if (result) {
        successCount++
      } else {
        failCount++
      }
      
      // Add small delay to avoid rate limiting (optional)
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log(`Sync completed: ${successCount} success, ${failCount} failed`)

    return Response.json({ 
      success: true, 
      total: videos.length,
      synced: successCount,
      failed: failCount,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}