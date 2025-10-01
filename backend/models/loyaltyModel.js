import mongoose from 'mongoose'

const loyaltySchema = new mongoose.Schema(
  {
    guestId: {
      type: String,
      required: true,
      index: true,
      unique: true,
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
    enrolledDate: {
      type: Date,
      default: Date.now,
      required: true
    }
    ,
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


