const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Email configuration - using Gmail as example
    // You can change this to any email service provider
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // You can use 'outlook', 'yahoo', or custom SMTP
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password' // Use App Password for Gmail
      }
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.log('❌ Email service configuration error:', error);
      } else {
        console.log('✅ Email service is ready to send messages');
      }
    });
  }

  // Send welcome email to new users
  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: {
          name: 'HMS Hotel Management System',
          address: process.env.EMAIL_USER || 'your-email@gmail.com'
        },
        to: user.email,
        subject: 'Welcome to HMS - Your Account is Ready! 🎉',
        html: this.getWelcomeEmailTemplate(user)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send booking confirmation email
  async sendBookingConfirmationEmail(user, bookingDetails) {
    try {
      const mailOptions = {
        from: {
          name: 'HMS Hotel Management System',
          address: process.env.EMAIL_USER || 'your-email@gmail.com'
        },
        to: user.email,
        subject: `Booking Confirmation - ${bookingDetails.bookingReference}`,
        html: this.getBookingConfirmationTemplate(user, bookingDetails)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Booking confirmation email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send booking confirmation email:', error);
      return { success: false, error: error.message };
    }
  }

  // Welcome email template
  getWelcomeEmailTemplate(user) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to HMS</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                background: linear-gradient(135deg, #006bb8, #2fa0df);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                margin: -30px -30px 30px -30px;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 300;
            }
            .content {
                margin: 20px 0;
            }
            .highlight {
                background-color: #fee3b3;
                padding: 15px;
                border-radius: 5px;
                border-left: 4px solid #ffc973;
                margin: 20px 0;
            }
            .button {
                display: inline-block;
                background-color: #006bb8;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
            }
            .button:hover {
                background-color: #005a9e;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }
            .feature {
                text-align: center;
                padding: 20px;
                background-color: #f8f9fa;
                border-radius: 8px;
            }
            .feature-icon {
                font-size: 24px;
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏨 Welcome to HMS!</h1>
                <p>Your Hotel Management System Account is Ready</p>
            </div>
            
            <div class="content">
                <h2>Hello ${user.firstName} ${user.lastName}!</h2>
                
                <p>Welcome to our Hotel Management System! We're thrilled to have you join our community of valued guests.</p>
                
                <div class="highlight">
                    <strong>🎉 Your account has been successfully created!</strong><br>
                    Email: ${user.email}<br>
                    Role: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </div>
                
                <h3>What you can do with your HMS account:</h3>
                
                <div class="features">
                    <div class="feature">
                        <div class="feature-icon">🔍</div>
                        <h4>Search Rooms</h4>
                        <p>Find the perfect room for your stay</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">📅</div>
                        <h4>Book Reservations</h4>
                        <p>Make reservations with ease</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">👤</div>
                        <h4>Manage Profile</h4>
                        <p>Update your personal information</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">📧</div>
                        <h4>Email Notifications</h4>
                        <p>Receive booking confirmations</p>
                    </div>
                </div>
                
                <p>Ready to start your journey with us?</p>
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">
                        🚀 Start Exploring HMS
                    </a>
                </div>
                
                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            </div>
            
            <div class="footer">
                <p><strong>HMS Hotel Management System</strong></p>
                <p>Thank you for choosing us for your accommodation needs!</p>
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Booking confirmation email template
  getBookingConfirmationTemplate(user, bookingDetails) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                background: linear-gradient(135deg, #006bb8, #2fa0df);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                margin: -30px -30px 30px -30px;
            }
            .booking-details {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin: 10px 0;
                padding: 5px 0;
                border-bottom: 1px solid #eee;
            }
            .detail-label {
                font-weight: bold;
                color: #006bb8;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Booking Confirmed!</h1>
                <p>Your reservation has been successfully created</p>
            </div>
            
            <div class="content">
                <h2>Hello ${user.firstName} ${user.lastName}!</h2>
                
                <p>Thank you for choosing our hotel! Your booking has been confirmed and we're excited to welcome you.</p>
                
                <div class="booking-details">
                    <h3>📋 Booking Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Booking Reference:</span>
                        <span>${bookingDetails.bookingReference}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Room:</span>
                        <span>${bookingDetails.roomNumber} - ${bookingDetails.roomType}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Check-in:</span>
                        <span>${new Date(bookingDetails.checkIn).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Check-out:</span>
                        <span>${new Date(bookingDetails.checkOut).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Total Amount:</span>
                        <span>$${bookingDetails.totalAmount}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span>${bookingDetails.status}</span>
                    </div>
                </div>
                
                <p>We look forward to providing you with an exceptional stay experience!</p>
            </div>
            
            <div class="footer">
                <p><strong>HMS Hotel Management System</strong></p>
                <p>Thank you for your booking!</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}

module.exports = new EmailService();
