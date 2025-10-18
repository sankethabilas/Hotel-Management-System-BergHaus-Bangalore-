const mongoose = require('mongoose');
const DepartmentRule = require('../models/DepartmentRule');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const initDepartmentRules = async () => {
  try {
    await connectDB();

    // Clear existing rules
    await DepartmentRule.deleteMany({});

    const departmentRules = [
      {
        department: 'Reception',
        minStaff: 2,
        maxStaff: 6,
        timeSlots: [
          {
            name: 'morning',
            startTime: '08:00',
            endTime: '16:00',
            requiredStaff: 2
          },
          {
            name: 'afternoon',
            startTime: '16:00',
            endTime: '00:00',
            requiredStaff: 2
          },
          {
            name: 'night',
            startTime: '00:00',
            endTime: '08:00',
            requiredStaff: 1
          }
        ],
        description: '24/7 reception coverage with 2 staff during day, 1 at night',
        specialRequirements: 'Must have at least one senior staff member during peak hours'
      },
      {
        department: 'Housekeeping',
        minStaff: 3,
        maxStaff: 8,
        timeSlots: [
          {
            name: 'morning',
            startTime: '08:00',
            endTime: '16:00',
            requiredStaff: 3
          },
          {
            name: 'afternoon',
            startTime: '16:00',
            endTime: '20:00',
            requiredStaff: 2
          }
        ],
        description: 'Housekeeping coverage during operational hours',
        specialRequirements: 'Peak hours require additional staff for room turnover'
      },
      {
        department: 'Kitchen',
        minStaff: 2,
        maxStaff: 6,
        timeSlots: [
          {
            name: 'morning',
            startTime: '06:00',
            endTime: '14:00',
            requiredStaff: 2
          },
          {
            name: 'afternoon',
            startTime: '14:00',
            endTime: '22:00',
            requiredStaff: 2
          }
        ],
        description: 'Kitchen coverage for meal preparation and service',
        specialRequirements: 'Head chef must be present during meal service hours'
      },
      {
        department: 'Maintenance',
        minStaff: 1,
        maxStaff: 3,
        timeSlots: [
          {
            name: 'morning',
            startTime: '08:00',
            endTime: '17:00',
            requiredStaff: 1
          }
        ],
        description: 'Maintenance coverage during business hours',
        specialRequirements: 'On-call availability for emergencies outside business hours'
      }
    ];

    for (const rule of departmentRules) {
      const departmentRule = new DepartmentRule(rule);
      await departmentRule.save();
      console.log(`✅ Created rules for ${rule.department}`);
    }

    console.log('🎉 Department rules initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing department rules:', error);
    process.exit(1);
  }
};

initDepartmentRules();
