// Debug script to check authentication status
console.log('=== AUTH DEBUG ===');

// Check cookies
const cookies = document.cookie.split(';').reduce((acc, cookie) => {
  const [key, value] = cookie.trim().split('=');
  acc[key] = value;
  return acc;
}, {});

console.log('All cookies:', cookies);
console.log('Token cookie:', cookies.token);
console.log('Session cookie:', cookies['hms-session']);

// Check localStorage
console.log('LocalStorage:', localStorage);

// Test API call
const testAPI = async () => {
  try {
    const token = cookies.token;
    console.log('Using token:', token ? 'Present' : 'Missing');
    
    const response = await fetch('http://localhost:5000/api/bookings/user/bookings', {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    console.log('API Response Status:', response.status);
    const data = await response.json();
    console.log('API Response:', data);
    
    return response.ok;
  } catch (error) {
    console.error('API Test Error:', error);
    return false;
  }
};

// Run test
testAPI();

// Export for manual testing
window.debugAuth = {
  cookies,
  testAPI
};
