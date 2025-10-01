import mongoose, { Document, Schema } from 'mongoose'

// Interface for Admin document
export interface IAdmin extends Document {
  username: string
  password: string
  email: string
  role: 'admin' | 'manager' | 'kitchen'
  fullName: string
  isActive: boolean
  lastLogin?: Date
}

const adminSchema: Schema<IAdmin> = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'kitchen'],
    default: 'admin'
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
})

// Export the model, handling Next.js hot reload
export const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', adminSchema);