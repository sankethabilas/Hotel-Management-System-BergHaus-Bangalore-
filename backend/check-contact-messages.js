const mongoose = require('mongoose');
const connectDB = require('./config/database');
const ContactMessage = require('./models/ContactMessage');

// Connect to database
connectDB();

async function checkContactMessages() {
  try {
    console.log('🔍 Checking ContactMessage table...');
    
    // Check if there are any messages
    const count = await ContactMessage.countDocuments();
    console.log(`📊 Total contact messages in database: ${count}`);
    
    if (count === 0) {
      console.log('📝 No messages found. Creating sample data...');
      
      // Create sample contact messages
      const sampleMessages = [
        {
          fullName: 'John Smith',
          email: 'john.smith@example.com',
          phone: '+1-555-0123',
          subject: 'Room Booking Inquiry',
          message: 'Hi, I would like to book a room for 2 nights from March 15-17. Do you have availability for a double room?',
          reasonForContact: 'booking',
          status: 'new',
          priority: 'medium',
          isRead: false
        },
        {
          fullName: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          phone: '+1-555-0456',
          subject: 'Complaint about room service',
          message: 'I stayed at your hotel last week and was disappointed with the room service. The food was cold and took over an hour to arrive.',
          reasonForContact: 'complaint',
          status: 'in-progress',
          priority: 'high',
          isRead: true,
          response: 'Dear Sarah, I apologize for the poor room service experience. We have addressed this issue with our kitchen staff and implemented new procedures to ensure faster, hotter food delivery. Please accept our sincere apologies and a 20% discount on your next stay.',
          respondedAt: new Date()
        },
        {
          fullName: 'Mike Wilson',
          email: 'mike.wilson@corp.com',
          phone: '+1-555-0789',
          subject: 'Corporate Event Planning',
          message: 'We are planning a corporate retreat for 50 people in April. Do you have conference facilities and group accommodation packages?',
          reasonForContact: 'corporate',
          status: 'resolved',
          priority: 'low',
          isRead: true,
          response: 'Dear Mike, Thank you for your interest in our corporate packages. We have excellent conference facilities and can accommodate groups of up to 60 people. I will send you our detailed corporate package information via email.',
          respondedAt: new Date()
        },
        {
          fullName: 'Emily Davis',
          email: 'emily.davis@example.com',
          phone: '+1-555-0321',
          subject: 'Wedding Reception Inquiry',
          message: 'I am planning my wedding reception for June 2024. Do you offer wedding packages and what are your capacity limits?',
          reasonForContact: 'event',
          status: 'new',
          priority: 'medium',
          isRead: false
        },
        {
          fullName: 'Robert Brown',
          email: 'robert.brown@example.com',
          phone: '+1-555-0654',
          subject: 'General Information Request',
          message: 'What are your check-in and check-out times? Also, do you provide airport shuttle service?',
          reasonForContact: 'other',
          status: 'closed',
          priority: 'low',
          isRead: true,
          response: 'Dear Robert, Our check-in time is 3:00 PM and check-out is 11:00 AM. We do provide airport shuttle service for an additional fee. Please contact our front desk for shuttle scheduling.',
          respondedAt: new Date()
        }
      ];
      
      const createdMessages = await ContactMessage.insertMany(sampleMessages);
      console.log(`✅ Created ${createdMessages.length} sample contact messages`);
    }
    
    // Get all messages and display them
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    console.log('\n📋 Contact Messages in Database:');
    console.log('================================');
    
    messages.forEach((msg, index) => {
      console.log(`${index + 1}. ${msg.fullName} (${msg.email})`);
      console.log(`   Subject: ${msg.subject}`);
      console.log(`   Status: ${msg.status} | Priority: ${msg.priority} | Read: ${msg.isRead}`);
      console.log(`   Reason: ${msg.reasonForContact}`);
      console.log(`   Created: ${msg.createdAt.toLocaleDateString()}`);
      if (msg.response) {
        console.log(`   Response: ${msg.response.substring(0, 50)}...`);
      }
      console.log('   ---');
    });
    
    console.log(`\n🎉 Total messages: ${messages.length}`);
    console.log('✅ ContactMessage table is ready for CRM!');
    
  } catch (error) {
    console.error('❌ Error checking ContactMessage table:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
}

// Run the script
checkContactMessages();
