import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    guestId: {
      type: String,
      index: true
    },
    guestName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /.+@.+\..+/
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    date: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['Service', 'Room', 'Food', 'Facilities', 'Other'],
      default: 'Other'
    },
    managerResponse: {
      type: String,
      default: ''
    },
    responseDate: {
      type: Date
    }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual field for status
feedbackSchema.virtual('status').get(function() {
  return this.managerResponse && this.managerResponse.trim().length > 0 ? 'responded' : 'pending';
});

// Indexes for analytics performance
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ createdAt: -1, category: 1 });
feedbackSchema.index({ createdAt: -1, rating: 1 });

export const Feedback = mongoose.model('Feedback', feedbackSchema);


