import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
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
    }
    ,
    managerResponse: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export const Feedback = mongoose.model('Feedback', feedbackSchema);


