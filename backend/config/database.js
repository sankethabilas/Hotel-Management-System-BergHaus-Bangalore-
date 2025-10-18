const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Hardcoded MongoDB connection string
    const mongoURI = 'mongodb+srv://Sanketh:Gv5T0YzYqgFCI6th@cluster0.6vyj3nr.mongodb.net/hms_database?retryWrites=true&w=majority';
    console.log('🔗 Using hardcoded MongoDB URI:', mongoURI);

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