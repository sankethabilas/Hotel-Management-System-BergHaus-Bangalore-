// Test script to verify reservations functionality
console.log('Testing reservations functionality...');

// Test 1: Check if user is authenticated
const checkAuth = () => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='));
  
  const sessionCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('hms-session='));
  
  console.log('JWT Token:', token ? 'Present' : 'Missing');
  console.log('Session Cookie:', sessionCookie ? 'Present' : 'Missing');
  
  return !!(token || sessionCookie);
};

// Test 2: Check API endpoint
const testAPI = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/bookings/user/bookings', {
      headers: {
        'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || ''}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API Response Status:', response.status);
    const data = await response.json();
    console.log('API Response Data:', data);
    
    return response.ok;
  } catch (error) {
    console.error('API Test Error:', error);
    return false;
  }
};

// Run tests
console.log('Auth Status:', checkAuth());
testAPI().then(success => console.log('API Test:', success ? 'Passed' : 'Failed'));

// Export for use in browser console
window.testReservations = {
  checkAuth,
  testAPI
};
