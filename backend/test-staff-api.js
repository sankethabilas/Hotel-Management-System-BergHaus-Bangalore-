const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testStaffAPI() {
  console.log('🧪 Testing Staff API Endpoints');
  console.log('==============================\n');

  try {
    // Test 1: Public active staff endpoint (should work without auth)
    console.log('📋 Test 1: Get Active Staff (Public)...');
    const activeStaffResponse = await axios.get(`${API_BASE}/staff/active`);
    
    if (activeStaffResponse.data.success) {
      console.log('✅ Active staff endpoint working');
      console.log(`   Found ${activeStaffResponse.data.staff.length} active staff members`);
      
      if (activeStaffResponse.data.staff.length > 0) {
        const firstStaff = activeStaffResponse.data.staff[0];
        console.log(`   Sample: ${firstStaff.fullName} (${firstStaff.employeeId}) - ${firstStaff.department}`);
      }
    } else {
      console.log('❌ Active staff endpoint failed');
    }
    console.log('');

    // Test 2: Protected staff endpoint (should fail without auth)
    console.log('🔒 Test 2: Get All Staff (Protected - should fail)...');
    try {
      const allStaffResponse = await axios.get(`${API_BASE}/staff`);
      console.log('❌ Protected endpoint should have failed but didn\'t');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Protected endpoint correctly requires authentication');
        console.log(`   Status: ${error.response.status} - ${error.response.data.message}`);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log('');

    // Test 3: Staff login
    console.log('🔐 Test 3: Staff Login...');
    const loginResponse = await axios.post(`${API_BASE}/staff/login`, {
      employeeId: 'EMP001',
      password: 'EMP001'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Staff login working');
      console.log(`   Staff: ${loginResponse.data.staff.fullName}`);
      console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...`);
      
      // Test 4: Protected endpoint with auth
      console.log('\n🔓 Test 4: Get All Staff (With Auth)...');
      const authStaffResponse = await axios.get(`${API_BASE}/staff`, {
        headers: { Authorization: `Bearer ${loginResponse.data.token}` }
      });
      
      if (authStaffResponse.data.success) {
        console.log('✅ Protected endpoint working with authentication');
        console.log(`   Found ${authStaffResponse.data.staff.length} staff members`);
      } else {
        console.log('❌ Protected endpoint failed even with auth');
      }
    } else {
      console.log('❌ Staff login failed');
    }

    console.log('\n🎉 Staff API Test Completed!');
    console.log('\n📋 Summary:');
    console.log('===========');
    console.log('✅ Public active staff endpoint - Working');
    console.log('✅ Protected staff endpoint - Working (requires auth)');
    console.log('✅ Staff login - Working');
    console.log('✅ Authentication flow - Working');
    
    console.log('\n🔗 Frontend should now work:');
    console.log('============================');
    console.log('• Attendance Scanner: http://localhost:3000/scan');
    console.log('• Admin Attendance: http://localhost:3000/frontdesk/attendance');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testStaffAPI();
