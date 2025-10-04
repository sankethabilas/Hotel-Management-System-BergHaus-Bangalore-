const FormData = require('form-data');
const fetch = require('node-fetch');

async function testFeedbackAPI() {
  try {
    console.log('🧪 Testing Feedback API with FormData...');
    
    const formData = new FormData();
    formData.append('name', 'Test User');
    formData.append('email', 'test@example.com');
    formData.append('category', 'Front Desk');
    formData.append('rating', JSON.stringify({
      checkIn: 5,
      roomQuality: 4,
      cleanliness: 5,
      dining: 3,
      amenities: 4
    }));
    formData.append('comments', 'This is a test feedback submission');
    formData.append('anonymous', 'false');
    
    const response = await fetch('http://localhost:5000/api/feedback', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Feedback API test successful!');
    } else {
      console.log('❌ Feedback API test failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing feedback API:', error);
  }
}

testFeedbackAPI();
