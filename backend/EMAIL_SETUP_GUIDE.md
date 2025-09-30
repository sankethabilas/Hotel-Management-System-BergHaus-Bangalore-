# 📧 Email Service Setup Guide

This guide will help you set up the email service for sending welcome emails and booking confirmations.

## 🚀 Quick Setup

### 1. Install Dependencies
The email service uses `nodemailer` which is already installed in your project.

### 2. Environment Variables
Add these variables to your `.env` file in the backend directory:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# SMTP Configuration (if using custom SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

### 3. Gmail Setup (Recommended)

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication

#### Step 2: Generate App Password
1. Go to Google Account → Security → App passwords
2. Generate a new app password for "Mail"
3. Use this password in your `EMAIL_PASSWORD` environment variable

#### Step 3: Update .env file
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

### 4. Alternative Email Services

#### Outlook/Hotmail
```env
EMAIL_SERVICE=hotmail
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

#### Yahoo
```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

#### Custom SMTP
```env
EMAIL_SERVICE=custom
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-password
```

## 📋 Features

### ✅ Welcome Emails
- **Trigger**: Sent when users register or login for the first time
- **Content**: Welcome message with account details and features
- **Template**: Beautiful HTML email with HMS branding

### ✅ Booking Confirmation Emails
- **Trigger**: Sent after successful booking creation
- **Content**: Booking details, room information, and confirmation
- **Template**: Professional booking confirmation with all details

## 🔧 Email Service Methods

### `sendWelcomeEmail(user)`
Sends a welcome email to new users with:
- Account information
- Available features
- Direct link to the system

### `sendBookingConfirmationEmail(user, bookingDetails)`
Sends booking confirmation with:
- Booking reference number
- Room details
- Check-in/out dates
- Total amount
- Booking status

## 🎨 Email Templates

The email service includes beautiful HTML templates with:
- **Responsive Design**: Works on all devices
- **HMS Branding**: Uses your color palette (#006bb8, #2fa0df, #ffc973)
- **Professional Layout**: Clean and modern design
- **Interactive Elements**: Buttons and links

## 🚨 Error Handling

The email service includes robust error handling:
- **Non-blocking**: Email failures don't affect user registration/booking
- **Logging**: All email attempts are logged
- **Fallback**: System continues to work even if email service is down

## 🧪 Testing

### Test Email Service
```javascript
const emailService = require('./services/emailService');

// Test welcome email
emailService.sendWelcomeEmail({
  firstName: 'John',
  lastName: 'Doe',
  email: 'test@example.com',
  role: 'guest'
});

// Test booking confirmation
emailService.sendBookingConfirmationEmail(
  { firstName: 'John', lastName: 'Doe', email: 'test@example.com' },
  {
    bookingReference: 'HMS-123456',
    roomNumber: '101',
    roomType: 'Deluxe',
    checkIn: '2024-01-15',
    checkOut: '2024-01-17',
    totalAmount: 299.99,
    status: 'confirmed'
  }
);
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "Invalid login" error
- **Solution**: Use App Password instead of regular password for Gmail
- **Check**: 2-Factor Authentication is enabled

#### 2. "Connection timeout" error
- **Solution**: Check SMTP settings and port numbers
- **Check**: Firewall settings

#### 3. Emails not sending
- **Solution**: Check email service configuration
- **Check**: Environment variables are set correctly

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

## 📱 Email Preview

### Welcome Email Features:
- 🎉 Welcome header with HMS branding
- 👤 User account information
- 🔍 System features overview
- 🚀 Call-to-action button
- 📧 Professional footer

### Booking Confirmation Features:
- ✅ Confirmation header
- 📋 Detailed booking information
- 🏨 Room and date details
- 💰 Payment information
- 📞 Contact information

## 🎯 Next Steps

1. **Configure Email Service**: Set up your email credentials
2. **Test Email Sending**: Verify emails are being sent
3. **Customize Templates**: Modify email templates if needed
4. **Monitor Email Delivery**: Check email delivery rates
5. **Add More Email Types**: Extend with more email templates

## 📞 Support

If you need help with email setup:
1. Check the console logs for error messages
2. Verify your email credentials
3. Test with a simple email first
4. Check your email service provider's documentation

---

**Note**: The email service is designed to be non-blocking, so your HMS system will continue to work even if email sending fails.
