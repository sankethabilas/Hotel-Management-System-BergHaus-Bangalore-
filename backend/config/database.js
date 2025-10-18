const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variables
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined. Please check your .env file.');
    }

    // Don't log the full connection string for security
    const maskedURI = mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log('🔗 Connecting to MongoDB:', maskedURI);

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);

    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('MongoDB event: connected');
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB event: disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB event: error: ${err.message}`);
    });

  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
