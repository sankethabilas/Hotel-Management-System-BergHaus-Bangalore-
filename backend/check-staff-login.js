const mongoose = require('mongoose');
const Staff = require('./models/Staff');
require('dotenv').config();

async function checkStaffLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hms');
    console.log('✅ Connected to MongoDB');

    // Get all staff members
    const allStaff = await Staff.find({}).sort({ employeeId: 1 });
    
    console.log('\n👥 All Staff Members in Database:');
    console.log('=====================================');
    
    for (const staff of allStaff) {
      console.log(`\n📋 Employee ID: ${staff.employeeId}`);
      console.log(`👤 Name: ${staff.fullName}`);
      console.log(`📧 Email: ${staff.email}`);
      console.log(`💼 Role: ${staff.jobRole}`);
      console.log(`🏢 Department: ${staff.department}`);
      console.log(`✅ Active: ${staff.isActive}`);
      console.log(`🔑 Password: ${staff.password || '(empty)'}`);
      console.log(`📅 Created: ${staff.createdAt}`);
      
      // Check login compatibility
      const canLoginWithEmployeeId = staff.password === staff.employeeId || staff.password === '';
      console.log(`🔓 Can login with Employee ID as password: ${canLoginWithEmployeeId ? 'YES' : 'NO'}`);
      
      if (!canLoginWithEmployeeId && staff.password) {
        console.log(`⚠️  Current password: "${staff.password}"`);
      }
    }

    console.log('\n🔧 Login Instructions:');
    console.log('=====================');
    console.log('1. Go to /staff-login');
    console.log('2. Use Employee ID as username');
    console.log('3. Use Employee ID as password (for most accounts)');
    console.log('\n📝 Example Login Credentials:');
    
    const activeStaff = allStaff.filter(s => s.isActive);
    for (const staff of activeStaff.slice(0, 3)) { // Show first 3 active staff
      console.log(`   Employee ID: ${staff.employeeId}`);
      console.log(`   Password: ${staff.password || staff.employeeId}`);
      console.log(`   Name: ${staff.fullName}`);
      console.log('   ---');
    }

    // Fix passwords if needed
    console.log('\n🔧 Fixing passwords for easy login...');
    let fixedCount = 0;
    
    for (const staff of allStaff) {
      if (staff.password !== staff.employeeId) {
        staff.password = staff.employeeId;
        await staff.save();
        console.log(`✅ Fixed password for ${staff.employeeId} (${staff.fullName})`);
        fixedCount++;
      }
    }
    
    if (fixedCount > 0) {
      console.log(`\n🎉 Fixed ${fixedCount} staff passwords!`);
    } else {
      console.log('\n✅ All passwords are already correctly set!');
    }

    console.log('\n🚀 Ready to test staff login!');
    console.log('Try logging in with any Employee ID and the same ID as password.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
checkStaffLogin();
