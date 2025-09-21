// Test script to verify hardcoded NextAuth route
const testHardcodedAuth = async () => {
  try {
    console.log('Testing hardcoded NextAuth route...');
    
    // Test the providers endpoint
    const response = await fetch('http://localhost:3000/api/auth/providers');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ NextAuth route is working!');
      console.log('Available providers:', Object.keys(data));
      
      if (data.google) {
        console.log('✅ Google provider is configured');
        console.log('Google provider details:', {
          id: data.google.id,
          name: data.google.name,
          type: data.google.type
        });
      } else {
        console.log('❌ Google provider not found');
      }
    } else {
      console.log('❌ NextAuth route failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.log('❌ Error testing NextAuth route:', error.message);
  }
};

// Run the test
testHardcodedAuth();
