const mongoose = require('mongoose');
const connectDB = require('./config/database');
const ContactMessage = require('./models/ContactMessage');

// Connect to database
connectDB();

/**
 * Create demo contact messages for testing CRM functionality
 */
async function createDemoContactMessages() {
  try {
    console.log('🗑️  Clearing existing contact messages...');
    
    // Clear existing contact messages
    await ContactMessage.deleteMany({});
    
    console.log('📧 Creating demo contact messages...');
    
    // Create demo contact messages
    const demoMessages = [
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
        respondedAt: new Date(),
        isRead: true
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
    
    // Insert demo messages
    const createdMessages = await ContactMessage.insertMany(demoMessages);
    
    console.log(`✅ Created ${createdMessages.length} demo contact messages`);
    console.log('📊 Message breakdown:');
    console.log(`   - New messages: ${createdMessages.filter(m => m.status === 'new').length}`);
    console.log(`   - In-progress: ${createdMessages.filter(m => m.status === 'in-progress').length}`);
    console.log(`   - Resolved: ${createdMessages.filter(m => m.status === 'resolved').length}`);
    console.log(`   - Closed: ${createdMessages.filter(m => m.status === 'closed').length}`);
    console.log(`   - With replies: ${createdMessages.filter(m => m.response).length}`);
    
    console.log('\n🎉 Demo contact messages created successfully!');
    console.log('You can now test the CRM functionality in the admin panel.');
    
  } catch (error) {
    console.error('❌ Error creating demo contact messages:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
}

// Run the script
createDemoContactMessages();
