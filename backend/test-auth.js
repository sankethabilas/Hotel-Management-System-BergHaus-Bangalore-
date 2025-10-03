const axios = require('axios');

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    // Test 1: Try to access protected endpoint without token
    console.log('\n1. Testing without token:');
    try {
      await axios.get('http://localhost:5000/api/bookings/user/bookings');
    } catch (error) {
      console.log('Expected error:', error.response?.data?.message);
    }
    
    // Test 2: Try to login first
    console.log('\n2. Testing login:');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'Test123'
    });
    
    if (loginResponse.data.success) {
      console.log('Login successful!');
      const token = loginResponse.data.data.token;
      
      // Test 3: Try to access protected endpoint with token
      console.log('\n3. Testing with token:');
      const bookingsResponse = await axios.get('http://localhost:5000/api/bookings/user/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Bookings response:', bookingsResponse.data);
    } else {
      console.log('Login failed:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testAuth();
