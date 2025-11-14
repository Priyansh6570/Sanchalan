// src/app/api/calendar/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Video from '@/models/Video'
import Series from '@/models/Series'

export async function GET() {
  try {
    await connectDB()

    const now = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(now.getDate() + 7)

    // Get all videos within next 7 days
    const videos = await Video.find({
      $or: [
        { publishedAt: { $gte: now, $lte: nextWeek } },
        { expectedUploadDate: { $gte: now, $lte: nextWeek } }
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

    // Get all series with schedules
    const series = await Series.find({
      status: 'active',
      $or: [
        { episodeUploadDay: { $ne: '' } },
        { trailerUploadDay: { $ne: '' } }
      ]
    }).populate('channel team')

    const events = []

    // Add video events
    videos.forEach(video => {
      const date = video.publishedAt || video.expectedUploadDate
      
      let backgroundColor = '#22c55e' // green
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
        textColor: '#000',
        extendedProps: {
          videoId: video.videoId,
          series: video.series?.name,
          seriesId: video.series?._id,
          team: video.series?.team?.name,
          channel: video.channel?.name,
          viewCount: video.viewCount,
          likeCount: video.likeCount,
          subtitleCount: video.subtitleCount,
          adStatus: video.adStatus,
          status: video.status,
          type: 'video'
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
                  backgroundColor: 'rgba(34,197,94,0.2)',
                  borderColor: '#22c55e',
                  textColor: '#166534',
                  extendedProps: {
                    series: s.name,
                    seriesId: s._id,
                    team: s.team?.name,
                    channel: s.channel?.name,
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
                  backgroundColor: 'rgba(59,130,246,0.2)',
                  borderColor: '#3b82f6',
                  textColor: '#1e40af',
                  extendedProps: {
                    series: s.name,
                    seriesId: s._id,
                    team: s.team?.name,
                    channel: s.channel?.name,
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
    })
  } catch (error) {
    console.error('Error fetching calendar data:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}