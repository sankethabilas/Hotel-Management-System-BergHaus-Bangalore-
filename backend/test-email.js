const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  try {
    console.log('Testing email configuration...');
    console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***configured***' : 'NOT SET');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('❌ Email not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env file');
      return;
    }

    const transporter = nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Verify configuration
    await transporter.verify();
    console.log('✅ Email service is ready to send messages');

    // Send test email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'HMS Email Test',
      html: '<h1>Email service is working!</h1><p>This is a test email from your HMS system.</p>'
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('💡 Tip: Make sure you\'re using an App Password, not your regular Gmail password');
    }
    if (error.message.includes('Less secure app access')) {
      console.log('💡 Tip: Enable "Less secure app access" or use App Passwords');
    }
  }
}

testEmail();
