const express = require('express');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Register new admin
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName, role = 'staff' } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { username }]
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email or username already exists'
      });
    }

    const admin = new Admin({
      username,
      email,
      password,
      fullName,
      role,
      createdBy: req.user?.id
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: admin.getPublicProfile()
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create admin',
      error: error.message
    });
  }
});

// Login admin
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin by username or email
    const admin = await Admin.findOne({
      $or: [{ username }, { email: username }],
      isActive: true
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await admin.updateLastLogin();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id, 
        username: admin.username, 
        role: admin.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: admin.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Get admin profile
router.get('/profile', async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Get all admins
router.get('/', async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const admins = await Admin.find(filter)
      .select('-password')
      .populate('createdBy', 'fullName username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Admin.countDocuments(filter);

    res.json({
      success: true,
      data: admins,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admins',
      error: error.message
    });
  }
});

// Update admin
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Don't allow password updates through this route
    delete updateData.password;

    const admin = await Admin.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      data: admin,
      message: 'Admin updated successfully'
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update admin',
      error: error.message
    });
  }
});

// Change password
router.patch('/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

// Deactivate admin
router.patch('/:id/deactivate', async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      data: admin,
      message: 'Admin deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate admin error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to deactivate admin',
      error: error.message
    });
  }
});

// Activate admin
router.patch('/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      data: admin,
      message: 'Admin activated successfully'
    });
  } catch (error) {
    console.error('Activate admin error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to activate admin',
      error: error.message
    });
  }
});

module.exports = router;
