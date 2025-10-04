const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI environment variable is not defined. Please check your .env file.');
  process.exit(1);
}

const LeaveSchema = new mongoose.Schema({}, { collection: 'leaves', strict: false });
const Leave = mongoose.model('Leave', LeaveSchema);

const StaffSchema = new mongoose.Schema({}, { collection: 'staffs', strict: false });
const Staff = mongoose.model('Staff', StaffSchema);

async function checkLeaves() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    // Get recent leave requests
    const leaves = await Leave.find().sort({ createdAt: -1 }).limit(3);
    console.log('\n=== RECENT LEAVE REQUESTS ===');
    
    for (let i = 0; i < leaves.length; i++) {
      const leave = leaves[i];
      console.log(`\n${i + 1}. Leave Request:`);
      console.log(`   ID: ${leave._id}`);
      console.log(`   Staff ID: ${leave.staffId}`);
      console.log(`   Reason: ${leave.reason}`);
      console.log(`   Leave Type: ${leave.leaveType}`);
      console.log(`   Created: ${leave.createdAt}`);
      
      // Find the corresponding staff member
      if (leave.staffId) {
        const staff = await Staff.findById(leave.staffId);
        if (staff) {
          console.log(`   Staff Name: ${staff.fullName}`);
          console.log(`   Employee ID: ${staff.employeeId}`);
          console.log(`   Department: ${staff.department}`);
        } else {
          console.log(`   Staff not found for ID: ${leave.staffId}`);
        }
      }
      console.log('   ---');
    }
    
    // Also check the staff members
    console.log('\n=== ALL STAFF MEMBERS ===');
    const staffs = await Staff.find({}, 'fullName employeeId department');
    staffs.forEach((staff, index) => {
      console.log(`${index + 1}. ${staff.fullName} (${staff.employeeId}) - ${staff.department} - ID: ${staff._id}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

checkLeaves();