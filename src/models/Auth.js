// src/models/Auth.js
import mongoose from 'mongoose'

const AuthSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      default: 'youtube',
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    scope: {
      type: String,
    },
    tokenType: {
      type: String,
      default: 'Bearer',
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Auth || mongoose.model('Auth', AuthSchema)