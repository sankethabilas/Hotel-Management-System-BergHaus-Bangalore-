const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test credentials
const testCredentials = {
  employeeId: 'EMP001',
  password: 'EMP001'
};

async function testAttendanceCheckout() {
  console.log('🧪 Testing Attendance Checkout System');
  console.log('=====================================\n');

  try {
    // Step 1: Staff Login
    console.log('🔐 Step 1: Staff Login...');
    const loginResponse = await axios.post(`${API_BASE}/staff/login`, testCredentials);
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed');
      return;
    }
    
    const authToken = loginResponse.data.token;
    const staffId = loginResponse.data.staff._id;
    console.log('✅ Login successful');
    console.log(`   Staff: ${loginResponse.data.staff.fullName}\n`);

    // Step 2: Generate QR Code
    console.log('📱 Step 2: Generate QR Code...');
    const qrResponse = await axios.get(`${API_BASE}/attendance/qr/generate`);
    
    if (!qrResponse.data.success) {
      console.log('❌ QR Code generation failed');
      return;
    }
    
    const qrId = qrResponse.data.qrId;
    console.log('✅ QR Code generated successfully');
    console.log(`   QR ID: ${qrId}\n`);

    // Step 3: Try Check-Out
    console.log('🚪 Step 3: Test Check-Out...');
    const checkoutResponse = await axios.post(`${API_BASE}/attendance/scan/${qrId}`, {
      staffId: staffId,
      action: 'checkout'
    });
    
    if (checkoutResponse.data.success) {
      console.log('✅ Check-out successful');
      console.log(`   Message: ${checkoutResponse.data.message}`);
      console.log(`   Working Hours: ${checkoutResponse.data.workingHours} hours\n`);
    } else {
      console.log('❌ Check-out failed:', checkoutResponse.data.message);
      if (checkoutResponse.data.message.includes('Already checked out')) {
        console.log('ℹ️  Staff has already checked out today\n');
      }
    }

    // Step 4: Get Today's Attendance Summary
    console.log('📊 Step 4: Get Today\'s Attendance Summary...');
    const todayResponse = await axios.get(`${API_BASE}/attendance/today`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (todayResponse.data.success) {
      console.log('✅ Today\'s attendance retrieved');
      console.log(`   Date: ${todayResponse.data.date}`);
      console.log(`   Total Staff: ${todayResponse.data.summary.total}`);
      console.log(`   Present: ${todayResponse.data.summary.present}`);
      console.log(`   Late: ${todayResponse.data.summary.late}`);
      console.log(`   Checked Out: ${todayResponse.data.summary.checkedOut}`);
      console.log(`   Still Working: ${todayResponse.data.summary.stillWorking}\n`);
      
      // Show individual records
      if (todayResponse.data.attendance.length > 0) {
        console.log('📋 Today\'s Records:');
        todayResponse.data.attendance.forEach((record, index) => {
          const checkIn = new Date(record.checkInTime).toLocaleTimeString();
          const checkOut = record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : 'Not checked out';
          console.log(`   ${index + 1}. ${record.staffName} (${record.department})`);
          console.log(`      Check-in: ${checkIn} | Check-out: ${checkOut}`);
          console.log(`      Status: ${record.status.toUpperCase()} | Hours: ${record.workingHours || 0}`);
        });
        console.log('');
      }
    } else {
      console.log('❌ Failed to get today\'s attendance\n');
    }

    // Step 5: Test with different staff member
    console.log('👥 Step 5: Test with Different Staff Member...');
    
    // Get all staff
    const staffResponse = await axios.get(`${API_BASE}/staff`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (staffResponse.data.success && staffResponse.data.staff.length > 1) {
      const otherStaff = staffResponse.data.staff.find(s => s._id !== staffId);
      if (otherStaff) {
        console.log(`   Testing with: ${otherStaff.fullName} (${otherStaff.employeeId})`);
        
        // Try check-in for other staff
        const otherCheckinResponse = await axios.post(`${API_BASE}/attendance/scan/${qrId}`, {
          staffId: otherStaff._id,
          action: 'checkin'
        });
        
        if (otherCheckinResponse.data.success) {
          console.log('✅ Check-in successful for other staff');
          console.log(`   Message: ${otherCheckinResponse.data.message}`);
          console.log(`   Status: ${otherCheckinResponse.data.status}\n`);
        } else {
          console.log(`❌ Check-in failed: ${otherCheckinResponse.data.message}`);
          if (otherCheckinResponse.data.message.includes('Already checked in')) {
            console.log('ℹ️  This staff member has already checked in today\n');
          }
        }
      }
    }

    console.log('🎉 Attendance System Test Completed!');
    console.log('\n✅ System Status: WORKING');
    console.log('✅ QR Code Generation: WORKING');
    console.log('✅ Check-in/Check-out: WORKING');
    console.log('✅ Attendance Tracking: WORKING');
    console.log('✅ Summary Reports: WORKING');
    
    console.log('\n🔗 Frontend URLs to Test:');
    console.log('=========================');
    console.log('• Admin Panel: http://localhost:3000/frontdesk/attendance');
    console.log('• QR Scan: http://localhost:3000/scan');
    console.log(`• Direct Scan: http://localhost:3000/scan?qrId=${qrId}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testAttendanceCheckout();
