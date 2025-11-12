// src/models/Video.js
import mongoose from 'mongoose'

const VideoSchema = new mongoose.Schema(
  {
    // YouTube Data (Auto-fetched)
    videoId: {
      type: String,
      required: [true, 'Video ID is required'],
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    description: {
      type: String,
    },
    thumbnailUrl: {
      type: String,
    },
    duration: {
      type: String, // e.g., "PT10M30S" (YouTube format) or "10:30"
    },
    publishedAt: {
      type: Date, // When video was published on YouTube
    },
    
    // Relationships
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
      required: [true, 'Channel is required'],
    },
    series: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Series',
      required: [true, 'Series is required'],
    },
    
    // YouTube Statistics (Auto-fetched & Updated)
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    
    // Manual Entry Fields (YOUR INPUT)
    subtitleCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    adStatus: {
      type: String,
      enum: ['running', 'stopped', 'pending', 'not-set'],
      default: 'not-set',
    },
    seoNotes: {
      type: String, // Your notes on SEO, tags, etc.
    },
    
    // Upload Tracking
    expectedUploadDate: {
      type: Date, // When you expected it to be uploaded
    },
    status: {
      type: String,
      enum: ['scheduled', 'uploaded', 'delayed'],
      default: 'uploaded',
    },
    
    // Tracking
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
    addedBy: {
      type: String,
      default: 'Admin', // Since only you add videos
    },
  },
  {
    timestamps: true, // createdAt (when you added to system), updatedAt
  }
)

// Index for faster queries
VideoSchema.index({ videoId: 1 })
VideoSchema.index({ channel: 1, series: 1 })
VideoSchema.index({ status: 1 })
VideoSchema.index({ publishedAt: -1 })

export default mongoose.models.Video || mongoose.model('Video', VideoSchema)