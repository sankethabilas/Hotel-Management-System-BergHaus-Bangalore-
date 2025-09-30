import mongoose from 'mongoose'

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    validUntil: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
)

export const Offer = mongoose.model('Offer', offerSchema)


