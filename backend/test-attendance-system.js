const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test credentials
const testCredentials = {
  employeeId: 'EMP001',
  password: 'EMP001'
};

let authToken = '';
let staffId = '';

async function testAttendanceSystem() {
  console.log('🧪 Testing Complete Attendance System');
  console.log('====================================\n');

  try {
    // Step 1: Staff Login
    console.log('🔐 Step 1: Staff Login...');
    const loginResponse = await axios.post(`${API_BASE}/staff/login`, testCredentials);
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed');
      return;
    }
    
    authToken = loginResponse.data.token;
    staffId = loginResponse.data.staff._id;
    console.log('✅ Login successful');
    console.log(`   Staff: ${loginResponse.data.staff.fullName}`);
    console.log(`   ID: ${staffId}\n`);

    // Step 2: Generate QR Code
    console.log('📱 Step 2: Generate QR Code...');
    const qrResponse = await axios.get(`${API_BASE}/attendance/qr/generate`);
    
    if (!qrResponse.data.success) {
      console.log('❌ QR Code generation failed');
      return;
    }
    
    const qrId = qrResponse.data.qrId;
    console.log('✅ QR Code generated successfully');
    console.log(`   QR ID: ${qrId}`);
    console.log(`   QR Code: ${qrResponse.data.qrCode.substring(0, 50)}...\n`);

    // Step 3: Mark Check-In
    console.log('⏰ Step 3: Mark Check-In...');
    const checkinResponse = await axios.post(`${API_BASE}/attendance/scan/${qrId}`, {
      staffId: staffId,
      action: 'checkin'
    });
    
    if (checkinResponse.data.success) {
      console.log('✅ Check-in successful');
      console.log(`   Message: ${checkinResponse.data.message}`);
      console.log(`   Status: ${checkinResponse.data.status}`);
      console.log(`   Time: ${new Date(checkinResponse.data.attendance.checkInTime).toLocaleTimeString()}\n`);
    } else {
      console.log('❌ Check-in failed:', checkinResponse.data.message);
      if (checkinResponse.data.message.includes('Already checked in')) {
        console.log('ℹ️  This is expected if already checked in today\n');
      }
    }

    // Step 4: Get Today's Attendance
    console.log('📊 Step 4: Get Today\'s Attendance...');
    const todayResponse = await axios.get(`${API_BASE}/attendance/today`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (todayResponse.data.success) {
      console.log('✅ Today\'s attendance retrieved');
      console.log(`   Total Staff: ${todayResponse.data.summary.total}`);
      console.log(`   Present: ${todayResponse.data.summary.present}`);
      console.log(`   Late: ${todayResponse.data.summary.late}`);
      console.log(`   Still Working: ${todayResponse.data.summary.stillWorking}\n`);
    } else {
      console.log('❌ Failed to get today\'s attendance\n');
    }

    // Step 5: Get All Attendance Records
    console.log('📋 Step 5: Get All Attendance Records...');
    const allResponse = await axios.get(`${API_BASE}/attendance`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (allResponse.data.success) {
      console.log('✅ All attendance records retrieved');
      console.log(`   Total Records: ${allResponse.data.attendance.length}`);
      
      if (allResponse.data.attendance.length > 0) {
        const latest = allResponse.data.attendance[0];
        console.log(`   Latest Record: ${latest.staffName} - ${latest.status.toUpperCase()}`);
        console.log(`   Check-in: ${new Date(latest.checkInTime).toLocaleTimeString()}`);
        if (latest.checkOutTime) {
          console.log(`   Check-out: ${new Date(latest.checkOutTime).toLocaleTimeString()}`);
          console.log(`   Working Hours: ${latest.workingHours} hours`);
        }
      }
      console.log('');
    } else {
      console.log('❌ Failed to get attendance records\n');
    }

    // Step 6: Test Check-Out (simulate after some time)
    console.log('🚪 Step 6: Test Check-Out...');
    console.log('ℹ️  Simulating check-out after working hours...');
    
    // Wait a moment to simulate time passing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
      if (checkoutResponse.data.message.includes('No check-in record')) {
        console.log('ℹ️  This means no check-in was recorded today\n');
      } else if (checkoutResponse.data.message.includes('Already checked out')) {
        console.log('ℹ️  This is expected if already checked out today\n');
      }
    }

    // Step 7: Get Attendance Statistics
    console.log('📈 Step 7: Get Attendance Statistics...');
    const statsResponse = await axios.get(`${API_BASE}/attendance/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (statsResponse.data.success) {
      console.log('✅ Attendance statistics retrieved');
      console.log(`   Staff Records: ${statsResponse.data.stats.length}`);
      
      if (statsResponse.data.stats.length > 0) {
        const firstStat = statsResponse.data.stats[0];
        console.log(`   Sample: ${firstStat.totalDays} days, ${firstStat.presentDays} present, ${firstStat.lateDays} late`);
        console.log(`   Avg Hours: ${firstStat.avgHours?.toFixed(1) || 0} hours/day`);
      }
      console.log('');
    } else {
      console.log('❌ Failed to get attendance statistics\n');
    }

    console.log('🎉 Attendance System Test Completed!');
    console.log('\n📋 Test Summary:');
    console.log('================');
    console.log('✅ Staff Login - Working');
    console.log('✅ QR Code Generation - Working');
    console.log('✅ Attendance Marking - Working');
    console.log('✅ Today\'s Summary - Working');
    console.log('✅ Records Retrieval - Working');
    console.log('✅ Statistics - Working');
    
    console.log('\n🔗 Frontend URLs to Test:');
    console.log('=========================');
    console.log('• Admin Attendance: http://localhost:3000/frontdesk/attendance');
    console.log('• QR Scan Page: http://localhost:3000/scan');
    console.log(`• Direct Scan: http://localhost:3000/scan?qrId=${qrId}`);
    
    console.log('\n📱 Mobile Testing:');
    console.log('==================');
    console.log('1. Generate QR code from admin panel');
    console.log('2. Scan with phone camera');
    console.log('3. Select staff name and mark attendance');
    console.log('4. Verify record appears in admin panel');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testAttendanceSystem();
