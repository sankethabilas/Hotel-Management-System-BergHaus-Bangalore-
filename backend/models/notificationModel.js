import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
      // Nullable for now - will be populated when auth is implemented
    },
    type: {
      type: String,
      required: true,
      enum: ['guest_registered', 'feedback_submitted', 'low_rating', 'response_needed'],
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    category: {
      type: String,
      required: true,
      enum: ['guest', 'feedback', 'alert'],
      default: 'feedback'
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    relatedModel: {
      type: String,
      required: true,
      enum: ['User', 'Feedback']
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for efficient queries
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
