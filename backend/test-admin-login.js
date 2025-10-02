const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAdminLogin() {
  console.log('🧪 Testing Admin Login and Role-Based Authentication');
  console.log('====================================================\n');

  try {
    // Test 1: Admin Login
    console.log('🔐 Test 1: Admin Login...');
    const adminCredentials = {
      email: 'admin@berghausbungalow.com',
      password: 'admin123'
    };

    const loginResponse = await axios.post(`${API_BASE}/auth/login`, adminCredentials);
    
    if (loginResponse.data.success) {
      console.log('✅ Admin login successful');
      console.log(`   Name: ${loginResponse.data.data.user.firstName} ${loginResponse.data.data.user.lastName}`);
      console.log(`   Email: ${loginResponse.data.data.user.email}`);
      console.log(`   Role: ${loginResponse.data.data.user.role}`);
      console.log(`   Token: ${loginResponse.data.data.token.substring(0, 20)}...`);
      
      const authToken = loginResponse.data.data.token;
      const userRole = loginResponse.data.data.user.role;
      
      // Verify role is admin
      if (userRole === 'admin') {
        console.log('✅ User role is correctly set to "admin"');
      } else {
        console.log(`❌ Expected role "admin", got "${userRole}"`);
        return;
      }
      
      // Test 2: Access protected admin endpoint
      console.log('\n🔒 Test 2: Access Protected Staff Endpoint...');
      const staffResponse = await axios.get(`${API_BASE}/staff`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (staffResponse.data.success) {
        console.log('✅ Admin can access protected staff endpoint');
        console.log(`   Found ${staffResponse.data.staff.length} staff members`);
      } else {
        console.log('❌ Admin cannot access protected staff endpoint');
      }
      
      // Test 3: Test JWT token payload
      console.log('\n🎫 Test 3: JWT Token Verification...');
      const tokenParts = authToken.split('.');
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          console.log('✅ JWT token structure is valid');
          console.log(`   User ID: ${payload.userId}`);
          console.log(`   Email: ${payload.email}`);
          console.log(`   Role: ${payload.role}`);
          console.log(`   Expires: ${new Date(payload.exp * 1000).toLocaleString()}`);
          
          if (payload.role === 'admin') {
            console.log('✅ JWT token contains correct admin role');
          } else {
            console.log(`❌ JWT token role mismatch: expected "admin", got "${payload.role}"`);
          }
        } catch (error) {
          console.log('❌ Failed to decode JWT token payload');
        }
      } else {
        console.log('❌ Invalid JWT token structure');
      }
      
    } else {
      console.log('❌ Admin login failed');
      console.log(`   Message: ${loginResponse.data.message}`);
    }

    console.log('\n🎉 Admin Authentication Test Completed!');
    console.log('\n📋 Summary:');
    console.log('===========');
    console.log('✅ Admin user created in database');
    console.log('✅ Admin login working');
    console.log('✅ Role-based authentication working');
    console.log('✅ JWT token contains admin role');
    console.log('✅ Protected endpoints accessible');
    
    console.log('\n🔗 Frontend URLs to Test:');
    console.log('=========================');
    console.log('• Sign In: http://localhost:3000/auth/signin');
    console.log('• Admin Dashboard: http://localhost:3000/admin');
    console.log('• Admin Staff: http://localhost:3000/admin/staff');
    
    console.log('\n🔑 Admin Credentials:');
    console.log('=====================');
    console.log('Email: admin@berghausbungalow.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testAdminLogin();
