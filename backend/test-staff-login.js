const axios = require('axios');

async function testStaffLogin() {
  const testCredentials = [
    { employeeId: 'EMP001', password: 'EMP001' },
    { employeeId: 'EMP2002', password: 'EMP2002' },
    { employeeId: 'EMP2003', password: 'EMP2003' },
    { employeeId: 'EMP2004', password: 'EMP2004' },
    { employeeId: 'EMP2005', password: 'EMP2005' }
  ];

  console.log('🧪 Testing Staff Login API...\n');

  for (const credentials of testCredentials) {
    try {
      console.log(`Testing login for ${credentials.employeeId}...`);
      
      const response = await axios.post('http://localhost:5000/api/staff/login', credentials, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      if (response.data.success) {
        console.log(`✅ SUCCESS: ${credentials.employeeId}`);
        console.log(`   Name: ${response.data.staff.fullName}`);
        console.log(`   Role: ${response.data.staff.jobRole}`);
        console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
      } else {
        console.log(`❌ FAILED: ${credentials.employeeId} - ${response.data.message}`);
      }
    } catch (error) {
      if (error.response) {
        console.log(`❌ FAILED: ${credentials.employeeId} - ${error.response.data.message || error.response.statusText}`);
        console.log(`   Status: ${error.response.status}`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`❌ CONNECTION ERROR: Backend server is not running on http://localhost:5000`);
        console.log(`   Please start the backend server with: npm start or node server.js`);
        break;
      } else {
        console.log(`❌ ERROR: ${credentials.employeeId} - ${error.message}`);
      }
    }
    console.log('');
  }

  console.log('🔧 Troubleshooting Tips:');
  console.log('========================');
  console.log('1. Make sure backend server is running: cd backend && npm start');
  console.log('2. Check if MongoDB is connected');
  console.log('3. Verify staff exists in database: node check-staff-login.js');
  console.log('4. Use exact Employee ID format (e.g., EMP001, EMP2003)');
  console.log('5. Password should be the same as Employee ID');
}

testStaffLogin();
