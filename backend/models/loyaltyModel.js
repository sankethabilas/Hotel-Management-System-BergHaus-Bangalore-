import mongoose from 'mongoose'

const loyaltySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    guestId: {
      type: String,
      required: true,
      index: true,
      unique: true,
      trim: true
    },
    guestName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    points: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    tier: {
      type: String,
      enum: ['Silver', 'Gold', 'Platinum'],
      default: 'Silver',
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      required: true
    },
    enrolledDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    assignedOffers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer'
      }
    ]
  },
  { timestamps: true }
)

export const Loyalty = mongoose.model('Loyalty', loyaltySchema)


