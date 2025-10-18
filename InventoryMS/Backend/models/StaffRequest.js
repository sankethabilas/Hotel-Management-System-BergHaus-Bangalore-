const mongoose = require('mongoose');

const staffRequestSchema = new mongoose.Schema({
  staffName: { type: String, required: true },
  staffEmail: { type: String, required: true },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  reason: { 
    type: String, 
    enum: ["Request a new item", "Item was damaged", "Other"], 
    required: true 
  },
  category: { 
    type: String, 
    enum: ["Kitchen", "Housekeeping", "Maintenance"], 
    required: true 
  },
  concern: { type: String }, // optional
  isDone: { type: Boolean, default: false }, //  mark as done feature
}, { timestamps: true });

module.exports = mongoose.model("StaffRequest", staffRequestSchema);
