const mongoose = require('mongoose');
const connectDB = require('./config/database');
const Feedback = require('./models/Feedback');

// Connect to database
connectDB();

/**
 * Create demo feedback data for testing the feedback system
 */
async function createDemoFeedback() {
  try {
    console.log('🗑️  Clearing existing feedback...');
    
    // Clear existing feedback
    await Feedback.deleteMany({});
    
    console.log('📝 Creating demo feedback...');
    
    // Create demo feedback entries
    const demoFeedback = [
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        category: 'Front Desk',
        rating: {
          checkIn: 5,
          roomQuality: 4,
          cleanliness: 5,
          dining: 3,
          amenities: 4
        },
        comments: 'Excellent check-in experience! The staff was very welcoming and helpful. The room was clean and comfortable. The dining could be improved - food was good but service was slow.',
        images: [],
        anonymous: false,
        status: 'Pending'
      },
      {
        name: 'Mike Wilson',
        email: 'mike.wilson@example.com',
        category: 'Restaurant',
        rating: {
          checkIn: 4,
          roomQuality: 5,
          cleanliness: 5,
          dining: 5,
          amenities: 4
        },
        comments: 'Amazing dining experience! The food was delicious and the service was outstanding. The room was perfect with great amenities. Highly recommend!',
        images: [],
        anonymous: false,
        status: 'Reviewed',
        adminResponse: 'Thank you for your wonderful feedback! We are delighted to hear about your positive dining experience. We will share your comments with our restaurant team.',
        respondedAt: new Date()
      },
      {
        name: 'Anonymous',
        email: 'anonymous@example.com',
        category: 'Room Service',
        rating: {
          checkIn: 3,
          roomQuality: 2,
          cleanliness: 3,
          dining: 4,
          amenities: 3
        },
        comments: 'Room service was slow and the room had some maintenance issues. The dining was good though. Overall okay stay but could be better.',
        images: [],
        anonymous: true,
        status: 'Responded',
        adminResponse: 'We apologize for the issues you experienced with room service and maintenance. We have addressed these concerns with our team to ensure better service in the future.',
        respondedAt: new Date()
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        category: 'Facilities',
        rating: {
          checkIn: 5,
          roomQuality: 5,
          cleanliness: 5,
          dining: 5,
          amenities: 5
        },
        comments: 'Perfect stay! Everything was exceptional - from check-in to facilities. The amenities were top-notch and the staff was incredibly friendly. Will definitely come back!',
        images: [],
        anonymous: false,
        status: 'Closed'
      },
      {
        name: 'Robert Brown',
        email: 'robert.brown@example.com',
        category: 'Management',
        rating: {
          checkIn: 4,
          roomQuality: 4,
          cleanliness: 4,
          dining: 4,
          amenities: 4
        },
        comments: 'Good overall experience. The management team was responsive to our needs. Some minor issues but they were resolved quickly. Would recommend to others.',
        images: [],
        anonymous: false,
        status: 'Pending'
      },
      {
        name: 'Lisa Anderson',
        email: 'lisa.anderson@example.com',
        category: 'Front Desk',
        rating: {
          checkIn: 2,
          roomQuality: 3,
          cleanliness: 2,
          dining: 3,
          amenities: 3
        },
        comments: 'Check-in process was confusing and took too long. Room was not as clean as expected. Some amenities were not working properly. Not satisfied with the overall experience.',
        images: [],
        anonymous: false,
        status: 'Pending'
      },
      {
        name: 'David Miller',
        email: 'david.miller@example.com',
        category: 'Restaurant',
        rating: {
          checkIn: 5,
          roomQuality: 5,
          cleanliness: 5,
          dining: 5,
          amenities: 5
        },
        comments: 'Outstanding experience! The restaurant exceeded our expectations. Food quality was excellent and the service was impeccable. The room was spotless and all amenities worked perfectly.',
        images: [],
        anonymous: false,
        status: 'Reviewed'
      },
      {
        name: 'Anonymous',
        email: 'anonymous2@example.com',
        category: 'Room Service',
        rating: {
          checkIn: 4,
          roomQuality: 4,
          cleanliness: 4,
          dining: 4,
          amenities: 4
        },
        comments: 'Good stay overall. Room service was prompt and food was tasty. Room was clean and comfortable. Minor issues with some amenities but nothing major.',
        images: [],
        anonymous: true,
        status: 'Closed'
      }
    ];
    
    // Insert demo feedback
    const createdFeedback = await Feedback.insertMany(demoFeedback);
    
    console.log(`✅ Created ${createdFeedback.length} demo feedback entries`);
    console.log('📊 Feedback breakdown:');
    console.log(`   - Pending: ${createdFeedback.filter(f => f.status === 'Pending').length}`);
    console.log(`   - Reviewed: ${createdFeedback.filter(f => f.status === 'Reviewed').length}`);
    console.log(`   - Responded: ${createdFeedback.filter(f => f.status === 'Responded').length}`);
    console.log(`   - Closed: ${createdFeedback.filter(f => f.status === 'Closed').length}`);
    console.log(`   - Anonymous: ${createdFeedback.filter(f => f.anonymous).length}`);
    
    // Calculate average ratings
    const avgRatings = createdFeedback.reduce((acc, feedback) => {
      acc.checkIn += feedback.rating.checkIn;
      acc.roomQuality += feedback.rating.roomQuality;
      acc.cleanliness += feedback.rating.cleanliness;
      acc.dining += feedback.rating.dining;
      acc.amenities += feedback.rating.amenities;
      return acc;
    }, { checkIn: 0, roomQuality: 0, cleanliness: 0, dining: 0, amenities: 0 });
    
    const total = createdFeedback.length;
    console.log('\n📈 Average Ratings:');
    console.log(`   - Check-in: ${(avgRatings.checkIn / total).toFixed(1)}/5`);
    console.log(`   - Room Quality: ${(avgRatings.roomQuality / total).toFixed(1)}/5`);
    console.log(`   - Cleanliness: ${(avgRatings.cleanliness / total).toFixed(1)}/5`);
    console.log(`   - Dining: ${(avgRatings.dining / total).toFixed(1)}/5`);
    console.log(`   - Amenities: ${(avgRatings.amenities / total).toFixed(1)}/5`);
    
    console.log('\n🎉 Demo feedback created successfully!');
    console.log('You can now test the feedback system in the admin panel.');
    
  } catch (error) {
    console.error('❌ Error creating demo feedback:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
}

// Run the script
createDemoFeedback();
