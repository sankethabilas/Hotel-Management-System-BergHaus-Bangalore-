import express from 'express';import express from 'express';import express from 'express';

import dotenv from 'dotenv';

import cors from 'cors';import dotenv from 'dotenv';import dotenv from 'dotenv';

import helmet from 'helmet';

import morgan from 'morgan';import cors from 'cors';import cors from 'cors';

import compression from 'compression';

import cookieParser from 'cookie-parser';import helmet from 'helmet';import helmet from 'helmet';

import rateLimit from 'express-rate-limit';

import mongoose from 'mongoose';import morgan from 'morgan';import morgan from 'morgan';



// Load environment variablesimport compression from 'compression';import compression from 'compression';

dotenv.config();

import cookieParser from 'cookie-parser';import cookieParser from 'cookie-parser';

// Create Express app

const app = express();import rateLimit from 'express-rate-limit';import rateLimit from 'express-rate-limit';

const PORT = process.env.PORT || 5001;

import mongoose from 'mongoose';import 'express-async-errors';

// Rate limiting

const limiter = rateLimit({

  windowMs: 15 * 60 * 1000, // 15 minutes

  max: 100, // limit each IP to 100 requests per windowMs// Load environment variables// Load environment variables

  message: 'Too many requests from this IP, please try again later.',

});dotenv.config();dotenv.config();



// Middleware

app.use(helmet());

app.use(cors({// Import routesimport { connectDB } from './config/database';

  origin: process.env.CLIENT_URL || 'http://localhost:3000',

  credentials: trueimport authRoutes from './routes/authRoutes';import { errorHandler } from './middleware/errorHandler';

}));

app.use(morgan('combined'));import menuRoutes from './routes/menuRoutes';import { notFound } from './middleware/notFound';

app.use(compression());

app.use(cookieParser());

app.use(limiter);

app.use(express.json({ limit: '10mb' }));// Create Express app// Route imports

app.use(express.urlencoded({ extended: true }));

const app = express();import authRoutes from './routes/authRoutes';

// Basic routes for testing

app.get('/health', (req, res) => {const PORT = process.env.PORT || 5001;import menuRoutes from './routes/menuRoutes';

  res.status(200).json({

    status: 'OK',

    message: 'BergHaus F&B Server is running',

    timestamp: new Date().toISOString(),// Rate limitingconst app = express();

    environment: process.env.NODE_ENV || 'development'

  });const limiter = rateLimit({const PORT = process.env.PORT || 5000;

});

  windowMs: 15 * 60 * 1000, // 15 minutes

// API routes placeholder

app.get('/api/test', (req, res) => {  max: 100, // limit each IP to 100 requests per windowMs// Trust proxy for accurate IP addresses

  res.json({ 

    success: true,   message: 'Too many requests from this IP, please try again later.',app.set('trust proxy', 1);

    message: 'Express.js backend is working!',

    data: 'BergHaus API is ready'});

  });

});// Rate limiting



// 404 handler// Middlewareconst limiter = rateLimit({

app.use('*', (req, res) => {

  res.status(404).json({app.use(helmet());  windowMs: 15 * 60 * 1000, // 15 minutes

    success: false,

    message: 'Route not found'app.use(cors({  max: 100, // limit each IP to 100 requests per windowMs

  });

});  origin: process.env.CLIENT_URL || 'http://localhost:3000',  message: {



// Error handling middleware  credentials: true    error: 'Too many requests from this IP, please try again later.',

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {

  console.error('Error:', error);}));  },

  

  const statusCode = error.statusCode || 500;app.use(morgan('combined'));});

  const message = error.message || 'Internal Server Error';

  app.use(compression());

  res.status(statusCode).json({

    success: false,app.use(cookieParser());// Middleware

    message,

    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })app.use(limiter);app.use(limiter);

  });

});app.use(express.json({ limit: '10mb' }));app.use(helmet());



// Database connectionapp.use(express.urlencoded({ extended: true }));app.use(compression());

const connectDB = async () => {

  try {app.use(morgan('combined'));

    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {// Routesapp.use(cors({

      console.log('⚠️  MongoDB URI not found, skipping database connection');

      return;app.use('/api/auth', authRoutes);  origin: process.env.CLIENT_URL || 'http://localhost:3000',

    }

app.use('/api/menu', menuRoutes);  credentials: true,

    await mongoose.connect(mongoURI);

    console.log('✅ MongoDB connected successfully');}));

  } catch (error) {

    console.error('❌ MongoDB connection failed:', error);// Health check endpointapp.use(express.json({ limit: '10mb' }));

    console.log('🔄 Server will continue without database...');

  }app.get('/health', (req, res) => {app.use(express.urlencoded({ extended: true, limit: '10mb' }));

};

  res.status(200).json({app.use(cookieParser());

// Start server

const startServer = async () => {    status: 'OK',

  try {

    // Connect to database (optional for now)    message: 'BergHaus F&B Server is running',// Health check endpoint

    await connectDB();

        timestamp: new Date().toISOString(),app.get('/health', (req, res) => {

    // Start listening

    app.listen(PORT, () => {    environment: process.env.NODE_ENV || 'development'  res.status(200).json({

      console.log(`🚀 BergHaus F&B Server running on port ${PORT}`);

      console.log(`📍 Health check: http://localhost:${PORT}/health`);  });    status: 'OK',

      console.log(`🔗 API test: http://localhost:${PORT}/api/test`);

      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);});    timestamp: new Date().toISOString(),

    });

  } catch (error) {    uptime: process.uptime(),

    console.error('Failed to start server:', error);

    process.exit(1);// 404 handler  });

  }

};app.use('*', (req, res) => {});



// Start the server  res.status(404).json({

startServer();

    success: false,// API Routes

export default app;
    message: 'Route not found'app.use('/api/auth', authRoutes);

  });app.use('/api/menu', menuRoutes);

});

// Error handling middleware

// Error handling middlewareapp.use(notFound);

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {app.use(errorHandler);

  console.error('Error:', error);

  // Start server

  const statusCode = error.statusCode || 500;const startServer = async () => {

  const message = error.message || 'Internal Server Error';  try {

      // Try to connect to database, but don't fail if it's not available

  res.status(statusCode).json({    try {

    success: false,      await connectDB();

    message,      console.log('✅ Database connected successfully');

    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })    } catch (dbError) {

  });      console.warn('⚠️  Database connection failed, continuing without DB:', (dbError as Error).message);

});      console.log('📝 Server will start without database connection for testing');

    }

// Database connection    

const connectDB = async () => {    app.listen(PORT, () => {

  try {      console.log(`🚀 Server running on port ${PORT}`);

    const mongoURI = process.env.MONGODB_URI;      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);

    if (!mongoURI) {      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);

      throw new Error('MONGODB_URI environment variable is not defined');    });

    }  } catch (error) {

    console.error('❌ Failed to start server:', error);

    await mongoose.connect(mongoURI);    process.exit(1);

    console.log('✅ MongoDB connected successfully');  }

  } catch (error) {};

    console.error('❌ MongoDB connection failed:', error);

    process.exit(1);startServer();

  }

};export default app;


// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 BergHaus F&B Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;