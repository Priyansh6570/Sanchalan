'use client'
// src/app/admin/series/page.js
import { useState, useEffect } from 'react'
import { Film, RefreshCw, Plus, Check, X, Calendar, Clock, Trash2 } from 'lucide-react'

export default function SeriesAdminPage() {
  const [channels, setChannels] = useState([])
  const [teams, setTeams] = useState([])
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    name: '', 
    description: '',
    channel: '', 
    team: '',
    status: 'active',
  })

  // Episode schedule (multiple days)
  const [episodeSchedules, setEpisodeSchedules] = useState([
    { day: '', time: '' }
  ])

  // Trailer schedule (multiple days)
  const [trailerSchedules, setTrailerSchedules] = useState([
    { day: '', time: '' }
  ])

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const getAll = async () => {
    try {
      const [c, t, s] = await Promise.all([
        fetch('/api/channels').then(r => r.json()),
        fetch('/api/teams').then(r => r.json()),
        fetch('/api/series').then(r => r.json())
      ])
      setChannels(c.channels || [])
      setTeams(t.teams || [])
      setSeries(s.series || [])
    } catch (err) {
      console.error('Error loading data:', err)
    }
  }

  useEffect(() => {
    getAll()
  }, [])

  const addEpisodeSchedule = () => {
    setEpisodeSchedules([...episodeSchedules, { day: '', time: '' }])
  }

  const removeEpisodeSchedule = (index) => {
    setEpisodeSchedules(episodeSchedules.filter((_, i) => i !== index))
  }

  const updateEpisodeSchedule = (index, field, value) => {
    const updated = [...episodeSchedules]
    updated[index][field] = value
    setEpisodeSchedules(updated)
  }

  const addTrailerSchedule = () => {
    setTrailerSchedules([...trailerSchedules, { day: '', time: '' }])
  }

  const removeTrailerSchedule = (index) => {
    setTrailerSchedules(trailerSchedules.filter((_, i) => i !== index))
  }

  const updateTrailerSchedule = (index, field, value) => {
    const updated = [...trailerSchedules]
    updated[index][field] = value
    setTrailerSchedules(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Filter out empty schedules
      const validEpisodeSchedules = episodeSchedules.filter(s => s.day && s.time)
      const validTrailerSchedules = trailerSchedules.filter(s => s.day && s.time)

      const res = await fetch('/api/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          episodeUploadDays: validEpisodeSchedules,
          trailerUploadDays: validTrailerSchedules,
        })
      })

      const data = await res.json()

      if (data.success) {
        setSuccess('Series added successfully!')
        setFormData({ name: '', description: '', channel: '', team: '', status: 'active' })
        setEpisodeSchedules([{ day: '', time: '' }])
        setTrailerSchedules([{ day: '', time: '' }])
        setShowForm(false)
        getAll()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to add series')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Series Management</h1>
          <p className="text-gray-600 mt-1">Manage content series and upload schedules</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Cancel' : 'Add Series'}
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check size={20} />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <X size={20} />
          {error}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Series</h2>
          
          {channels.length === 0 || teams.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
              <p className="font-medium">Setup Required</p>
              <p className="text-sm mt-1">
                {channels.length === 0 && 'Please add at least one channel first. '}
                {teams.length === 0 && 'Please add at least one team first.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <input 
                  className="border rounded-lg px-4 py-2" 
                  placeholder="Series Name (e.g., Ganesh Series)"
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  required 
                />
                <select
                  className="border rounded-lg px-4 py-2"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
              </div>

              <textarea 
                className="w-full border rounded-lg px-4 py-2" 
                placeholder="Description"
                rows={3}
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })} 
              />

              <div className="grid md:grid-cols-2 gap-4">
                <select
                  className="border rounded-lg px-4 py-2"
                  value={formData.channel}
                  onChange={e => setFormData({ ...formData, channel: e.target.value })}
                  required
                >
                  <option value="">Select Channel</option>
                  {channels.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>

                <select 
                  className="border rounded-lg px-4 py-2" 
                  value={formData.team}
                  onChange={e => setFormData({ ...formData, team: e.target.value })}
                >
                  <option value="">Select Team (Optional)</option>
                  {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>

              {/* Episode Schedules */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Episode Upload Schedule</h3>
                  <button
                    type="button"
                    onClick={addEpisodeSchedule}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add Another Day
                  </button>
                </div>
                <div className="space-y-2">
                  {episodeSchedules.map((schedule, index) => (
                    <div key={index} className="flex gap-2">
                      <select 
                        className="flex-1 border rounded-lg px-3 py-2"
                        value={schedule.day}
                        onChange={e => updateEpisodeSchedule(index, 'day', e.target.value)}
                      >
                        <option value="">Select Day</option>
                        {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <input 
                        type="time" 
                        className="flex-1 border rounded-lg px-3 py-2"
                        value={schedule.time}
                        onChange={e => updateEpisodeSchedule(index, 'time', e.target.value)}
                      />
                      {episodeSchedules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEpisodeSchedule(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Example: Ganesh Series uploads on Monday at 18:00 and Friday at 18:00
                </p>
              </div>

              {/* Trailer Schedules */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Trailer Upload Schedule (Optional)</h3>
                  <button
                    type="button"
                    onClick={addTrailerSchedule}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add Another Day
                  </button>
                </div>
                <div className="space-y-2">
                  {trailerSchedules.map((schedule, index) => (
                    <div key={index} className="flex gap-2">
                      <select 
                        className="flex-1 border rounded-lg px-3 py-2"
                        value={schedule.day}
                        onChange={e => updateTrailerSchedule(index, 'day', e.target.value)}
                      >
                        <option value="">Select Day</option>
                        {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <input 
                        type="time" 
                        className="flex-1 border rounded-lg px-3 py-2"
                        value={schedule.time}
                        onChange={e => updateTrailerSchedule(index, 'time', e.target.value)}
                      />
                      {trailerSchedules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTrailerSchedule(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 col-span-2"
              >
                {loading ? 'Adding...' : 'Add Series'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Series List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Existing Series</h2>
        </div>

        {series.length === 0 ? (
          <div className="p-12 text-center">
            <Film size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">No series added yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {series.map((item) => (
              <div key={item._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    {item.description && (
                      <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.status === 'active' ? 'bg-green-100 text-green-800' :
                    item.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    item.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Channel</p>
                    <p className="font-medium">{item.channel?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Team</p>
                    <p className="font-medium">{item.team?.name || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Episode Schedule</p>
                    {item.episodeUploadDays && item.episodeUploadDays.length > 0 ? (
                      <div className="space-y-1">
                        {item.episodeUploadDays.map((schedule, idx) => (
                          <p key={idx} className="font-medium flex items-center gap-1">
                            <Calendar size={14} />
                            {schedule.day} {schedule.time}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">Not set</p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Trailer Schedule</p>
                    {item.trailerUploadDays && item.trailerUploadDays.length > 0 ? (
                      <div className="space-y-1">
                        {item.trailerUploadDays.map((schedule, idx) => (
                          <p key={idx} className="font-medium flex items-center gap-1">
                            <Clock size={14} />
                            {schedule.day} {schedule.time}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">Not set</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}