require('dotenv').config();

const emailConfig = {
  // Email service configuration
  service: process.env.EMAIL_SERVICE || 'gmail', // gmail, outlook, yahoo, or custom SMTP
  user: process.env.EMAIL_USER || 'your-email@gmail.com',
  password: process.env.EMAIL_PASSWORD || 'your-app-password',
  
  // SMTP configuration (if using custom SMTP)
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
  },
  
  // Email templates
  templates: {
    from: {
      name: 'HMS Hotel Management System',
      address: process.env.EMAIL_USER || 'your-email@gmail.com'
    }
  },
  
  // Frontend URL for email links
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Rate limiting configuration
  rateLimits: {
    delayBetweenEmails: 1000,      // 1 second between emails
    batchSize: 10,                  // Process 10 emails before longer pause
    batchDelayMultiplier: 2         // 2x delay after each batch
  }
};

module.exports = emailConfig;
