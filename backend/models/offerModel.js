import mongoose from 'mongoose'

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    discountType: {
      type: String,
      required: true,
      enum: ['percentage', 'fixed', 'special'],
      default: 'percentage'
    },
    discountValue: {
      type: Number,
      required: function() {
        return this.discountType !== 'special';
      },
      min: 0
    },
    validFrom: {
      type: Date,
      required: true
    },
    validUntil: {
      type: Date,
      required: true
    },
    minStay: {
      type: Number,
      min: 1,
      default: 1
    },
    maxStay: {
      type: Number,
      min: 1
    },
    applicableDays: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    applicableRooms: {
      type: [String],
      enum: ['Standard', 'Deluxe', 'Suite', 'Executive', 'Presidential'],
      default: ['Standard', 'Deluxe', 'Suite', 'Executive', 'Presidential']
    },
    termsConditions: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  { timestamps: true }
)

export const Offer = mongoose.model('Offer', offerSchema)


