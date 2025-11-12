// src/models/Channel.js
import mongoose from 'mongoose'

const ChannelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Channel name is required'],
      trim: true,
    },
    channelId: {
      type: String,
      required: [true, 'YouTube Channel ID is required'],
      unique: true,
      trim: true,
    },
    title: {
      type: String, // Official YouTube channel title
    },
    description: {
      type: String,
    },
    customUrl: {
      type: String, // e.g., @VeerBharat
    },
    thumbnailUrl: {
      type: String,
    },
    // Statistics from YouTube API
    subscriberCount: {
      type: Number,
      default: 0,
    },
    videoCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    // Tracking
    lastSyncedAt: {
      type: Date,
      default: Date.now,
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

export default mongoose.models.Channel || mongoose.model('Channel', ChannelSchema)