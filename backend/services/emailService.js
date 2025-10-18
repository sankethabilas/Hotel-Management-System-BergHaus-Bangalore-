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
            <h1>Berghaus Bungalow</h1>
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
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">Rs ${booking.totalAmount.toFixed(2)}</td>
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
            <h1>Berghaus Bungalow</h1>
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
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">Rs ${booking.totalAmount.toFixed(2)}</td>
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
            <h1>Berghaus Bungalow</h1>
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

// Send welcome email
const sendWelcomeEmail = async (user) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email not configured - welcome email would be sent to:', user.email);
      console.log('User:', user.firstName, user.lastName);
      return;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@hms.com',
      to: user.email,
      subject: `Welcome to Berghaus Bungalow - ${user.firstName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #006bb8, #004d82); color: white; padding: 20px; text-align: center;">
            <h1>Berghaus Bungalow</h1>
            <h2>Welcome to Berghaus Bungalow!</h2>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <p>Dear ${user.firstName} ${user.lastName},</p>
            <p>Welcome to Berghaus Bungalow! Your account has been successfully created.</p>
            
            <h3>Account Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${user.firstName} ${user.lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${user.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Role:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${user.role}</td>
              </tr>
            </table>
            
            <div style="background: #e8f4f8; padding: 15px; margin: 20px 0; border-left: 4px solid #006bb8;">
              <h3>What you can do:</h3>
              <ul>
                <li>Browse available rooms and facilities</li>
                <li>Make reservations and bookings</li>
                <li>Manage your profile and preferences</li>
                <li>View your booking history</li>
                <li>Contact our support team anytime</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                 style="background: #006bb8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Get Started
              </a>
            </div>
          </div>
          
          <div style="background: #006bb8; color: white; padding: 15px; text-align: center;">
            <p>Thank you for choosing Berghaus Bungalow!</p>
            <p>For any questions, please contact us at support@berghausbungalow.com</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
};

// Send check-in confirmation email
const sendCheckinEmail = async (reservation) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email not configured - check-in confirmation would be sent to:', reservation.guestEmail);
      console.log('Reservation ID:', reservation.reservationId);
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@hms.com',
      to: reservation.guestEmail,
      subject: `Check-in Complete - ${reservation.reservationId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #006bb8, #004d82); color: white; padding: 20px; text-align: center;">
            <h1>Berghaus Bungalow</h1>
            <h2>Welcome! Check-in Complete</h2>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <p>Dear ${reservation.guestName},</p>
            <p>Your check-in has been completed successfully. Welcome to our hotel!</p>
            
            <h3>Stay Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reservation ID:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${reservation.reservationId}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Guest Name:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${reservation.guestName}</td>
              </tr>
              ${reservation.rooms && reservation.rooms.length > 0 ? 
                reservation.rooms.map(room => `
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Room:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${room.roomNumber} (${room.roomType})</td>
                  </tr>
                `).join('') : ''
              }
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Check-in Date:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(reservation.checkInDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Check-out Date:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(reservation.checkOutDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Guests:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${reservation.guestCount.adults} adults${reservation.guestCount.children > 0 ? `, ${reservation.guestCount.children} children` : ''}</td>
              </tr>
            </table>
            
            <div style="background: #e8f4f8; padding: 15px; margin: 20px 0; border-left: 4px solid #006bb8;">
              <h3>Hotel Information</h3>
              <ul>
                <li>WiFi Password: HotelGuest2024</li>
                <li>Breakfast: 7:00 AM - 10:00 AM</li>
                <li>Check-out time: 11:00 AM</li>
                <li>Front desk: Available 24/7</li>
                <li>Emergency contact: +1-555-HOTEL</li>
              </ul>
            </div>
          </div>
          
          <div style="background: #006bb8; color: white; padding: 15px; text-align: center;">
            <p>Enjoy your stay with us!</p>
            <p>For any assistance, please contact the front desk</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Check-in confirmation email sent successfully');
  } catch (error) {
    console.error('Failed to send check-in confirmation email:', error);
    throw error;
  }
};

// Send check-out email with bill attachment
const sendCheckoutEmailWithAttachment = async (reservation, bill, pdfBuffer) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email not configured - check-out email would be sent to:', reservation.guestEmail);
      console.log('Reservation ID:', reservation.reservationId);
      console.log('Bill ID:', bill.billId);
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@hms.com',
      to: reservation.guestEmail,
      subject: `Check-out Complete & Invoice - ${reservation.reservationId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #006bb8, #004d82); color: white; padding: 20px; text-align: center;">
            <h1>Berghaus Bungalow</h1>
            <h2>Thank You for Your Stay!</h2>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <p>Dear ${reservation.guestName},</p>
            <p>Thank you for staying with us! Your check-out has been completed successfully.</p>
            
            <h3>Stay Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reservation ID:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${reservation.reservationId}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Bill ID:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${bill.billId}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Check-in:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(reservation.checkInDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Check-out:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(reservation.checkOutDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Total Amount:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">Rs ${bill.total.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Payment Status:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${bill.status === 'paid' ? 'Paid' : 'Pending'}</td>
              </tr>
            </table>
            
            <div style="background: #e8f4f8; padding: 15px; margin: 20px 0; border-left: 4px solid #006bb8;">
              <h3>Invoice Attached</h3>
              <p>Please find your detailed invoice attached to this email. Keep this for your records.</p>
              ${bill.balance > 0 ? `<p style="color: #dc3545;"><strong>Outstanding Balance: Rs ${bill.balance.toFixed(2)}</strong></p>` : ''}
            </div>
            
            <div style="background: #d4edda; padding: 15px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3>We Hope You Enjoyed Your Stay!</h3>
              <p>Your feedback is important to us. Please consider leaving a review about your experience.</p>
            </div>
          </div>
          
          <div style="background: #006bb8; color: white; padding: 15px; text-align: center;">
            <p>Thank you for choosing our hotel!</p>
            <p>We look forward to welcoming you back soon!</p>
          </div>
        </div>
      `,
      attachments: pdfBuffer ? [{
        filename: `invoice-${bill.billId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }] : []
    };

    await transporter.sendMail(mailOptions);
    console.log('Check-out email with invoice sent successfully');
  } catch (error) {
    console.error('Failed to send check-out email:', error);
    throw error;
  }
};

// Send payment status email
const sendPaymentStatusEmail = async (guestEmail, bill) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email not configured - payment status email would be sent to:', guestEmail);
      console.log('Bill ID:', bill.billId);
      return;
    }

    const isFullyPaid = bill.status === 'paid';
    const subject = isFullyPaid ? 
      `Payment Received - Invoice ${bill.billId}` : 
      `Payment Update - Invoice ${bill.billId}`;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@hms.com',
      to: guestEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${isFullyPaid ? '#28a745' : '#ffc107'}; color: white; padding: 20px; text-align: center;">
            <h1>Berghaus Bungalow</h1>
            <h2>${isFullyPaid ? 'Payment Received' : 'Payment Update'}</h2>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <p>Dear ${bill.guestName},</p>
            <p>${isFullyPaid ? 
              'Thank you! Your payment has been received and processed successfully.' : 
              'We have received a payment for your invoice.'
            }</p>
            
            <h3>Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Invoice ID:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${bill.billId}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Total Amount:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">Rs ${bill.total.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Amount Paid:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">Rs ${bill.paidAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Outstanding Balance:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; ${isFullyPaid ? 'color: #28a745;' : 'color: #dc3545;'}">
                  Rs ${bill.balance.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Payment Date:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date().toLocaleDateString()}</td>
              </tr>
            </table>
            
            ${isFullyPaid ? `
              <div style="background: #d4edda; padding: 15px; margin: 20px 0; border-left: 4px solid #28a745;">
                <h3>Payment Complete!</h3>
                <p>Your invoice has been paid in full. Thank you for your prompt payment.</p>
              </div>
            ` : `
              <div style="background: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h3>Partial Payment Received</h3>
                <p>We have received your partial payment. The remaining balance of Rs ${bill.balance.toFixed(2)} is still outstanding.</p>
                <p>Please contact us to arrange payment for the remaining amount.</p>
              </div>
            `}
          </div>
          
          <div style="background: #006bb8; color: white; padding: 15px; text-align: center;">
            <p>Thank you for your business!</p>
            <p>For any questions about this payment, please contact us at support@hms.com</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Payment status email sent successfully');
  } catch (error) {
    console.error('Failed to send payment status email:', error);
    throw error;
  }
};

// Send bill email with PDF attachment
const sendBillEmail = async (billData, pdfBuffer) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email not configured - bill would be sent to:', billData.guestEmail);
      console.log('Bill ID:', billData.billId);
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@hms.com',
      to: billData.guestEmail,
      subject: `Hotel Bill - ${billData.billId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #006bb8, #004d82); color: white; padding: 20px; text-align: center;">
            <h1>🏨 Berghaus Bungalow</h1>
            <h2>Your Hotel Bill</h2>
          </div>
          
          <div style="padding: 20px; background: #f8f9fa;">
            <p>Dear ${billData.guestName},</p>
            
            <p>Thank you for staying with us! Please find your hotel bill attached to this email.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #006bb8;">
              <h3 style="color: #006bb8; margin-top: 0;">Bill Summary</h3>
              <p><strong>Bill ID:</strong> ${billData.billId}</p>
              <p><strong>Booking Reference:</strong> ${billData.bookingReference}</p>
              <p><strong>Room:</strong> ${billData.roomNumber} (${billData.roomType})</p>
              <p><strong>Stay Period:</strong> ${new Date(billData.checkInDate).toLocaleDateString()} - ${new Date(billData.checkOutDate).toLocaleDateString()}</p>
              <p><strong>Total Nights:</strong> ${billData.totalNights}</p>
              <p style="font-size: 18px; color: #006bb8;"><strong>Total Amount: Rs ${billData.total.toFixed(2)}</strong></p>
              <p><strong>Payment Status:</strong> <span style="color: ${billData.paymentStatus === 'paid' ? '#28a745' : '#ffc107'}; font-weight: bold; text-transform: uppercase;">${billData.paymentStatus}</span></p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #006bb8; margin-top: 0;">Bill Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f8f9fa;">
                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #dee2e6;">Description</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 1px solid #dee2e6;">Qty</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 1px solid #dee2e6;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${billData.items.map(item => `
                    <tr>
                      <td style="padding: 8px; border-bottom: 1px solid #f8f9fa;">${item.description}</td>
                      <td style="padding: 8px; text-align: center; border-bottom: 1px solid #f8f9fa;">${item.quantity}</td>
                      <td style="padding: 8px; text-align: right; border-bottom: 1px solid #f8f9fa;">Rs ${item.total.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                  <tr style="border-top: 2px solid #006bb8; font-weight: bold;">
                    <td colspan="2" style="padding: 10px;">Total Amount:</td>
                    <td style="padding: 10px; text-align: right; color: #006bb8;">Rs ${billData.total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p>If you have any questions about this bill, please don't hesitate to contact us.</p>
            
            <p>Thank you for choosing Berghaus Bungalow. We hope you had a wonderful stay!</p>
            
            <p>Best regards,<br/>
            <strong>Berghaus Bungalow Team</strong></p>
          </div>
          
          <div style="background: #006bb8; color: white; padding: 15px; text-align: center;">
            <p><strong>Contact Information</strong></p>
            <p>📞 +94 11 234 5678 | 📧 info@berghausbungalow.com | 🌐 www.berghausbungalow.com</p>
            <p>123 Mountain View Road, Hill Station, Sri Lanka 20000</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `bill-${billData.bookingReference}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log('Bill email sent successfully to:', billData.guestEmail);
  } catch (error) {
    console.error('Failed to send bill email:', error);
    throw error;
  }
};

// Generic send email function
const sendEmail = async (emailData) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      const error = new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.');
      console.error('Email configuration error:', error.message);
      throw error;  // Throw instead of silent return
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@hms.com',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', emailData.to);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendBookingConfirmation,
  sendBookingCancellation,
  sendBookingReminder,
  sendCheckinEmail,
  sendCheckoutEmailWithAttachment,
  sendPaymentStatusEmail,
  sendBillEmail
};