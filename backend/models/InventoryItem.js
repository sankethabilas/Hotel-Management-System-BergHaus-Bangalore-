const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  allocated: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  damaged: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  returned: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  imageUrl: { type: String },
  description: { type: String },
  // Supplier details stored directly in item
  supplierName: { type: String },
  supplierEmail: { type: String },
  supplierPhone: { type: String },
  // Category field
  category: {
    type: String,
    enum: ["Kitchen", "Housekeeping", "Maintenance"],
    required: true,
  },
  price: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
