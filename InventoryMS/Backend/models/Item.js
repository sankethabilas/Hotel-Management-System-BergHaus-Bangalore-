const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: 
  { 
    type: String, 
    required: true },
  quantity: 
  { 
    type: Number, 
    required: true, 
    default: 0 
  },
  allocated: 
  { type: Number, 
    required: true, 
    default: 0 
  },
  damaged: 
  { type: Number, 
    required: true, 
    default: 0 
  },
  returned: 
  { 
    type: Number, 
    required: true, 
    default: 0 
  },
  imageUrl: { type: String }, // store image link (upload service needed if storing files)
  description: { type: String },
  supplierName: { type: String },
  supplierEmail: { type: String },
  // New category field
  category: {
    type: String,
    enum: ["Kitchen", "Housekeeping", "Maintenance"],
    required: true,
  },
  price: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);

