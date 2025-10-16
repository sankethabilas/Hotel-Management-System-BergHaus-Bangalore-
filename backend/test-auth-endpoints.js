const axios = require('axios');

async function testEndpoints() {
  console.log('🧪 Testing CRM Endpoints...\n');

  // Test without auth (using test routes)
  const testEndpoints = [
    'http://localhost:5000/api/crm-test/test-loyalty?sortBy=points&sortOrder=desc',
    'http://localhost:5000/api/crm-test/test-feedback?sortBy=createdAt&sortOrder=desc',
    'http://localhost:5000/api/crm-test/test-offers?sortBy=createdAt&sortOrder=desc'
  ];

  console.log('📝 Testing WITHOUT Auth (should work):');
  for (const endpoint of testEndpoints) {
    try {
      const response = await axios.get(endpoint, { validateStatus: () => true });
      if (response.status === 200) {
        console.log(`✅ ${endpoint.split('/').pop()}: SUCCESS (${response.status})`);
      } else {
        console.log(`⚠️ ${endpoint.split('/').pop()}: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.split('/').pop()}: ${error.message}`);
    }
  }

  console.log('\n🔐 Testing WITH Auth Required (should fail without token):');
  const authEndpoints = [
    'http://localhost:5000/api/crm-reports/loyalty',
    'http://localhost:5000/api/crm-reports/feedback',
    'http://localhost:5000/api/crm-reports/offers'
  ];

  for (const endpoint of authEndpoints) {
    try {
      const response = await axios.get(endpoint, { validateStatus: () => true });
      if (response.status === 401 || response.status === 403) {
        console.log(`✅ ${endpoint.split('/').pop()}: Protected (${response.status})`);
      } else {
        console.log(`⚠️ ${endpoint.split('/').pop()}: Unexpected status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.split('/').pop()}: ${error.message}`);
    }
  }
}

testEndpoints();
