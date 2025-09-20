const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testLogin = async () => {
  console.log('🧪 Testing Login Functionality...\n');

  const testCredentials = [
    { email: 'admin@hms.com', password: 'Admin123', role: 'admin' },
    { email: 'employee@hms.com', password: 'Employee123', role: 'employee' },
    { email: 'guest@hms.com', password: 'Guest123', role: 'guest' }
  ];

  for (const cred of testCredentials) {
    try {
      console.log(`Testing login for ${cred.role}...`);
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: cred.email,
        password: cred.password
      });

      if (response.data.success) {
        console.log(`✅ ${cred.role} login successful`);
        console.log(`   User: ${response.data.data.user.firstName} ${response.data.data.user.lastName}`);
        console.log(`   Role: ${response.data.data.user.role}`);
        console.log(`   Token: ${response.data.data.token.substring(0, 20)}...`);
      } else {
        console.log(`❌ ${cred.role} login failed: ${response.data.message}`);
      }
    } catch (error) {
      if (error.response) {
        console.log(`❌ ${cred.role} login failed: ${error.response.data.message}`);
      } else {
        console.log(`❌ ${cred.role} login failed: ${error.message}`);
      }
    }
    console.log('');
  }

  // Test invalid credentials
  try {
    console.log('Testing invalid credentials...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'invalid@test.com',
      password: 'wrongpassword'
    });
    console.log('❌ Invalid login should have failed but succeeded');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Invalid credentials properly rejected');
    } else {
      console.log(`❌ Unexpected error: ${error.message}`);
    }
  }
};

// Check if server is running
const checkServer = async () => {
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log('✅ Backend server is running');
    return true;
  } catch (error) {
    console.log('❌ Backend server is not running. Please start it with: npm start');
    return false;
  }
};

const main = async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testLogin();
  }
};

main();

