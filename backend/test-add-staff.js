const mongoose = require('mongoose');
const Staff = require('./models/Staff');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/hms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testAddStaff() {
  try {
    console.log('Testing staff creation...');
    
    // Test data with unique email and NIC
    const testStaff = {
      fullName: 'Test User',
      dob: '1995-01-01',
      gender: 'Male',
      nicPassport: 'TEST123456789V',
      phone: '+1234567899',
      email: 'test.user@hms.com',
      jobRole: 'Test Role',
      department: 'Test Department',
      salary: 40000,
      overtimeRate: 20,
      bankAccount: '1234567890',
      bankName: 'Test Bank',
      branch: 'Test Branch',
      address: 'Test Address',
      status: 'active',
      hireDate: '2024-01-20'
    };
    
    // Check if staff already exists
    const existingStaff = await Staff.findOne({ 
      $or: [{ email: testStaff.email }, { nicPassport: testStaff.nicPassport }] 
    });
    
    if (existingStaff) {
      console.log('❌ Staff already exists:', existingStaff.fullName, existingStaff.email);
      return;
    }
    
    // Create new staff
    const staff = new Staff(testStaff);
    await staff.save();
    
    console.log('✅ Staff created successfully:', staff.fullName, staff.email);
    
  } catch (error) {
    console.error('❌ Error creating staff:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

testAddStaff();
