const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test credentials
const testCredentials = {
  employeeId: 'EMP001',
  password: 'EMP001'
};

async function testLeaveDetailed() {
  try {
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/staff/login`, testCredentials);
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed');
      return;
    }
    
    const authToken = loginResponse.data.token;
    const staffId = loginResponse.data.staff._id;
    
    console.log('✅ Login successful');
    console.log(`   Staff ID: ${staffId}`);
    console.log(`   Name: ${loginResponse.data.staff.fullName}`);
    
    // Test creating leave request with detailed error logging
    console.log('\n🏖️ Testing Leave Request Creation...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    const leaveData = {
      leaveType: 'casual',
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: dayAfter.toISOString().split('T')[0],
      reason: 'Test leave request for system verification'
    };
    
    console.log('Leave data:', leaveData);
    
    try {
      const leaveResponse = await axios.post(`${API_BASE}/leaves`, leaveData, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Leave request created successfully');
      console.log('Response:', leaveResponse.data);
    } catch (error) {
      console.log('❌ Leave request creation failed');
      console.log('Status:', error.response?.status);
      console.log('Error data:', error.response?.data);
      console.log('Full error:', error.message);
      
      if (error.response?.data?.error) {
        console.log('Detailed error:', error.response.data.error);
      }
    }
    
    // Test getting my leave requests
    console.log('\n📋 Testing Get My Leave Requests...');
    try {
      const myLeavesResponse = await axios.get(`${API_BASE}/leaves/my-requests`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ My leave requests retrieved successfully');
      console.log('Response:', myLeavesResponse.data);
    } catch (error) {
      console.log('❌ Failed to get my leave requests');
      console.log('Status:', error.response?.status);
      console.log('Error data:', error.response?.data);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testLeaveDetailed();
