const Staff = require('../models/Staff');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create new staff member
const createStaff = async (req, res) => {
  try {
    const {
      fullName,
      dob,
      gender,
      nicPassport,
      phone,
      email,
      jobRole,
      department,
      salary,
      overtimeRate,
      bankAccount,
      bankName,
      branch,
      address
    } = req.body;

    // Check if staff already exists
    const existingStaff = await Staff.findOne({ 
      $or: [{ email }, { nicPassport }] 
    });

    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: 'Staff member with this email or NIC/Passport already exists'
      });
    }

    // Generate employee ID
    const lastStaff = await Staff.findOne().sort({ employeeId: -1 });
    let employeeId = 'EMP0001';
    
    if (lastStaff && lastStaff.employeeId) {
      const lastNumber = parseInt(lastStaff.employeeId.replace('EMP', ''));
      employeeId = `EMP${String(lastNumber + 1).padStart(4, '0')}`;
    }

    // Create new staff member
    const staff = new Staff({
      employeeId,
      fullName,
      dob,
      gender,
      nicPassport,
      phone,
      email,
      jobRole,
      department,
      salary,
      overtimeRate: overtimeRate || 0,
      bankAccount: bankAccount || '',
      bankName: bankName || '',
      branch: branch || '',
      address: address || '',
      password: employeeId // Default password is employee ID
    });

    await staff.save();

    // Remove password from response
    const staffResponse = staff.toObject();
    delete staffResponse.password;

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      staff: staffResponse
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create staff member',
      error: error.message
    });
  }
};

// Get all staff members
const getAllStaff = async (req, res) => {
  try {
    const { page = 1, limit = 20, department, isActive = true } = req.query;
    
    let filter = { isActive };
    if (department) filter.department = department;

    const staff = await Staff.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Staff.countDocuments(filter);

    res.json({
      success: true,
      staff,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff members',
      error: error.message
    });
  }
};

// Get staff member by ID
const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const staff = await Staff.findById(id).select('-password');
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      staff
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff member',
      error: error.message
    });
  }
};

// Update staff member
const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.employeeId;
    delete updateData.password;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const staff = await Staff.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      staff
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update staff member',
      error: error.message
    });
  }
};

// Soft delete staff member
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    
    const staff = await Staff.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff member deactivated successfully',
      staff
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete staff member',
      error: error.message
    });
  }
};

// Staff login
const staffLogin = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID and password are required'
      });
    }

    // Find staff by employee ID
    const staff = await Staff.findOne({ employeeId, isActive: true });
    
    if (!staff) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password (default is employee ID)
    const isPasswordValid = password === staff.password || 
                           (staff.password === '' && password === employeeId);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: staff._id, 
        employeeId: staff.employeeId,
        role: 'staff' 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const staffResponse = staff.toObject();
    delete staffResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      staff: staffResponse
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get staff dashboard data
const getStaffDashboard = async (req, res) => {
  try {
    const staffId = req.user.id;
    
    const staff = await Staff.findById(staffId).select('-password');
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Get today's attendance
    const today = new Date().toISOString().split('T')[0];
    const Attendance = require('../models/Attendance');
    const todayAttendance = await Attendance.findOne({
      staffId,
      date: today
    });

    // Get recent attendance (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAttendance = await Attendance.find({
      staffId,
      checkInTime: { $gte: sevenDaysAgo }
    }).sort({ checkInTime: -1 }).limit(7);

    res.json({
      success: true,
      staff,
      todayAttendance,
      recentAttendance
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

module.exports = {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  staffLogin,
  getStaffDashboard
};
