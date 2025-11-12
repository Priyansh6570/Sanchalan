// src/models/Team.js
import mongoose from 'mongoose'

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      unique: true,
    },
    lead: {
      type: String,
      required: [true, 'Team lead is required'],
      trim: true,
    },
    members: [{
      type: String,
      trim: true,
    }],
    description: {
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

export default mongoose.models.Team || mongoose.model('Team', TeamSchema)