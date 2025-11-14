// src/app/api/analytics/channel/route.js
import { NextResponse } from 'next/server'
import { getValidAccessToken } from '@/lib/youtube/oauth'
import { getChannelAnalytics } from '@/lib/youtube/analytics'

export async function GET() {
  try {
    // Get access token
    const accessToken = await getValidAccessToken()

    // Fetch channel analytics
    const analyticsData = await getChannelAnalytics(accessToken)

    // Parse analytics response
    const dailyData = []
    if (analyticsData.rows) {
      analyticsData.rows.forEach(row => {
        dailyData.push({
          date: row[0],
          views: row[1],
          estimatedMinutesWatched: row[2],
          averageViewDuration: row[3],
          subscribersGained: row[4],
          subscribersLost: row[5],
        })
      })
    }

    // Calculate totals
    const totals = dailyData.reduce(
      (acc, day) => ({
        views: acc.views + day.views,
        watchTime: acc.watchTime + day.estimatedMinutesWatched,
        subscribersGained: acc.subscribersGained + day.subscribersGained,
        subscribersLost: acc.subscribersLost + day.subscribersLost,
      }),
      { views: 0, watchTime: 0, subscribersGained: 0, subscribersLost: 0 }
    )

    return NextResponse.json({
      success: true,
      dailyData,
      totals: {
        ...totals,
        netSubscribers: totals.subscribersGained - totals.subscribersLost,
        avgDailyViews: Math.round(totals.views / dailyData.length),
      },
      period: {
        days: dailyData.length,
        start: dailyData[0]?.date,
        end: dailyData[dailyData.length - 1]?.date,
      },
      fetchedAt: new Date(),
    })
  } catch (error) {
    console.error('Error fetching channel analytics:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        needsAuth: error.message.includes('authentication')
      },
      { status: 500 }
    )
  }
}