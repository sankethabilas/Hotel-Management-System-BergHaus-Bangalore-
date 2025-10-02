const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const Staff = require('./models/Staff');
require('dotenv').config();

async function createDemoPayments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hms');
    console.log('✅ Connected to MongoDB');

    // Get all staff members
    const allStaff = await Staff.find({ isActive: true });
    console.log(`📋 Found ${allStaff.length} active staff members`);

    // Create payment records for the last 6 months
    const currentDate = new Date();
    const months = [];
    
    // Generate last 6 months
    for (let i = 0; i < 6; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      months.push({
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        date: new Date(date.getFullYear(), date.getMonth(), 25) // Payment date: 25th of each month
      });
    }

    console.log('\n💰 Creating demo payment records...');
    
    let createdCount = 0;
    
    for (const staff of allStaff) {
      // Base salary based on role
      let baseSalary = 50000; // Default
      if (staff.jobRole.includes('Manager')) baseSalary = 80000;
      else if (staff.jobRole.includes('Supervisor')) baseSalary = 65000;
      else if (staff.jobRole.includes('Engineer')) baseSalary = 75000;
      else if (staff.jobRole.includes('Officer')) baseSalary = 55000;
      
      for (const monthData of months) {
        // Check if payment already exists
        const existingPayment = await Payment.findOne({
          staffId: staff._id,
          'paymentPeriod.month': monthData.month,
          'paymentPeriod.year': monthData.year
        });
        
        if (existingPayment) {
          console.log(`⏭️  Payment already exists for ${staff.fullName} - ${monthData.month}/${monthData.year}`);
          continue;
        }
        
        // Random overtime hours (0-20)
        const overtimeHours = Math.floor(Math.random() * 21);
        const overtimeRate = Math.floor(baseSalary / 160); // Hourly rate
        const overtimePay = overtimeHours * overtimeRate;
        
        // Random bonus (0-10000)
        const bonuses = Math.floor(Math.random() * 10001);
        
        // Calculate deductions
        const grossPay = baseSalary + overtimePay + bonuses;
        const epf = Math.floor(grossPay * 0.08); // 8% EPF
        const etf = Math.floor(grossPay * 0.03); // 3% ETF
        const tax = grossPay > 60000 ? Math.floor(grossPay * 0.05) : 0; // 5% tax if > 60k
        const advances = Math.floor(Math.random() * 5001); // Random advance 0-5000
        
        const totalDeductions = epf + etf + tax + advances;
        const netPay = grossPay - totalDeductions;
        
        // Random status
        const statuses = ['paid', 'paid', 'paid', 'processing']; // 75% paid, 25% processing
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const payment = new Payment({
          staffId: staff._id,
          employeeId: staff.employeeId,
          staffName: staff.fullName,
          paymentPeriod: {
            month: monthData.month,
            year: monthData.year
          },
          baseSalary,
          overtimeHours,
          overtimeRate,
          overtimePay,
          bonuses,
          deductions: {
            epf,
            etf,
            tax,
            advances,
            other: 0
          },
          grossPay,
          totalDeductions,
          netPay,
          paymentDate: monthData.date,
          paymentMethod: 'bank_transfer',
          status,
          bankDetails: {
            accountNumber: `ACC${staff.employeeId}${Math.floor(Math.random() * 1000)}`,
            bankName: 'Commercial Bank',
            branchName: 'Colombo Branch'
          },
          remarks: status === 'paid' ? 'Payment completed successfully' : 'Payment in progress',
          processedBy: 'HR System',
          payslipGenerated: status === 'paid'
        });
        
        await payment.save();
        createdCount++;
        
        console.log(`✅ Created payment for ${staff.fullName} - ${monthData.month}/${monthData.year} - ${status.toUpperCase()}`);
        console.log(`   Gross: Rs.${grossPay.toLocaleString()} | Net: Rs.${netPay.toLocaleString()}`);
      }
    }
    
    console.log(`\n🎉 Created ${createdCount} demo payment records!`);
    
    // Summary
    const totalPayments = await Payment.countDocuments();
    const paidPayments = await Payment.countDocuments({ status: 'paid' });
    const processingPayments = await Payment.countDocuments({ status: 'processing' });
    
    console.log('\n📊 Payment Summary:');
    console.log(`   Total Payments: ${totalPayments}`);
    console.log(`   Paid: ${paidPayments}`);
    console.log(`   Processing: ${processingPayments}`);
    
    console.log('\n🔍 Sample Payment Records:');
    const samplePayments = await Payment.find().limit(3).populate('staffId', 'fullName employeeId');
    samplePayments.forEach(payment => {
      console.log(`   ${payment.staffName} (${payment.employeeId}) - ${payment.paymentPeriod.month}/${payment.paymentPeriod.year}`);
      console.log(`   Net Pay: Rs.${payment.netPay.toLocaleString()} - Status: ${payment.status.toUpperCase()}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createDemoPayments();
