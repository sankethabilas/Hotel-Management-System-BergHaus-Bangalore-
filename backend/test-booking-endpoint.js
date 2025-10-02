const axios = require('axios');

async function testBookingEndpoint() {
  try {
    console.log('=== TESTING BOOKING ENDPOINT ===');
    
    // Test if the server is running
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('Health check response:', healthResponse.status);
    
    // Test if the booking endpoint exists (this should return 401 since we're not authenticated)
    try {
      const bookingResponse = await axios.get('http://localhost:5000/api/booking/user/bookings');
      console.log('Booking endpoint response:', bookingResponse.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Booking endpoint exists and requires authentication (401 Unauthorized)');
      } else {
        console.log('❌ Booking endpoint error:', error.response?.status, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Server connection error:', error.message);
    console.log('Make sure the backend server is running on http://localhost:5000');
  }
}

testBookingEndpoint();
