const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test credentials
const testCredentials = {
  employeeId: 'EMP001',
  password: 'EMP001'
};

let authToken = '';
let staffId = '';

async function testStaffLogin() {
  try {
    console.log('🔐 Testing Staff Login...');
    const response = await axios.post(`${API_BASE}/staff/login`, testCredentials);
    
    if (response.data.success) {
      authToken = response.data.token;
      staffId = response.data.staff._id;
      console.log('✅ Login successful');
      console.log(`   Token: ${authToken.substring(0, 20)}...`);
      console.log(`   Staff ID: ${staffId}`);
      console.log(`   Name: ${response.data.staff.fullName}`);
      return true;
    }
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testAttendanceFeatures() {
  try {
    console.log('\n📊 Testing Attendance Features...');
    
    // Test QR code generation
    console.log('1. Testing QR Code Generation...');
    const qrResponse = await axios.get(`${API_BASE}/attendance/qr/generate`);
    if (qrResponse.data.success) {
      console.log('✅ QR Code generated successfully');
      const qrId = qrResponse.data.qrId;
      
      // Test attendance marking
      console.log('2. Testing Attendance Marking...');
      const attendanceResponse = await axios.post(`${API_BASE}/attendance/scan/${qrId}`, {
        staffId: staffId,
        action: 'checkin'
      });
      
      if (attendanceResponse.data.success) {
        console.log('✅ Attendance marked successfully');
        console.log(`   Message: ${attendanceResponse.data.message}`);
      } else {
        console.log('❌ Attendance marking failed:', attendanceResponse.data.message);
      }
    } else {
      console.log('❌ QR Code generation failed');
    }
    
    // Test getting attendance records
    console.log('3. Testing Get Attendance Records...');
    const attendanceListResponse = await axios.get(`${API_BASE}/attendance`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (attendanceListResponse.data.success) {
      console.log('✅ Attendance records retrieved successfully');
      console.log(`   Records count: ${attendanceListResponse.data.attendance.length}`);
    } else {
      console.log('❌ Failed to get attendance records');
    }
    
  } catch (error) {
    console.log('❌ Attendance test failed:', error.response?.data?.message || error.message);
  }
}

async function testLeaveFeatures() {
  try {
    console.log('\n🏖️ Testing Leave Features...');
    
    // Test creating leave request
    console.log('1. Testing Leave Request Creation...');
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
    
    const leaveResponse = await axios.post(`${API_BASE}/leaves`, leaveData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (leaveResponse.data.success) {
      console.log('✅ Leave request created successfully');
      console.log(`   Leave ID: ${leaveResponse.data.leave._id}`);
      console.log(`   Status: ${leaveResponse.data.leave.status}`);
    } else {
      console.log('❌ Leave request creation failed');
    }
    
    // Test getting my leave requests
    console.log('2. Testing Get My Leave Requests...');
    const myLeavesResponse = await axios.get(`${API_BASE}/leaves/my-requests`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (myLeavesResponse.data.success) {
      console.log('✅ My leave requests retrieved successfully');
      console.log(`   Requests count: ${myLeavesResponse.data.leaves.length}`);
    } else {
      console.log('❌ Failed to get my leave requests');
    }
    
  } catch (error) {
    console.log('❌ Leave test failed:', error.response?.data?.message || error.message);
    console.log('   Status:', error.response?.status);
    console.log('   URL:', error.config?.url);
  }
}

async function testPaymentFeatures() {
  try {
    console.log('\n💰 Testing Payment Features...');
    
    // Test getting payment history
    console.log('1. Testing Get Payment History...');
    const paymentResponse = await axios.get(`${API_BASE}/payments/staff/${staffId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (paymentResponse.data.success) {
      console.log('✅ Payment history retrieved successfully');
      console.log(`   Payments count: ${paymentResponse.data.payments.length}`);
      if (paymentResponse.data.staff) {
        console.log(`   Staff: ${paymentResponse.data.staff.fullName}`);
      }
    } else {
      console.log('❌ Failed to get payment history');
    }
    
  } catch (error) {
    console.log('❌ Payment test failed:', error.response?.data?.message || error.message);
    console.log('   Status:', error.response?.status);
    console.log('   URL:', error.config?.url);
  }
}

async function runAllTests() {
  console.log('🧪 Testing Staff Management Features');
  console.log('=====================================\n');
  
  const loginSuccess = await testStaffLogin();
  
  if (loginSuccess) {
    await testAttendanceFeatures();
    await testLeaveFeatures();
    await testPaymentFeatures();
  } else {
    console.log('❌ Cannot proceed with tests - login failed');
  }
  
  console.log('\n🏁 Test completed!');
  console.log('\n💡 Troubleshooting Tips:');
  console.log('- Make sure backend server is running: cd backend && npm start');
  console.log('- Check MongoDB connection');
  console.log('- Verify staff exists: node check-staff-login.js');
  console.log('- Check server logs for detailed error messages');
}

runAllTests();
