const DailySchedule = require('../models/DailySchedule');
const DepartmentRule = require('../models/DepartmentRule');
const Staff = require('../models/Staff');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');

// Get all daily schedules with filters
const getAllSchedules = async (req, res) => {
  try {
    const { date, department, status } = req.query;
    
    let filter = {};
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.date = { $gte: targetDate, $lt: nextDay };
    }
    if (department) filter.department = department;
    if (status) filter.status = status;
    
    const schedules = await DailySchedule.find(filter)
      .populate('shifts.assignedStaff', 'fullName employeeId department')
      .populate('createdBy', 'fullName employeeId')
      .sort({ date: -1, department: 1 });
    
    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedules',
      error: error.message
    });
  }
};

// Get schedule by ID
const getScheduleById = async (req, res) => {
  try {
    const schedule = await DailySchedule.findById(req.params.id)
      .populate('shifts.assignedStaff', 'fullName employeeId department phone email')
      .populate('createdBy', 'fullName employeeId');
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule',
      error: error.message
    });
  }
};

// Generate smart schedule for a specific date and department
const generateSmartSchedule = async (req, res) => {
  try {
    const { date, department } = req.body;
    
    if (!date || !department) {
      return res.status(400).json({
        success: false,
        message: 'Date and department are required'
      });
    }
    
    // Get department rules
    const departmentRule = await DepartmentRule.findOne({ 
      department, 
      isActive: true 
    });
    
    if (!departmentRule) {
      return res.status(404).json({
        success: false,
        message: 'Department rules not found'
      });
    }
    
    // Get available staff (not on leave)
    const availableStaff = await getAvailableStaff(date, department);
    
    // Get staff with attendance scores
    const staffWithScores = await Promise.all(
      availableStaff.map(async (staff) => ({
        ...staff.toObject(),
        attendanceScore: await getAttendanceScore(staff._id, 30)
      }))
    );
    
    // Sort by attendance score (highest first)
    const sortedStaff = staffWithScores.sort((a, b) => 
      b.attendanceScore - a.attendanceScore
    );
    
    // Generate shifts
    const shifts = departmentRule.timeSlots.map(timeSlot => {
      const assignedStaff = sortedStaff.slice(0, timeSlot.requiredStaff);
      return {
        timeSlot: timeSlot.name,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        assignedStaff: assignedStaff.map(staff => staff._id),
        requiredCount: timeSlot.requiredStaff,
        actualCount: assignedStaff.length
      };
    });
    
    // Calculate coverage status
    const totalRequired = shifts.reduce((sum, shift) => sum + shift.requiredCount, 0);
    const totalAssigned = shifts.reduce((sum, shift) => sum + shift.actualCount, 0);
    const coverageStatus = totalAssigned >= totalRequired ? 'covered' : 'understaffed';
    
    // Create or update schedule
    const scheduleData = {
      date: new Date(date),
      department,
      shifts,
      totalAssigned,
      coverageStatus,
      status: 'draft'
    };
    
    const schedule = await DailySchedule.findOneAndUpdate(
      { date: new Date(date), department },
      scheduleData,
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      message: 'Schedule generated successfully',
      data: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate schedule',
      error: error.message
    });
  }
};

// Get daily coverage overview
const getDailyCoverage = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const departments = ['Reception', 'Housekeeping', 'Kitchen', 'Maintenance'];
    const coverageData = [];
    
    for (const dept of departments) {
      const coverage = await checkDepartmentCoverage(targetDate, dept);
      coverageData.push(coverage);
    }
    
    // Get staff on leave for the day
    const staffOnLeave = await Leave.find({
      date: { $gte: targetDate, $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000) },
      status: 'approved'
    }).populate('staffId', 'fullName employeeId department');
    
    res.json({
      success: true,
      data: {
        date: targetDate,
        departments: coverageData,
        staffOnLeave,
        summary: {
          totalDepartments: departments.length,
          coveredDepartments: coverageData.filter(d => d.isCovered).length,
          understaffedDepartments: coverageData.filter(d => !d.isCovered).length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get coverage data',
      error: error.message
    });
  }
};

// Update schedule assignments
const updateScheduleAssignments = async (req, res) => {
  try {
    const { id } = req.params;
    const { shifts } = req.body;
    
    const schedule = await DailySchedule.findById(id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    // Update shifts
    schedule.shifts = shifts;
    schedule.totalAssigned = shifts.reduce((sum, shift) => sum + shift.actualCount, 0);
    
    // Recalculate coverage status
    const totalRequired = shifts.reduce((sum, shift) => sum + shift.requiredCount, 0);
    schedule.coverageStatus = schedule.totalAssigned >= totalRequired ? 'covered' : 'understaffed';
    schedule.lastModified = new Date();
    
    await schedule.save();
    
    res.json({
      success: true,
      message: 'Schedule updated successfully',
      data: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update schedule',
      error: error.message
    });
  }
};

// Publish schedule
const publishSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    
    const schedule = await DailySchedule.findById(id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    schedule.status = 'published';
    schedule.lastModified = new Date();
    
    await schedule.save();
    
    res.json({
      success: true,
      message: 'Schedule published successfully',
      data: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to publish schedule',
      error: error.message
    });
  }
};

// Helper function to get all staff with leave status
const getAvailableStaff = async (date, department) => {
  const targetDate = new Date(date);
  
  // Get all active staff in department
  const allStaff = await Staff.find({ 
    department, 
    isActive: true 
  });
  
  // Get staff on leave for this date
  const onLeave = await Leave.find({
    date: { $gte: targetDate, $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000) },
    status: 'approved',
    staffId: { $in: allStaff.map(s => s._id) }
  }).populate('staffId', 'fullName employeeId');
  
  // Return all staff with leave status
  const staffWithStatus = allStaff.map(staff => {
    const leaveRecord = onLeave.find(leave => leave.staffId._id.equals(staff._id));
    return {
      ...staff.toObject(),
      isOnLeave: !!leaveRecord,
      leaveReason: leaveRecord?.reason || null
    };
  });
  
  return staffWithStatus;
};

// Helper function to get attendance score
const getAttendanceScore = async (staffId, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const attendance = await Attendance.find({
    staffId,
    date: { $gte: startDate }
  });
  
  if (attendance.length === 0) return 0;
  
  const presentDays = attendance.filter(a => a.status === 'present').length;
  return Math.round((presentDays / attendance.length) * 100);
};

// Helper function to check department coverage
const checkDepartmentCoverage = async (date, department) => {
  const allStaff = await getAvailableStaff(date, department);
  const departmentRule = await DepartmentRule.findOne({ department, isActive: true });
  
  // Count staff who are NOT on leave
  const availableStaff = allStaff.filter(staff => !staff.isOnLeave);
  
  if (!departmentRule) {
    return {
      department,
      date,
      availableStaff: availableStaff.length,
      requiredStaff: 0,
      isCovered: false,
      shortage: 0,
      status: 'no-rules',
      staffDetails: allStaff.map(staff => ({
        fullName: staff.fullName,
        employeeId: staff.employeeId,
        isOnLeave: staff.isOnLeave,
        leaveReason: staff.leaveReason
      }))
    };
  }
  
  const totalRequired = departmentRule.timeSlots.reduce((sum, slot) => sum + slot.requiredStaff, 0);
  const isCovered = availableStaff.length >= totalRequired;
  const shortage = Math.max(0, totalRequired - availableStaff.length);
  
  return {
    department,
    date,
    availableStaff: availableStaff.length,
    requiredStaff: totalRequired,
    isCovered,
    shortage,
    status: isCovered ? 'covered' : shortage > 2 ? 'critical' : 'warning',
    staffDetails: allStaff.map(staff => ({
      fullName: staff.fullName,
      employeeId: staff.employeeId,
      isOnLeave: staff.isOnLeave,
      leaveReason: staff.leaveReason
    }))
  };
};

module.exports = {
  getAllSchedules,
  getScheduleById,
  generateSmartSchedule,
  getDailyCoverage,
  updateScheduleAssignments,
  publishSchedule
};
