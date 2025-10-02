const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const staffSchema = new mongoose.Schema({

  employeeId: { type: String, unique: true, index: true }, // EMP0001
  fullName: { type: String, required: true, trim: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ["Male", "Female"], required: true },
  nicPassport: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, default: "" }, // For authentication - defaults to employeeId
  address: { type: String, default: "" },

  jobRole: { type: String, required: true, trim: true },
  department: { type: String, default: "" },
  joinDate: { type: Date, default: Date.now },

  salary: { type: Number, required: true, min: 0 },
  overtimeRate: { type: Number, default: 0, min: 0 },
  bankAccount: { type: String, default: "" },
  bankName: { type: String, default: "" },
  branch: { type: String, default: "" },

  profilePic: { type: String, default: "" }, // URL/path

  isActive: { type: Boolean, default: true }, // delete flag
}, { timestamps: true }

);

module.exports = mongoose.model('Staff', staffSchema);