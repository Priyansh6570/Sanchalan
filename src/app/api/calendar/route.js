// src/app/api/calendar/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Video from '@/models/Video'
import Series from '@/models/Series'
import Team from '@/models/Team'
import Channel from '@/models/Channel'

export async function GET() {
  try {
    await connectDB()

    const now = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(now.getDate() + 7)
    
    // Get last 7 days to show recent uploads
    const lastWeek = new Date()
    lastWeek.setDate(now.getDate() - 7)

    // Get all videos within last 7 days AND next 7 days (14 days total window)
    const videos = await Video.find({
      $or: [
        { publishedAt: { $gte: lastWeek, $lte: nextWeek } },
        { expectedUploadDate: { $gte: lastWeek, $lte: nextWeek } }
      ]
    })
      .populate('channel', 'name')
      .populate({
        path: 'series',
        select: 'name',
        populate: {
          path: 'team',
          select: 'name'
        }
      })
      .sort({ publishedAt: -1, expectedUploadDate: -1 })

    // Get all series with schedules
    const series = await Series.find({
      status: 'active',
      $or: [
        { episodeUploadDays: { $exists: true, $ne: [] } },
        { trailerUploadDays: { $exists: true, $ne: [] } }
      ]
    }).populate('channel team')

    const events = []

    // Add video events
    videos.forEach(video => {
      const date = video.publishedAt || video.expectedUploadDate
      
      let backgroundColor = '#22c55e' // green for uploaded
      let borderColor = '#16a34a'
      
      if (video.status === 'scheduled') {
        backgroundColor = '#facc15' // yellow
        borderColor = '#eab308'
      } else if (video.status === 'delayed') {
        backgroundColor = '#ef4444' // red
        borderColor = '#dc2626'
      }

      events.push({
        id: video._id.toString(),
        title: video.title,
        start: date,
        backgroundColor,
        borderColor,
        textColor: '#ffffff',
        extendedProps: {
          videoId: video.videoId,
          series: {
            name: video.series?.name,
            _id: video.series?._id
          },
          team: video.series?.team?.name,
          channel: {
            name: video.channel?.name,
            _id: video.channel?._id
          },
          viewCount: video.viewCount,
          likeCount: video.likeCount,
          commentCount: video.commentCount,
          subtitleCount: video.subtitleCount,
          adStatus: video.adStatus,
          status: video.status,
          type: 'video',
          duration: video.duration,
          thumbnailUrl: video.thumbnailUrl
        }
      })
    })

    // Add planned series schedules for next 7 days
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    series.forEach(s => {
      // Episode schedules (multiple days)
      if (s.episodeUploadDays && s.episodeUploadDays.length > 0) {
        s.episodeUploadDays.forEach(schedule => {
          if (schedule.day && schedule.time) {
            const dayIndex = daysOfWeek.indexOf(schedule.day)
            if (dayIndex !== -1) {
              const nextDate = new Date(now)
              const daysUntil = (dayIndex - nextDate.getDay() + 7) % 7
              nextDate.setDate(nextDate.getDate() + (daysUntil === 0 ? 7 : daysUntil))
              
              if (nextDate <= nextWeek) {
                const [hours, minutes] = schedule.time.split(':')
                nextDate.setHours(parseInt(hours), parseInt(minutes), 0)
                
                events.push({
                  id: `episode-${s._id}-${schedule.day}-${nextDate.getTime()}`,
                  title: `${s.name} - Episode (Planned)`,
                  start: nextDate.toISOString(),
                  backgroundColor: 'rgba(34,197,94,0.3)',
                  borderColor: '#22c55e',
                  textColor: '#ffffff',
                  extendedProps: {
                    series: {
                      name: s.name,
                      _id: s._id
                    },
                    team: s.team?.name,
                    channel: {
                      name: s.channel?.name,
                      _id: s.channel?._id
                    },
                    type: 'planned-episode',
                    time: schedule.time
                  }
                })
              }
            }
          }
        })
      }

      // Trailer schedules (multiple days)
      if (s.trailerUploadDays && s.trailerUploadDays.length > 0) {
        s.trailerUploadDays.forEach(schedule => {
          if (schedule.day && schedule.time) {
            const dayIndex = daysOfWeek.indexOf(schedule.day)
            if (dayIndex !== -1) {
              const nextDate = new Date(now)
              const daysUntil = (dayIndex - nextDate.getDay() + 7) % 7
              nextDate.setDate(nextDate.getDate() + (daysUntil === 0 ? 7 : daysUntil))
              
              if (nextDate <= nextWeek) {
                const [hours, minutes] = schedule.time.split(':')
                nextDate.setHours(parseInt(hours), parseInt(minutes), 0)
                
                events.push({
                  id: `trailer-${s._id}-${schedule.day}-${nextDate.getTime()}`,
                  title: `${s.name} - Trailer (Planned)`,
                  start: nextDate.toISOString(),
                  backgroundColor: 'rgba(59,130,246,0.3)',
                  borderColor: '#3b82f6',
                  textColor: '#ffffff',
                  extendedProps: {
                    series: {
                      name: s.name,
                      _id: s._id
                    },
                    team: s.team?.name,
                    channel: {
                      name: s.channel?.name,
                      _id: s.channel?._id
                    },
                    type: 'planned-trailer',
                    time: schedule.time
                  }
                })
              }
            }
          }
        })
      }
    })

    return NextResponse.json({
      success: true,
      events,
      count: events.length
    })
  } catch (error) {
    console.error('Error fetching calendar data:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}