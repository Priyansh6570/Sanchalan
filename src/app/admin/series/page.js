'use client'
// src/app/admin/series/page.js
import { useState, useEffect } from 'react'
import { Film, RefreshCw, Plus, Check, X, Calendar, Clock } from 'lucide-react'

export default function SeriesAdminPage() {
  const [series, setSeries] = useState([])
  const [channels, setChannels] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    channel: '',
    team: '',
    episodeUploadDay: '',
    episodeUploadTime: '',
    trailerUploadDay: '',
    trailerUploadTime: '',
    status: 'active',
  })

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true)
      const [seriesRes, channelsRes, teamsRes] = await Promise.all([
        fetch('/api/series'),
        fetch('/api/channels'),
        fetch('/api/teams'),
      ])

      const [seriesData, channelsData, teamsData] = await Promise.all([
        seriesRes.json(),
        channelsRes.json(),
        teamsRes.json(),
      ])

      if (seriesData.success) setSeries(seriesData.series)
      if (channelsData.success) setChannels(channelsData.channels)
      if (teamsData.success) setTeams(teamsData.teams)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setAdding(true)

    try {
      const response = await fetch('/api/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Series added successfully!')
        setFormData({
          name: '',
          description: '',
          channel: '',
          team: '',
          episodeUploadDay: '',
          episodeUploadTime: '',
          trailerUploadDay: '',
          trailerUploadTime: '',
          status: 'active',
        })
        setShowForm(false)
        fetchData()
        
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to add series')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setAdding(false)
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

      {/* Success/Error Messages */}
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

      {/* Add Series Form */}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Series Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Historic Battles"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the series..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Channel *
                  </label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Channel</option>
                    {channels.map((channel) => (
                      <option key={channel._id} value={channel._id}>
                        {channel.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team *
                  </label>
                  <select
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Team</option>
                    {teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name} (Lead: {team.lead})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Episode Schedule */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Episode Upload Schedule</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Day
                    </label>
                    <select
                      value={formData.episodeUploadDay}
                      onChange={(e) => setFormData({ ...formData, episodeUploadDay: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select Day</option>
                      {daysOfWeek.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.episodeUploadTime}
                      onChange={(e) => setFormData({ ...formData, episodeUploadTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Trailer Schedule */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Trailer Upload Schedule (Optional)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Day
                    </label>
                    <select
                      value={formData.trailerUploadDay}
                      onChange={(e) => setFormData({ ...formData, trailerUploadDay: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select Day</option>
                      {daysOfWeek.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.trailerUploadTime}
                      onChange={(e) => setFormData({ ...formData, trailerUploadTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw size={20} className="animate-spin" />
                    Adding Series...
                  </span>
                ) : (
                  'Add Series'
                )}
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

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <RefreshCw size={32} className="animate-spin mx-auto mb-4" />
            Loading series...
          </div>
        ) : series.length === 0 ? (
          <div className="p-12 text-center">
            <Film size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">No series added yet</p>
            <p className="text-sm text-gray-500">Click "Add Series" to get started</p>
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
                    <p className="font-medium">{item.team?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Episode Schedule</p>
                    <p className="font-medium">
                      {item.episodeUploadDay && item.episodeUploadTime ? (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {item.episodeUploadDay} {item.episodeUploadTime}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Trailer Schedule</p>
                    <p className="font-medium">
                      {item.trailerUploadDay && item.trailerUploadTime ? (
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {item.trailerUploadDay} {item.trailerUploadTime}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </p>
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