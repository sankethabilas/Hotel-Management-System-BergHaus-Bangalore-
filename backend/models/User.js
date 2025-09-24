const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: function() {
      // Password is required only if not using Google auth
      return !this.isGoogleUser;
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  isGoogleUser: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['guest', 'employee', 'admin', 'manager'],
    default: 'guest'
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[+0][\d]{7,14}$/, 'Phone number must start with + or 0 and have 8-15 digits total']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'USA'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  welcomeEmailSent: {
    type: Boolean,
    default: false
  },
  profileImage: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: String
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  idDetails: {
    idType: {
      type: String,
      enum: ['passport', 'national_id', 'driving_license'],
      default: null
    },
    idNumber: {
      type: String,
      trim: true,
      default: null
    }
  },
  preferences: {
    language: String,
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new) and user is not a Google user
  if (!this.isModified('password') || this.isGoogleUser) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Transform output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
