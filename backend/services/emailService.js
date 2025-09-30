const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      await transporter.verify();
      console.log('✅ Email service is ready to send messages');
      return true;
    } else {
      console.log('⚠️ Email service not configured - emails will be logged instead');
      return false;
    }
  } catch (error) {
    console.log('❌ Email service not available - emails will be logged instead');
    console.log('Error:', error.message);
    return false;
  }
};

// Initialize email verification
verifyEmailConfig();

// Send booking confirmation email
const sendBookingConfirmation = async (booking) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email not configured - booking confirmation would be sent to:', booking.guestEmail);
      console.log('Booking Reference:', booking.bookingReference);
      return;
    }
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@hms.com',
      to: booking.guestEmail,
      subject: `Booking Confirmation - ${booking.bookingReference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #006bb8, #004d82); color: white; padding: 20px; text-align: center;">
            <h1>Hotel Management System</h1>
            <h2>Booking Confirmation</h2>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <h3>Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Booking Reference:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.bookingReference}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Guest Name:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.guestName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Room:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.roomNumber} (${booking.roomType})</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Check-in:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(booking.checkInDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Check-out:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(booking.checkOutDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Guests:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.numberOfGuests}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Total Amount:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">$${booking.totalAmount.toFixed(2)}</td>
              </tr>
            </table>
            
            ${booking.specialRequests ? `
              <h3>Special Requests</h3>
              <p>${booking.specialRequests}</p>
            ` : ''}
            
            <div style="background: #e8f4f8; padding: 15px; margin: 20px 0; border-left: 4px solid #006bb8;">
              <h3>Important Information</h3>
              <ul>
                <li>Please arrive at the hotel on your check-in date</li>
                <li>Bring a valid ID for verification</li>
                <li>Cancellation policy: Free cancellation up to 24 hours before check-in</li>
                <li>Contact us if you have any questions</li>
              </ul>
            </div>
          </div>
          
          <div style="background: #006bb8; color: white; padding: 15px; text-align: center;">
            <p>Thank you for choosing our hotel!</p>
            <p>For any inquiries, please contact us at support@hms.com</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent successfully');
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
    throw error;
  }
};

// Send booking cancellation email
const sendBookingCancellation = async (booking) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email not configured - booking cancellation would be sent to:', booking.guestEmail);
      console.log('Booking Reference:', booking.bookingReference);
      return;
    }
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@hms.com',
      to: booking.guestEmail,
      subject: `Booking Cancelled - ${booking.bookingReference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc3545; color: white; padding: 20px; text-align: center;">
            <h1>Hotel Management System</h1>
            <h2>Booking Cancelled</h2>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <p>Dear ${booking.guestName},</p>
            <p>Your booking has been successfully cancelled.</p>
            
            <h3>Cancellation Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Booking Reference:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.bookingReference}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Room:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.roomNumber} (${booking.roomType})</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Cancellation Date:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(booking.cancellationDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Refund Amount:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">$${booking.refundAmount.toFixed(2)}</td>
              </tr>
            </table>
            
            ${booking.cancellationReason ? `
              <h3>Reason for Cancellation</h3>
              <p>${booking.cancellationReason}</p>
            ` : ''}
            
            <div style="background: #e8f4f8; padding: 15px; margin: 20px 0; border-left: 4px solid #006bb8;">
              <h3>Refund Information</h3>
              <p>Your refund will be processed within 5-7 business days to your original payment method.</p>
            </div>
          </div>
          
          <div style="background: #006bb8; color: white; padding: 15px; text-align: center;">
            <p>We hope to serve you again in the future!</p>
            <p>For any inquiries, please contact us at support@hms.com</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Booking cancellation email sent successfully');
  } catch (error) {
    console.error('Failed to send booking cancellation email:', error);
    throw error;
  }
};

// Send booking reminder email
const sendBookingReminder = async (booking) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email not configured - booking reminder would be sent to:', booking.guestEmail);
      console.log('Booking Reference:', booking.bookingReference);
      return;
    }
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@hms.com',
      to: booking.guestEmail,
      subject: `Booking Reminder - Check-in Tomorrow - ${booking.bookingReference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #006bb8, #004d82); color: white; padding: 20px; text-align: center;">
            <h1>Hotel Management System</h1>
            <h2>Check-in Reminder</h2>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <p>Dear ${booking.guestName},</p>
            <p>This is a friendly reminder that your check-in is scheduled for tomorrow!</p>
            
            <h3>Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Booking Reference:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.bookingReference}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Room:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.roomNumber} (${booking.roomType})</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Check-in:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(booking.checkInDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Check-out:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(booking.checkOutDate).toLocaleDateString()}</td>
              </tr>
            </table>
            
            <div style="background: #e8f4f8; padding: 15px; margin: 20px 0; border-left: 4px solid #006bb8;">
              <h3>Check-in Information</h3>
              <ul>
                <li>Check-in time: 3:00 PM</li>
                <li>Please bring a valid ID</li>
                <li>Contact us if you need to modify your arrival time</li>
              </ul>
            </div>
          </div>
          
          <div style="background: #006bb8; color: white; padding: 15px; text-align: center;">
            <p>We look forward to welcoming you!</p>
            <p>For any inquiries, please contact us at support@hms.com</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Booking reminder email sent successfully');
  } catch (error) {
    console.error('Failed to send booking reminder email:', error);
    throw error;
  }
};

module.exports = {
  sendBookingConfirmation,
  sendBookingCancellation,
  sendBookingReminder
};