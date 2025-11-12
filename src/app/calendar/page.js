'use client'
// src/app/calendar/page.js
import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { X, Calendar as CalendarIcon, Clock, Users, Youtube, Edit2, Check } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

export default function CalendarPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({})

  const fetchCalendar = async () => {
    try {
      setLoading(true)
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
  }, [])

  const handleEventClick = (info) => {
    const event = {
      id: info.event.id,
      title: info.event.title,
      ...info.event.extendedProps
    }
    setSelectedEvent(event)
    setEditData({
      subtitleCount: event.subtitleCount || 0,
      adStatus: event.adStatus || 'not-set',
      status: event.status || 'scheduled'
    })
    setEditing(false)
  }

  const handleUpdate = async () => {
    if (!selectedEvent.videoId) return
    
    try {
      const response = await fetch(`/api/videos/${selectedEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      
      if (response.ok) {
        alert('✅ Video updated successfully!')
        fetchCalendar()
        setSelectedEvent(null)
        setEditing(false)
      }
    } catch (error) {
      alert('Failed to update video')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Calendar</h1>
        <p className="text-gray-600 mt-1">Next 7 days schedule and uploads</p>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Uploaded</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Delayed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{background: 'rgba(34,197,94,0.2)', border: '2px solid #22c55e'}}></div>
            <span>Planned Episodes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{background: 'rgba(59,130,246,0.2)', border: '2px solid #3b82f6'}}></div>
            <span>Planned Trailers</span>
          </div>
        </div>
      </div>

      {/* Calendar and Details */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
          {loading ? (
            <div className="h-96 flex items-center justify-center text-gray-500">
              Loading calendar...
            </div>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridWeek"
              events={events}
              eventClick={handleEventClick}
              height="auto"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridWeek,dayGridMonth'
              }}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }}
            />
          )}
        </div>

        {/* Event Details Panel */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {selectedEvent ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold pr-8">{selectedEvent.title}</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                {selectedEvent.series && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <CalendarIcon size={16} className="text-gray-400" />
                    <span><strong>Series:</strong> {selectedEvent.series}</span>
                  </div>
                )}
                {selectedEvent.team && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users size={16} className="text-gray-400" />
                    <span><strong>Team:</strong> {selectedEvent.team}</span>
                  </div>
                )}
                {selectedEvent.channel && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Youtube size={16} className="text-gray-400" />
                    <span><strong>Channel:</strong> {selectedEvent.channel}</span>
                  </div>
                )}
                {selectedEvent.time && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={16} className="text-gray-400" />
                    <span><strong>Time:</strong> {selectedEvent.time}</span>
                  </div>
                )}
              </div>

              {/* Video-specific data */}
              {selectedEvent.type === 'video' && (
                <>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Views</span>
                      <span className="font-semibold">{formatNumber(selectedEvent.viewCount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Likes</span>
                      <span className="font-semibold">{formatNumber(selectedEvent.likeCount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status</span>
                      <span className={`font-semibold ${
                        selectedEvent.status === 'uploaded' ? 'text-green-600' :
                        selectedEvent.status === 'scheduled' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {selectedEvent.status}
                      </span>
                    </div>
                  </div>

                  {/* Edit Section */}
                  {editing ? (
                    <div className="border-t pt-4 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Subtitles (0-100)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editData.subtitleCount}
                          onChange={(e) => setEditData({ ...editData, subtitleCount: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Ad Status
                        </label>
                        <select
                          value={editData.adStatus}
                          onChange={(e) => setEditData({ ...editData, adStatus: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="not-set">Not Set</option>
                          <option value="running">Running</option>
                          <option value="stopped">Stopped</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={editData.status}
                          onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="uploaded">Uploaded</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="delayed">Delayed</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdate}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          <Check size={16} />
                          Save
                        </button>
                        <button
                          onClick={() => setEditing(false)}
                          className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtitles</span>
                        <span className="font-semibold">{selectedEvent.subtitleCount}/100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Ads</span>
                        <span className={`font-semibold ${
                          selectedEvent.adStatus === 'running' ? 'text-green-600' :
                          selectedEvent.adStatus === 'stopped' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {selectedEvent.adStatus}
                        </span>
                      </div>
                      <button
                        onClick={() => setEditing(true)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mt-4"
                      >
                        <Edit2 size={16} />
                        Edit Video
                      </button>
                      {selectedEvent.videoId && (
                        <a
                          href={`https://youtube.com/watch?v=${selectedEvent.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                          <Youtube size={16} />
                          Watch on YouTube
                        </a>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Planned event info */}
              {(selectedEvent.type === 'planned-episode' || selectedEvent.type === 'planned-trailer') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <p className="text-sm text-blue-800">
                    This is a planned {selectedEvent.type === 'planned-episode' ? 'episode' : 'trailer'} based on the series schedule. 
                    Add the actual video when uploaded.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <CalendarIcon size={48} className="mx-auto mb-4 text-gray-400" />
              <p>Click on an event to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}