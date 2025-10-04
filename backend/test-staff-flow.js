const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testStaffFlow() {
  console.log('🧪 Testing Complete Staff Login & Password Change Flow...\n');

  try {
    // Test 1: Staff Login with Employee ID
    console.log('1️⃣ Testing staff login with Employee ID...');
    const loginResponse = await axios.post(`${API_BASE}/staff/login`, {
      employeeId: 'EMP0020',
      password: 'EMP0020'
    });

    if (loginResponse.data.success) {
      console.log('✅ Staff login successful');
      console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...`);
      console.log(`   Staff: ${loginResponse.data.staff.fullName} (${loginResponse.data.staff.employeeId})`);
      
      const token = loginResponse.data.token;

      // Test 2: Change Password
      console.log('\n2️⃣ Testing password change...');
      const changePasswordResponse = await axios.post(`${API_BASE}/staff/change-password`, {
        currentPassword: 'EMP0020',
        newPassword: 'Test123',
        confirmPassword: 'Test123'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (changePasswordResponse.data.success) {
        console.log('✅ Password change successful');
        console.log(`   Message: ${changePasswordResponse.data.message}`);

        // Test 3: Login with new password
        console.log('\n3️⃣ Testing login with new password...');
        const newLoginResponse = await axios.post(`${API_BASE}/staff/login`, {
          employeeId: 'EMP0020',
          password: 'Test123'
        });

        if (newLoginResponse.data.success) {
          console.log('✅ Login with new password successful');
          console.log(`   Staff: ${newLoginResponse.data.staff.fullName}`);
        } else {
          console.log('❌ Login with new password failed');
          console.log(`   Error: ${newLoginResponse.data.message}`);
        }

        // Test 4: Verify old password doesn't work
        console.log('\n4️⃣ Testing that old password no longer works...');
        try {
          await axios.post(`${API_BASE}/staff/login`, {
            employeeId: 'EMP0020',
            password: 'EMP0020'
          });
          console.log('❌ Old password still works (this should not happen)');
        } catch (error) {
          if (error.response && error.response.status === 401) {
            console.log('✅ Old password correctly rejected');
          } else {
            console.log('❓ Unexpected error:', error.message);
          }
        }

      } else {
        console.log('❌ Password change failed');
        console.log(`   Error: ${changePasswordResponse.data.message}`);
      }

    } else {
      console.log('❌ Staff login failed');
      console.log(`   Error: ${loginResponse.data.message}`);
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.response?.data?.message || error.message);
  }

  console.log('\n🏁 Test completed!');
}

testStaffFlow();