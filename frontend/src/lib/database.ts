import mongoose from 'mongoose';

// Global variable to store the cached connection
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// Initialize the global mongoose variable
global.mongoose = global.mongoose || { conn: null, promise: null };

export const connectDB = async (): Promise<typeof mongoose> => {
  // If we already have a connection, return it
  if (global.mongoose.conn) {
    return global.mongoose.conn;
  }

  // If there's no active connection promise, create one
  if (!global.mongoose.promise) {
    try {
      const mongoURI = process.env.MONGODB_URI;
      
      if (!mongoURI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }

      const opts = {
        serverSelectionTimeoutMS: 5000, // 5 second timeout
        socketTimeoutMS: 5000, // 5 second socket timeout
        connectTimeoutMS: 5000, // 5 second connection timeout
      };

      global.mongoose.promise = mongoose.connect(mongoURI, opts);
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
      });

    } catch (error) {
      console.error('❌ Error connecting to MongoDB:', error);
      console.log('⚠️  Database connection failed, continuing without DB:', (error as Error).message);
      console.log('📝 API will continue without database connection for testing');
      global.mongoose.promise = null;
      throw error;
    }
  }

  try {
    global.mongoose.conn = await global.mongoose.promise;
    console.log(`✅ MongoDB Connected: ${global.mongoose.conn.connection.host}`);
    return global.mongoose.conn;
  } catch (error) {
    global.mongoose.promise = null;
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
};