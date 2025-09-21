const axios = require('axios');

// Test the Google signup endpoint
async function testGoogleSignup() {
  try {
    console.log('Testing Google signup endpoint...');
    
    const testUser = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      profilePic: 'https://example.com/profile.jpg',
      accountType: 'guest'
    };

    const response = await axios.post('http://localhost:5000/api/users/google-signup', testUser);
    
    console.log('✅ Google signup test successful!');
    console.log('Response:', response.data);
    
    // Test with existing user
    console.log('\nTesting with existing user...');
    const existingUserResponse = await axios.post('http://localhost:5000/api/users/google-signup', testUser);
    
    console.log('✅ Existing user test successful!');
    console.log('Response:', existingUserResponse.data);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testGoogleSignup();
