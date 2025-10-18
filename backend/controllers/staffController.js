const Staff = require('../models/Staff');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create new staff member
const createStaff = async (req, res) => {
  try {
    console.log('Creating staff with data:', req.body);
    
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

    // Generate employee ID (find highest number and increment)
    const allStaff = await Staff.find({}, 'employeeId');
    const existingNumbers = allStaff
      .map(staff => parseInt(staff.employeeId.replace('EMP', '')))
      .filter(num => !isNaN(num));
    
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const employeeId = `EMP${String(maxNumber + 1).padStart(4, '0')}`;
    
    console.log('Generated employeeId:', employeeId);

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
    console.error('Staff creation error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      keyPattern: error.keyPattern
    });
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Staff member with this ${field} already exists`
      });
    }
    
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
    const { page = 1, limit = 20, department, isActive } = req.query;
    
    let filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
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

// Delete staff member permanently
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if staff member exists
    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Check for related records that might prevent deletion
    const Payment = require('../models/Payment');
    const Attendance = require('../models/Attendance');
    
    const [paymentCount, attendanceCount] = await Promise.all([
      Payment.countDocuments({ staffId: id }),
      Attendance.countDocuments({ staffId: id })
    ]);

    if (paymentCount > 0 || attendanceCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete staff member. They have ${paymentCount} payment records and ${attendanceCount} attendance records. Please deactivate instead.`
      });
    }

    // Permanently delete the staff member
    await Staff.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Staff member deleted successfully'
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
        message: 'Invalid employee ID or staff member is inactive'
      });
    }

    // Password logic:
    // 1. If staff hasn't changed password yet (password is hashed employeeId), use employeeId
    // 2. If staff has changed password, use the new password
    let isPasswordValid;
    
    // Check if password is hashed (starts with $2a$)
    const isHashed = staff.password.startsWith('$2a$');
    
    if (isHashed) {
      // Password is hashed, use bcrypt to compare
      const bcrypt = require('bcryptjs');
      isPasswordValid = await bcrypt.compare(password, staff.password);
    } else {
      // Password is plain text, compare directly
      if (staff.password === employeeId) {
        // Staff hasn't changed password yet, use Employee ID
        isPasswordValid = password === employeeId;
      } else {
        // Staff has changed password, use the new password
        isPasswordValid = password === staff.password;
      }
    }

    if (!isPasswordValid) {
      const message = isHashed 
        ? 'Invalid password. Use your Employee ID as password'
        : 'Invalid password. Use your custom password';
      
      return res.status(401).json({
        success: false,
        message
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: staff._id, 
        employeeId: staff.employeeId,
        role: 'staff' 
      },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
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

// Change staff password
const changePassword = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password, new password, and confirm password are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match'
      });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 4 characters long'
      });
    }

    // Check for uppercase letter and number
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    
    if (!hasUppercase || !hasNumber) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter and one number'
      });
    }

    // Find staff member
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Verify current password
    // The current password should match whatever is stored in staff.password field
    // (which could be the employeeId initially, or a custom password if changed)
    const isCurrentPasswordValid = (currentPassword === staff.password);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    staff.password = newPassword;
    await staff.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

// Get staff by employee ID
const getStaffByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const staff = await Staff.findOne({ employeeId, isActive: true });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Remove password from response
    const staffResponse = staff.toObject();
    delete staffResponse.password;

    res.json({
      success: true,
      staff: staffResponse
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff member',
      error: error.message
    });
  }
};

// Generate staff report (PDF/Excel)
const generateStaffReport = async (req, res) => {
  try {
    const { format = 'pdf' } = req.query;
    
    // Get all active staff members
    const staff = await Staff.find({ isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });

    if (format === 'excel') {
      // Generate Excel report
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Staff Report');

      // Add headers
      worksheet.columns = [
        { header: 'Employee ID', key: 'employeeId', width: 15 },
        { header: 'Full Name', key: 'fullName', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Job Role', key: 'jobRole', width: 20 },
        { header: 'Department', key: 'department', width: 20 },
        { header: 'Salary', key: 'salary', width: 15 },
        { header: 'Gender', key: 'gender', width: 10 },
        { header: 'Date of Birth', key: 'dob', width: 15 },
        { header: 'Address', key: 'address', width: 40 },
        { header: 'Bank Account', key: 'bankAccount', width: 20 },
        { header: 'Bank Name', key: 'bankName', width: 20 },
        { header: 'Branch', key: 'branch', width: 20 },
        { header: 'Join Date', key: 'createdAt', width: 15 }
      ];

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6FA' }
      };

      // Add staff data
      staff.forEach(member => {
        worksheet.addRow({
          employeeId: member.employeeId,
          fullName: member.fullName,
          email: member.email,
          phone: member.phone || 'N/A',
          jobRole: member.jobRole || 'N/A',
          department: member.department || 'N/A',
          salary: member.salary || 0,
          gender: member.gender || 'N/A',
          dob: member.dob ? new Date(member.dob).toLocaleDateString() : 'N/A',
          address: member.address || 'N/A',
          bankAccount: member.bankAccount || 'N/A',
          bankName: member.bankName || 'N/A',
          branch: member.branch || 'N/A',
          createdAt: new Date(member.createdAt).toLocaleDateString()
        });
      });

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        column.width = Math.max(column.width, 10);
      });

      // Generate Excel buffer
      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="staff-report-${new Date().toISOString().split('T')[0]}.xlsx"`);
      res.send(buffer);

    } else {
      // Generate PDF report using existing PDF service
      const PDFDocument = require('pdfkit');
      
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      // Collect PDF data
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      
      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="staff-report-${new Date().toISOString().split('T')[0]}.pdf"`);
          res.send(pdfData);
        });
        
        doc.on('error', reject);
        
        // Generate PDF content
        generateStaffReportPDF(doc, staff);
        doc.end();
      });
    }

  } catch (error) {
    console.error('Staff report generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate staff report',
      error: error.message
    });
  }
};

// Helper function to generate PDF content
const generateStaffReportPDF = (doc, staff) => {
  // Header
  doc.fontSize(24)
     .fillColor('#2563eb')
     .text('BERGHAUS HOTEL', 50, 50, { align: 'center' });
  
  doc.fontSize(16)
     .fillColor('#555')
     .text('Staff Report', 50, 80, { align: 'center' });
  
  doc.fontSize(12)
     .fillColor('#000')
     .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 110)
     .text(`Total Staff: ${staff.length}`, 50, 130);

  let yPosition = 160;
  
  // Table header
  doc.fontSize(10)
     .fillColor('#000')
     .text('Employee ID', 50, yPosition)
     .text('Name', 120, yPosition)
     .text('Email', 250, yPosition)
     .text('Department', 400, yPosition)
     .text('Salary', 500, yPosition);
  
  // Draw line under header
  yPosition += 15;
  doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
  yPosition += 10;

  // Staff data
  staff.forEach((member, index) => {
    if (yPosition > 700) {
      // New page
      doc.addPage();
      yPosition = 50;
    }

    doc.text(member.employeeId || 'N/A', 50, yPosition)
       .text(member.fullName || 'N/A', 120, yPosition)
       .text(member.email || 'N/A', 250, yPosition)
       .text(member.department || 'N/A', 400, yPosition)
       .text(`Rs. ${member.salary || 0}`, 500, yPosition);
    
    yPosition += 20;
  });

  // Footer
  yPosition += 30;
  doc.fontSize(10)
     .fillColor('#777')
     .text('BergHaus Bungalow', 50, yPosition, { align: 'center' });
};

module.exports = {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  staffLogin,
  getStaffDashboard,
  changePassword,
  getStaffByEmployeeId,
  generateStaffReport
};
