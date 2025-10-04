const Leave = require('../models/Leave');
const Staff = require('../models/Staff');

// Create leave request
const createLeaveRequest = async (req, res) => {
  try {
    const {
      leaveType,
      startDate,
      endDate,
      reason,
      emergencyContact,
      staffId // Allow passing staffId in the request body for testing
    } = req.body;

    // Try to get staffId from authentication, or use provided staffId, or use a default
    let currentStaffId = req.user?.id || staffId;
    
    if (!currentStaffId) {
      // For testing purposes, use the first staff member found
      const firstStaff = await Staff.findOne({ isActive: true });
      if (!firstStaff) {
        return res.status(400).json({
          success: false,
          message: 'No staff member found. Please ensure you are logged in or contact admin.'
        });
      }
      currentStaffId = firstStaff._id;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    if (start < today) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date'
      });
    }

    // Calculate number of days
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    // Get staff details
    const staff = await Staff.findById(currentStaffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Create leave request
    const leave = new Leave({
      staffId: currentStaffId,
      staffName: staff.fullName,
      staffEmail: staff.email,
      department: staff.department,
      leaveType,
      startDate: start,
      endDate: end,
      numberOfDays: daysDiff,
      reason,
      emergencyContact: emergencyContact || staff.phone,
      status: 'pending'
    });

    await leave.save();

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      leave
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create leave request',
      error: error.message
    });
  }
};

// Get all leave requests (for admin)
const getAllLeaveRequests = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      department,
      leaveType,
      startDate,
      endDate 
    } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (leaveType) filter.leaveType = leaveType;
    
    if (startDate && endDate) {
      filter.startDate = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const leaves = await Leave.find(filter)
      .populate('staffId', 'fullName email department')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Leave.countDocuments(filter);

    res.json({
      success: true,
      leaves,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave requests',
      error: error.message
    });
  }
};

// Get staff's own leave requests
const getMyLeaveRequests = async (req, res) => {
  try {
    // Try to get staffId from authentication, query params, or use the first staff member as fallback
    let staffId = req.user?.id || req.query.staffId;
    
    if (!staffId) {
      // For testing purposes, use the first staff member found
      const firstStaff = await Staff.findOne({ isActive: true });
      if (!firstStaff) {
        return res.status(400).json({
          success: false,
          message: 'No staff member found. Please ensure you are logged in or contact admin.'
        });
      }
      staffId = firstStaff._id;
    }
    
    const { page = 1, limit = 10, status } = req.query;
    
    let filter = { staffId };
    if (status) filter.status = status;

    const leaves = await Leave.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Leave.countDocuments(filter);

    res.json({
      success: true,
      leaves,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error in getMyLeaveRequests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your leave requests',
      error: error.message
    });
  }
};

// Update leave request status (for admin)
const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComments } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected'
      });
    }

    const updateData = { 
      status,
      adminComments: adminComments || '',
      reviewedAt: new Date()
    };

    // Only add reviewedBy if user is authenticated
    if (req.user && req.user.id) {
      updateData.reviewedBy = req.user.id;
    }

    const leave = await Leave.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('staffId', 'fullName email department');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    res.json({
      success: true,
      message: `Leave request ${status} successfully`,
      leave
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update leave status',
      error: error.message
    });
  }
};

// Cancel leave request (for staff - only pending requests)
const cancelLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get staffId from user authentication or use first available staff for testing
    let staffId = req.user?.id;
    
    if (!staffId) {
      // For testing purposes, use the first staff member found
      const firstStaff = await Staff.findOne({ isActive: true });
      if (!firstStaff) {
        return res.status(400).json({
          success: false,
          message: 'No staff member found. Please ensure you are logged in.'
        });
      }
      staffId = firstStaff._id;
    }

    const leave = await Leave.findOne({ _id: id, staffId });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only cancel pending leave requests'
      });
    }

    leave.status = 'cancelled';
    leave.cancelledAt = new Date();
    await leave.save();

    res.json({
      success: true,
      message: 'Leave request cancelled successfully',
      leave
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel leave request',
      error: error.message
    });
  }
};

// Get leave statistics
const getLeaveStatistics = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    
    let matchFilter = {};
    if (department) matchFilter.department = department;
    if (startDate && endDate) {
      matchFilter.startDate = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const stats = await Leave.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDays: { $sum: '$numberOfDays' }
        }
      }
    ]);

    const leaveTypeStats = await Leave.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 },
          totalDays: { $sum: '$numberOfDays' }
        }
      }
    ]);

    const departmentStats = await Leave.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          totalDays: { $sum: '$numberOfDays' }
        }
      }
    ]);

    res.json({
      success: true,
      statistics: {
        byStatus: stats,
        byLeaveType: leaveTypeStats,
        byDepartment: departmentStats
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave statistics',
      error: error.message
    });
  }
};

// Delete leave request
const deleteLeaveRequest = async (req, res) => {
  try {
    console.log('DELETE request received for ID:', req.params.id);
    const { id } = req.params;

    console.log('Attempting to delete leave with ID:', id);
    const leave = await Leave.findByIdAndDelete(id);

    if (!leave) {
      console.log('Leave request not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    console.log('Leave request deleted successfully:', id);
    res.json({
      success: true,
      message: 'Leave request deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting leave request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete leave request',
      error: error.message
    });
  }
};

module.exports = {
  createLeaveRequest,
  getAllLeaveRequests,
  getMyLeaveRequests,
  updateLeaveStatus,
  cancelLeaveRequest,
  getLeaveStatistics,
  deleteLeaveRequest
};
