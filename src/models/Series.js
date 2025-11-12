// src/models/Series.js
import mongoose from 'mongoose'

const SeriesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Series name is required'],
      trim: true,
    },
    description: {
      type: String,
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
      required: [true, 'Channel is required'],
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team is required'],
    },
    // Episode Upload Schedule
    episodeUploadDay: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', ''],
    },
    episodeUploadTime: {
      type: String, // Format: "18:00" (24-hour)
    },
    // Trailer Upload Schedule
    trailerUploadDay: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', ''],
    },
    trailerUploadTime: {
      type: String, // Format: "12:00" (24-hour)
    },
    // Status
    status: {
      type: String,
      enum: ['active', 'upcoming', 'completed', 'paused'],
      default: 'active',
    },
    // Optional: Playlist ID if series has a YouTube playlist
    playlistId: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Series || mongoose.model('Series', SeriesSchema)