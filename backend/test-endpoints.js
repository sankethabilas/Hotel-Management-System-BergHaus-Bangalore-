const axios = require('axios');

async function testCRMEndpoints() {
  console.log('🧪 Testing CRM Reports Endpoints...\n');

  const endpoints = [
    'http://localhost:5000/api/crm-reports/loyalty?sortBy=points&sortOrder=desc',
    'http://localhost:5000/api/crm-reports/feedback?sortBy=createdAt&sortOrder=desc',
    'http://localhost:5000/api/crm-reports/offers?sortBy=createdAt&sortOrder=desc'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint}`);
      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': 'Bearer test-token' // This will fail auth but prove route exists
        },
        validateStatus: () => true // Accept any status code
      });
      
      if (response.status === 401 || response.status === 403) {
        console.log('✅ Endpoint exists! (401/403 Unauthorized - expected without valid token)');
      } else if (response.status === 404) {
        console.log('❌ Endpoint not found (404)');
      } else if (response.status === 500) {
        console.log('⚠️ Endpoint exists but server error (500)');
        console.log('Error:', response.data?.message || 'Internal server error');
      } else {
        console.log(`✅ Status: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Connection Error:', error.message);
      console.log('  Make sure backend server is running on port 5000');
    }
    console.log('');
  }
}

testCRMEndpoints();
