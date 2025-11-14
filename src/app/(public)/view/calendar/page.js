'use client'
import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Calendar, Clock, Users, Youtube, Play } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatNumber } from '@/lib/utils'

export default function PublicCalendarPage() {
  const [view, setView] = useState('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCalendar = async () => {
    try {
      const response = await fetch('/api/calendar')
      const data = await response.json()
      if (data.success) {
        setEvents(data.events)
      }
    } catch (error) {
      console.error('Error fetching calendar:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCalendar()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchCalendar, 30000)
    return () => clearInterval(interval)
  }, [])

  const getDaysInWeek = (date) => {
    const curr = new Date(date)
    const first = curr.getDate() - curr.getDay()
    const days = []
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(curr.setDate(first + i))
      days.push(day)
    }
    return days
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days in month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const weekDays = getDaysInWeek(currentDate)
  const monthDays = getDaysInMonth(currentDate)

  const getEventsForDate = (date) => {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(e => e.start?.split('T')[0] === dateStr)
  }

  const getEventsForDay = (date) => {
    return getEventsForDate(date)
  }

  const isToday = (date) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSameMonth = (date) => {
    if (!date) return false
    return date.getMonth() === currentDate.getMonth()
  }

  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7)
    } else if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setDate(newDate.getDate() - 1)
    }
    setCurrentDate(newDate)
  }

  const goToNext = () => {
    const newDate = new Date(currentDate)
    if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7)
    } else if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getMonthYear = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getEventTime = (event) => {
    if (event.time) return event.time
    if (event.start) {
      const date = new Date(event.start)
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    }
    return '00:00'
  }

  const getEventPosition = (event) => {
    const time = getEventTime(event)
    const [hour, minute] = time.split(':').map(Number)
    return (hour * 60 + minute) / 1440 * 100
  }

  const getSeriesColor = (event) => {
    if (event.backgroundColor) return event.backgroundColor
    if (event.seriesColor) return event.seriesColor
    
    // Generate color based on series name
    const seriesColors = {
      'Adventure Series': '#3b82f6',
      'Mystery Chronicles': '#8b5cf6',
      'Comedy Show': '#ec4899',
      'Tech Reviews': '#10b981',
      'Drama Series': '#f59e0b',
      'Science Show': '#06b6d4'
    }
    
    if (event.series && seriesColors[event.series]) {
      return seriesColors[event.series]
    }
    
    // Default color based on type
    if (event.type === 'planned-episode') return '#22c55e'
    if (event.type === 'planned-trailer') return '#3b82f6'
    
    return '#6366f1'
  }

  const getMixedGradient = (dayEvents) => {
    if (dayEvents.length === 0) return 'transparent'
    if (dayEvents.length === 1) {
      const color = getSeriesColor(dayEvents[0])
      return `linear-gradient(135deg, ${color}15, ${color}25)`
    }
    const colors = dayEvents.map(e => getSeriesColor(e))
    return `linear-gradient(135deg, ${colors.map((c, i) => `${c}${i % 2 ? '25' : '15'}`).join(', ')})`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1600px] mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
          >
            {getMonthYear()}
          </motion.h1>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-white rounded-full p-1.5 shadow-lg border border-gray-200">
            {['month', 'week', 'day'].map((v) => (
              <motion.button
                key={v}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView(v)}
                className={`px-6 py-2 rounded-full font-medium transition-all capitalize ${
                  view === v
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {v}
              </motion.button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToPrevious}
              className="p-3 rounded-full bg-white shadow-lg border border-gray-200 hover:border-gray-300 transition-all"
            >
              <ChevronLeft size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToToday}
              className="px-6 py-3 rounded-full bg-white shadow-lg border border-gray-200 hover:border-gray-300 font-medium transition-all"
            >
              Today
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToNext}
              className="p-3 rounded-full bg-white shadow-lg border border-gray-200 hover:border-gray-300 transition-all"
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex gap-6">
          {/* Main Calendar */}
          <motion.div 
            layout
            className={`bg-white rounded-3xl shadow-xl border border-gray-200 p-6 ${
              selectedEvent ? 'flex-1' : 'w-full'
            }`}
          >
            {view === 'week' && (
              <div className="space-y-4">
                {/* Week Days Header */}
                <div className="grid grid-cols-8 gap-3">
                  <div className="text-sm font-medium text-gray-500 flex items-center justify-center">
                    Time
                  </div>
                  {weekDays.map((day, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-4 rounded-2xl text-center transition-all ${
                        isToday(day)
                          ? 'bg-black text-white shadow-lg scale-105'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      style={{
                        background: isToday(day) ? 'black' : getMixedGradient(getEventsForDay(day))
                      }}
                    >
                      <div className={`text-3xl font-bold ${isToday(day) ? 'text-white' : 'text-gray-900'}`}>
                        {day.getDate()}
                      </div>
                      <div className={`text-xs mt-1 ${isToday(day) ? 'text-gray-300' : 'text-gray-500'}`}>
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Time Grid */}
                <div className="grid grid-cols-8 gap-3 relative">
                  {/* Hours Column */}
                  <div className="space-y-16">
                    {hours.filter(h => h >= 8 && h <= 20).map(hour => (
                      <div key={hour} className="text-xs text-gray-400 text-right pr-2">
                        {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                      </div>
                    ))}
                  </div>

                  {/* Days Columns */}
                  {weekDays.map((day, dayIndex) => {
                    const dayEvents = getEventsForDay(day)
                    return (
                      <div key={dayIndex} className="relative min-h-[800px] bg-gray-50/50 rounded-2xl p-2">
                        {/* Hour lines */}
                        {hours.filter(h => h >= 8 && h <= 20).map((hour, i) => (
                          <div
                            key={hour}
                            className="absolute left-0 right-0 border-t border-gray-200"
                            style={{ top: `${(i / 13) * 100}%` }}
                          />
                        ))}

                        {/* Events */}
                        {dayEvents.map((event, i) => {
                          const time = getEventTime(event)
                          const [hour, minute] = time.split(':').map(Number)
                          const topPercent = ((hour - 8) / 13) * 100
                          const color = getSeriesColor(event)
                          
                          return (
                            <motion.div
                              key={event.id}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              whileHover={{ scale: 1.05, zIndex: 10 }}
                              onClick={() => setSelectedEvent(event)}
                              className="absolute left-2 right-2 cursor-pointer rounded-xl p-3 backdrop-blur-sm"
                              style={{
                                top: `${topPercent}%`,
                                height: '80px',
                                background: `linear-gradient(135deg, ${color}90, ${color}60)`,
                                boxShadow: `0 4px 20px ${color}40`,
                                border: `1px solid ${color}50`
                              }}
                            >
                              <div className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-white mt-1 shadow-lg" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-white font-semibold text-sm truncate">
                                    {event.title}
                                  </div>
                                  {event.series && (
                                    <div className="text-white/80 text-xs truncate">
                                      {event.series}
                                    </div>
                                  )}
                                  <div className="text-white/70 text-xs mt-1">
                                    {time}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {view === 'month' && (
              <div className="space-y-3">
                {/* Month Days Header */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Month Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {monthDays.map((day, i) => {
                    const dayEvents = getEventsForDate(day)
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.01 }}
                        className={`aspect-square rounded-2xl p-3 transition-all ${
                          !day
                            ? 'bg-transparent'
                            : isToday(day)
                            ? 'bg-black text-white shadow-lg'
                            : isSameMonth(day)
                            ? 'bg-gray-50 hover:bg-gray-100'
                            : 'bg-gray-100/50 opacity-50'
                        }`}
                        style={{
                          background: day && !isToday(day) ? getMixedGradient(dayEvents) : undefined
                        }}
                      >
                        {day && (
                          <>
                            <div className={`text-xl font-bold ${isToday(day) ? 'text-white' : 'text-gray-900'}`}>
                              {day.getDate()}
                            </div>
                            <div className="mt-2 space-y-1">
                              {dayEvents.slice(0, 3).map(event => (
                                <motion.div
                                  key={event.id}
                                  whileHover={{ scale: 1.05 }}
                                  onClick={() => setSelectedEvent(event)}
                                  className="text-xs p-1.5 rounded-lg cursor-pointer backdrop-blur-sm truncate"
                                  style={{
                                    background: `${getSeriesColor(event)}80`,
                                    color: 'white'
                                  }}
                                >
                                  {event.title}
                                </motion.div>
                              ))}
                              {dayEvents.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  +{dayEvents.length - 3} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {view === 'day' && (
              <div className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
                  <div className="text-5xl font-bold text-gray-900">
                    {currentDate.getDate()}
                  </div>
                  <div className="text-lg text-gray-600 mt-2">
                    {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', year: 'numeric' })}
                  </div>
                </div>

                <div className="space-y-3">
                  {getEventsForDate(currentDate).map(event => {
                    const color = getSeriesColor(event)
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedEvent(event)}
                        className="p-6 rounded-2xl cursor-pointer backdrop-blur-sm"
                        style={{
                          background: `linear-gradient(135deg, ${color}90, ${color}60)`,
                          boxShadow: `0 4px 20px ${color}40`
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-white font-bold text-xl mb-2">{event.title}</div>
                            {event.series && (
                              <div className="text-white/90 text-sm">{event.series}</div>
                            )}
                            <div className="text-white/80 text-sm mt-2 flex items-center gap-2">
                              <Clock size={14} />
                              {getEventTime(event)}
                            </div>
                          </div>
                          <div className="w-3 h-3 rounded-full bg-white shadow-lg" />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* Event Details Panel */}
          <AnimatePresence>
            {selectedEvent && (
              <motion.div
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                className="w-96 bg-white rounded-3xl shadow-xl border border-gray-200 p-6 space-y-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-bold text-gray-900 pr-8">{selectedEvent.title}</h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedEvent(null)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-all"
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                {/* Series Badge */}
                {selectedEvent.series && (
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium"
                    style={{ background: getSeriesColor(selectedEvent) }}
                  >
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    {selectedEvent.series}
                  </div>
                )}

                {/* Details */}
                <div className="space-y-3">
                  {selectedEvent.team && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Users size={18} className="text-gray-400" />
                      <span>{selectedEvent.team}</span>
                    </div>
                  )}
                  {selectedEvent.channel && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Youtube size={18} className="text-gray-400" />
                      <span>{selectedEvent.channel}</span>
                    </div>
                  )}
                  {(selectedEvent.time || selectedEvent.start) && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Clock size={18} className="text-gray-400" />
                      <span>{getEventTime(selectedEvent)}</span>
                    </div>
                  )}
                </div>

                {/* Video-specific data */}
                {selectedEvent.type === 'video' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedEvent.viewCount !== undefined && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4"
                        >
                          <Play size={16} className="text-gray-400 mb-2" />
                          <div className="text-2xl font-bold text-gray-900">{formatNumber(selectedEvent.viewCount)}</div>
                          <div className="text-xs text-gray-500 mt-1">Views</div>
                        </motion.div>
                      )}
                      {selectedEvent.likeCount !== undefined && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4"
                        >
                          <Youtube size={16} className="text-gray-400 mb-2" />
                          <div className="text-2xl font-bold text-gray-900">{formatNumber(selectedEvent.likeCount)}</div>
                          <div className="text-xs text-gray-500 mt-1">Likes</div>
                        </motion.div>
                      )}
                      {selectedEvent.subtitleCount !== undefined && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4"
                        >
                          <Calendar size={16} className="text-gray-400 mb-2" />
                          <div className="text-2xl font-bold text-gray-900">{selectedEvent.subtitleCount}/100</div>
                          <div className="text-xs text-gray-500 mt-1">Subtitles</div>
                        </motion.div>
                      )}
                      {selectedEvent.adStatus && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4"
                        >
                          <Clock size={16} className="text-gray-400 mb-2" />
                          <div className="text-2xl font-bold text-gray-900 capitalize">{selectedEvent.adStatus}</div>
                          <div className="text-xs text-gray-500 mt-1">Ad Status</div>
                        </motion.div>
                      )}
                    </div>

                    {selectedEvent.videoId && (
                      <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href={`https://youtube.com/watch?v=${selectedEvent.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-4 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all"
                      >
                        <Youtube size={20} />
                        Watch on YouTube
                      </motion.a>
                    )}
                  </>
                )}

                {/* Planned event info */}
                {(selectedEvent.type === 'planned-episode' || selectedEvent.type === 'planned-trailer') && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                    <p className="text-sm text-blue-800">
                      This is a planned {selectedEvent.type === 'planned-episode' ? 'episode' : 'trailer'} based on the series schedule.
                    </p>
                  </div>
                )}

                {/* Status Badge */}
                {selectedEvent.status && (
                  <div className={`text-center py-3 rounded-2xl font-medium ${
                    selectedEvent.status === 'uploaded' ? 'bg-green-50 text-green-700' :
                    selectedEvent.status === 'scheduled' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {selectedEvent.status.toUpperCase()}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}