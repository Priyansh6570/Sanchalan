// src/models/Admin.js
import mongoose from 'mongoose'

const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    name: {
      type: String,
      default: 'Admin',
    },
    role: {
      type: String,
      default: 'admin',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
)

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema)