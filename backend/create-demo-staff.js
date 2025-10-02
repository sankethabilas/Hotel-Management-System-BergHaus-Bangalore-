const mongoose = require('mongoose');
const Staff = require('./models/Staff');
require('dotenv').config();

const demoStaff = [
  {
    fullName: 'John Smith',
    dob: new Date('1990-05-15'),
    gender: 'Male',
    nicPassport: 'NIC123456789',
    phone: '+94771234567',
    email: 'john.smith@berghausbungalow.com',
    jobRole: 'Front Desk Manager',
    department: 'Front Office',
    salary: 75000,
    overtimeRate: 1500,
    bankAccount: '1234567890',
    bankName: 'Commercial Bank',
    branch: 'Colombo Main',
    address: '123 Main Street, Colombo 01'
  },
  {
    fullName: 'Sarah Johnson',
    dob: new Date('1988-08-22'),
    gender: 'Female',
    nicPassport: 'NIC987654321',
    phone: '+94772345678',
    email: 'sarah.johnson@berghausbungalow.com',
    jobRole: 'Housekeeping Supervisor',
    department: 'Housekeeping',
    salary: 65000,
    overtimeRate: 1200,
    bankAccount: '0987654321',
    bankName: 'People\'s Bank',
    branch: 'Kandy Branch',
    address: '456 Garden Road, Kandy'
  },
  {
    fullName: 'Michael Brown',
    dob: new Date('1985-12-10'),
    gender: 'Male',
    nicPassport: 'NIC456789123',
    phone: '+94773456789',
    email: 'michael.brown@berghausbungalow.com',
    jobRole: 'Security Officer',
    department: 'Security',
    salary: 55000,
    overtimeRate: 1000,
    bankAccount: '5555666677',
    bankName: 'Bank of Ceylon',
    branch: 'Galle Branch',
    address: '789 Security Lane, Galle'
  },
  {
    fullName: 'Emily Davis',
    dob: new Date('1992-03-18'),
    gender: 'Female',
    nicPassport: 'NIC789123456',
    phone: '+94774567890',
    email: 'emily.davis@berghausbungalow.com',
    jobRole: 'Restaurant Manager',
    department: 'Food & Beverage',
    salary: 70000,
    overtimeRate: 1400,
    bankAccount: '1111222233',
    bankName: 'Hatton National Bank',
    branch: 'Negombo Branch',
    address: '321 Beach Road, Negombo'
  },
  {
    fullName: 'David Wilson',
    dob: new Date('1987-07-25'),
    gender: 'Male',
    nicPassport: 'NIC321654987',
    phone: '+94775678901',
    email: 'david.wilson@berghausbungalow.com',
    jobRole: 'Maintenance Technician',
    department: 'Maintenance',
    salary: 60000,
    overtimeRate: 1100,
    bankAccount: '9999888877',
    bankName: 'Sampath Bank',
    branch: 'Matara Branch',
    address: '654 Tech Street, Matara'
  }
];

async function createDemoStaff() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hms');
    console.log('✅ Connected to MongoDB');

    // Clear existing staff (optional - comment out if you want to keep existing staff)
    // await Staff.deleteMany({});
    // console.log('🗑️ Cleared existing staff');

    // Check if staff already exist
    const existingStaff = await Staff.find({});
    if (existingStaff.length > 0) {
      console.log(`ℹ️ Found ${existingStaff.length} existing staff members`);
      console.log('Existing staff:');
      existingStaff.forEach(staff => {
        console.log(`- ${staff.employeeId}: ${staff.fullName} (${staff.jobRole})`);
      });
    }

    // Create demo staff
    for (const staffData of demoStaff) {
      // Check if staff with this email already exists
      const existingStaffMember = await Staff.findOne({ email: staffData.email });
      
      if (existingStaffMember) {
        console.log(`⚠️ Staff member with email ${staffData.email} already exists (${existingStaffMember.employeeId})`);
        continue;
      }

      // Generate employee ID
      const lastStaff = await Staff.findOne().sort({ employeeId: -1 });
      let employeeId = 'EMP0001';
      
      if (lastStaff && lastStaff.employeeId) {
        const lastNumber = parseInt(lastStaff.employeeId.replace('EMP', ''));
        employeeId = `EMP${String(lastNumber + 1).padStart(4, '0')}`;
      }

      // Create staff member
      const staff = new Staff({
        ...staffData,
        employeeId,
        password: employeeId // Default password is employee ID
      });

      await staff.save();
      console.log(`✅ Created staff: ${employeeId} - ${staffData.fullName} (${staffData.jobRole})`);
      console.log(`   📧 Email: ${staffData.email}`);
      console.log(`   🔑 Default Password: ${employeeId}`);
      console.log('');
    }

    console.log('🎉 Demo staff creation completed!');
    console.log('\n📋 Login Instructions:');
    console.log('1. Go to /staff-login');
    console.log('2. Use Employee ID (e.g., EMP0001) as username');
    console.log('3. Use the same Employee ID as password (default)');
    console.log('\n👥 Created Staff Members:');
    
    const allStaff = await Staff.find({}).sort({ employeeId: 1 });
    allStaff.forEach(staff => {
      console.log(`- ${staff.employeeId}: ${staff.fullName} (${staff.jobRole}) - ${staff.email}`);
    });

  } catch (error) {
    console.error('❌ Error creating demo staff:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
createDemoStaff();
