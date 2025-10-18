require('dotenv').config();
const { sendEmail } = require('./services/emailService');

async function testEmailService() {
  console.log('🧪 Testing Email Service...');
  console.log('📧 Email User:', process.env.EMAIL_USER);
  console.log('🔐 Email Password:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not Set');
  
  try {
    // Test email configuration
    const testEmail = {
      to: 'test@example.com',
      subject: 'HMS Email Service Test',
      html: `
        <h1>Email Service Test</h1>
        <p>This is a test email from the HMS system.</p>
        <p>If you receive this, the email service is working correctly!</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `
    };
    
    await sendEmail(testEmail);
    console.log('✅ Email service test completed successfully!');
    console.log('📧 Email would be sent to:', testEmail.to);
    
  } catch (error) {
    console.error('❌ Email service test failed:', error.message);
    console.log('💡 This might be expected if email credentials are not fully configured');
  }
}

testEmailService();
