// Test script to check if the auth route is working
const testAuthRoute = async () => {
  try {
    console.log('Testing NextAuth route...');
    
    // Test the auth route
    const response = await fetch('http://localhost:3000/api/auth/providers');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ NextAuth route is working!');
      console.log('Available providers:', Object.keys(data));
    } else {
      console.log('❌ NextAuth route failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Error testing auth route:', error.message);
  }
};

// Run the test
testAuthRoute();
