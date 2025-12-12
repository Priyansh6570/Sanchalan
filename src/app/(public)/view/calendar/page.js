'use client'
import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Calendar, Clock, Users, Youtube, Play } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatNumber } from '@/lib/utils'

export default function PublicCalendarPage() {
  const [view, setView] = useState('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChannel, setSelectedChannel] = useState('all')
  const [expandedEventId, setExpandedEventId] = useState(null)

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
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const weekDays = getDaysInWeek(currentDate)
  const monthDays = getDaysInMonth(currentDate)

  const getEventsForDate = (date) => {
    if (!date) return []
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    return events.filter(e => {
      if (!e.start) return false
      const eventDate = e.start.split('T')[0]
      return eventDate === dateStr
    }).filter(e => {
      if (selectedChannel === 'all') return true
      const channelName = e.extendedProps?.channel?.name || e.channel
      return channelName === selectedChannel
    })
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

  const getUniqueChannels = () => {
    const channels = new Set()
    events.forEach(event => {
      const channelName = event.extendedProps?.channel?.name || event.channel
      if (channelName) channels.add(channelName)
    })
    return Array.from(channels).sort()
  }

  const hours = [6, 7, 18, 19]

  const getEventTime = (event) => {
    if (event.time) return event.time
    if (event.start) {
      const date = new Date(event.start)
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    }
    return '00:00'
  }

  const getSeriesColor = (event) => {
    const type = event.extendedProps?.type || event.type
    if (type === 'planned-episode') return '#22c55e'
    if (type === 'planned-trailer') return '#3b82f6'
    
    if (event.backgroundColor && !event.backgroundColor.includes('rgba')) {
      return event.backgroundColor
    }
    
    if (event.seriesColor) return event.seriesColor
    
    const seriesName = event.extendedProps?.series || event.series
    const seriesColors = {
      'Adventure Series': '#3b82f6',
      'Mystery Chronicles': '#8b5cf6',
      'Comedy Show': '#ec4899',
      'Tech Reviews': '#10b981',
      'Drama Series': '#f59e0b',
      'Science Show': '#06b6d4'
    }
    
    if (seriesName && seriesColors[seriesName]) {
      return seriesColors[seriesName]
    }
    
    if (seriesName) {
      let hash = 0
      for (let i = 0; i < seriesName.length; i++) {
        hash = seriesName.charCodeAt(i) + ((hash << 5) - hash)
      }
      const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#ef4444', '#14b8a6']
      return colors[Math.abs(hash) % colors.length]
    }
    
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

          {/* Channel Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="px-4 py-2 rounded-full bg-white shadow-lg border border-gray-200 font-medium text-gray-700 hover:border-gray-300 transition-all cursor-pointer"
            >
              <option value="all">All Channels</option>
              {getUniqueChannels().map(channel => (
                <option key={channel} value={channel}>{channel}</option>
              ))}
            </select>
          </div>

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
              selectedDate && view === 'month' ? 'flex-1' : 'w-full'
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
                  <div className="space-y-[280px]">
                    {hours.map(hour => (
                      <div key={hour} className="text-xs text-gray-400 text-right pr-2">
                        {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                      </div>
                    ))}
                  </div>

                  {/* Days Columns */}
                  {weekDays.map((day, dayIndex) => {
                    const dayEvents = getEventsForDay(day)
                    return (
                      <div key={dayIndex} className="relative min-h-[900px] bg-gray-50/50 rounded-2xl p-2">
                        {hours.map((hour, i) => (
                          <div
                            key={hour}
                            className="absolute left-0 right-0 border-t border-gray-200"
                            style={{ top: `${(i / (hours.length - 1)) * 100}%` }}
                          />
                        ))}

                        {dayEvents.map((event) => {
                          const time = getEventTime(event)
                          const [hour, minute] = time.split(':').map(Number)
                          
                          const startHour = 6
                          const endHour = 19
                          const totalHours = endHour - startHour
                          const hoursSinceStart = hour + (minute / 60) - startHour
                          const topPercent = (hoursSinceStart / totalHours) * 100
                          
                          const color = getSeriesColor(event)
                          const isExpanded = expandedEventId === event.id
                          
                          return (
                            <motion.div
                              key={event.id}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ 
                                scale: 1, 
                                opacity: 1,
                                height: isExpanded ? '160px' : '60px'
                              }}
                              whileHover={{ scale: 1.02, y: -2, zIndex: 10 }}
                              onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                              className="absolute left-2 right-2 cursor-pointer rounded-2xl overflow-hidden group"
                              style={{
                                top: `${Math.max(0, Math.min(topPercent, 95))}%`,
                                boxShadow: `0 8px 24px ${color}30, 0 0 0 1px ${color}20`,
                                zIndex: isExpanded ? 20 : 1
                              }}
                            >
                              <div 
                                className="absolute inset-0 opacity-90 group-hover:opacity-100 transition-opacity"
                                style={{
                                  background: `linear-gradient(135deg, ${color}e6 0%, ${color}cc 50%, ${color}b3 100%)`,
                                }}
                              />
                              
                              <div className="relative h-full flex flex-col p-3">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg"
                                    style={{
                                      background: 'rgba(255, 255, 255, 0.25)',
                                      backdropFilter: 'blur(10px)',
                                      border: '1px solid rgba(255, 255, 255, 0.3)',
                                      color: 'white'
                                    }}
                                  >
                                    {event.extendedProps?.series?.name?.[0]?.toUpperCase() || 
                                     event.series?.[0]?.toUpperCase() || 
                                     event.title?.[0]?.toUpperCase() || '?'}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="text-white font-bold text-xs truncate drop-shadow-lg">
                                      {event.extendedProps?.series?.name || event.series || 'Unknown Series'}
                                    </div>
                                    <div className="text-white/90 text-xs truncate drop-shadow">
                                      {time}
                                    </div>
                                  </div>
                                </div>
                                
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-3 space-y-2 text-white text-xs"
                                  >
                                    <div className="font-semibold">{event.title}</div>
                                    {(event.extendedProps?.team || event.team) && (
                                      <div className="flex items-center gap-2">
                                        <Users size={12} />
                                        <span>{event.extendedProps?.team || event.team}</span>
                                      </div>
                                    )}
                                    {(event.extendedProps?.channel?.name || event.channel) && (
                                      <div className="flex items-center gap-2">
                                        <Youtube size={12} />
                                        <span>{event.extendedProps?.channel?.name || event.channel}</span>
                                      </div>
                                    )}
                                    {event.extendedProps?.viewCount !== undefined && (
                                      <div className="flex items-center gap-2">
                                        <Play size={12} />
                                        <span>{formatNumber(event.extendedProps.viewCount)} views</span>
                                      </div>
                                    )}
                                  </motion.div>
                                )}
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
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {monthDays.map((day, i) => {
                    const dayEvents = getEventsForDate(day)
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.01 }}
                        onClick={() => day && setSelectedDate(day)}
                        className={`aspect-square rounded-2xl p-3 transition-all cursor-pointer ${
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
                              {dayEvents.slice(0, 2).map(event => (
                                <div
                                  key={event.id}
                                  className="text-xs p-1.5 rounded-lg backdrop-blur-sm truncate"
                                  style={{
                                    background: `${getSeriesColor(event)}80`,
                                    color: 'white'
                                  }}
                                >
                                  {event.extendedProps?.series?.name || event.series}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{dayEvents.length - 2} more
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
                  {getEventsForDate(currentDate).length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      No episodes scheduled for this day
                    </div>
                  ) : (
                    getEventsForDate(currentDate).map(event => {
                      const color = getSeriesColor(event)
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          className="p-6 rounded-2xl overflow-hidden group relative"
                          style={{
                            background: `linear-gradient(135deg, ${color}e6, ${color}b3)`,
                            boxShadow: `0 8px 24px ${color}30`
                          }}
                        >
                          <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                            style={{
                              background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                            }}
                          />
                          
                          <div className="relative flex items-start justify-between">
                            <div className="flex-1 flex items-center gap-4">
                              <div 
                                className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.25)',
                                  backdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(255, 255, 255, 0.3)',
                                  color: 'white'
                                }}
                              >
                                {event.extendedProps?.series?.name?.[0]?.toUpperCase() || 
                                 event.series?.[0]?.toUpperCase() || 
                                 event.title?.[0]?.toUpperCase() || '?'}
                              </div>
                              
                              <div className="flex-1 space-y-3">
                                <div>
                                  <div className="text-white font-bold text-xl mb-2 drop-shadow-lg">
                                    {event.extendedProps?.series?.name || event.series || event.title}
                                  </div>
                                  <div className="text-white/90 text-sm drop-shadow">{event.title}</div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="text-white/80 text-sm flex items-center gap-2 drop-shadow">
                                    <Clock size={14} />
                                    {getEventTime(event)}
                                  </div>
                                  {(event.extendedProps?.team || event.team) && (
                                    <div className="text-white/80 text-sm flex items-center gap-2 drop-shadow">
                                      <Users size={14} />
                                      {event.extendedProps?.team || event.team}
                                    </div>
                                  )}
                                  {(event.extendedProps?.channel?.name || event.channel) && (
                                    <div className="text-white/80 text-sm flex items-center gap-2 drop-shadow">
                                      <Youtube size={14} />
                                      {event.extendedProps?.channel?.name || event.channel}
                                    </div>
                                  )}
                                  {event.extendedProps?.viewCount !== undefined && (
                                    <div className="text-white/80 text-sm flex items-center gap-2 drop-shadow">
                                      <Play size={14} />
                                      {formatNumber(event.extendedProps.viewCount)} views
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div 
                              className="w-3 h-3 rounded-full shadow-lg animate-pulse"
                              style={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)'
                              }}
                            />
                          </div>
                        </motion.div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Day Details Panel for Month View */}
          <AnimatePresence>
            {selectedDate && view === 'month' && (
              <motion.div
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                className="w-96 bg-white rounded-3xl shadow-xl border border-gray-200 p-6 space-y-6 max-h-[800px] overflow-y-auto"
              >
                <div className="flex items-start justify-between sticky top-0 bg-white pb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedDate(null)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-all"
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                <div className="space-y-3">
                  {getEventsForDate(selectedDate).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No episodes for this day
                    </div>
                  ) : (
                    getEventsForDate(selectedDate).map((event, idx) => {
                      const color = getSeriesColor(event)
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-4 rounded-2xl overflow-hidden relative"
                          style={{
                            background: `linear-gradient(135deg, ${color}e6, ${color}b3)`,
                            boxShadow: `0 4px 12px ${color}30`
                          }}
                        >
                          <div className="relative space-y-3">
                            <div className="flex items-center gap-3">
                              <div 
                                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.25)',
                                  backdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(255, 255, 255, 0.3)',
                                  color: 'white'
                                }}
                              >
                                {event.extendedProps?.series?.name?.[0]?.toUpperCase() || 
                                 event.series?.[0]?.toUpperCase() || 
                                 event.title?.[0]?.toUpperCase() || '?'}
                              </div>
                              
                              <div className="flex-1 space-y-2">
                                <div>
                                  <div className="text-white font-bold text-sm drop-shadow-lg">
                                    {event.extendedProps?.series?.name || event.series || 'Unknown Series'}
                                  </div>
                                  <div className="text-white/90 text-xs drop-shadow">{event.title}</div>
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="text-white/80 text-xs flex items-center gap-2 drop-shadow">
                                    <Clock size={12} />
                                    {getEventTime(event)}
                                  </div>
                                  {(event.extendedProps?.channel?.name || event.channel) && (
                                    <div className="text-white/80 text-xs flex items-center gap-2 drop-shadow">
                                      <Youtube size={12} />
                                      {event.extendedProps?.channel?.name || event.channel}
                                    </div>
                                  )}
                                  {(event.extendedProps?.team || event.team) && (
                                    <div className="text-white/80 text-xs flex items-center gap-2 drop-shadow">
                                      <Users size={12} />
                                      {event.extendedProps?.team || event.team}
                                    </div>
                                  )}
                                  {event.extendedProps?.viewCount !== undefined && (
                                    <div className="text-white/80 text-xs flex items-center gap-2 drop-shadow">
                                      <Play size={12} />
                                      {formatNumber(event.extendedProps.viewCount)} views
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          </motion.div>
                        )
                      })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}