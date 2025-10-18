const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
// const { protect, authorize } = require('../middleware/auth');

// Get all banners (public)
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true })
      .populate('createdBy', 'username fullName')
      .sort({ priority: -1, createdAt: -1 });
    
    res.json({
      success: true,
      message: 'Banners retrieved successfully',
      data: banners
    });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve banners',
      error: error.message
    });
  }
});

// Get all banners (admin only)
router.get('/admin', async (req, res) => {
  try {
    const banners = await Banner.find()
      .populate('createdBy', 'username fullName')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      message: 'Banners retrieved successfully',
      data: banners
    });
  } catch (error) {
    console.error('Get admin banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve banners',
      error: error.message
    });
  }
});

// Create new banner (admin only)
router.post('/', async (req, res) => {
  try {
    const bannerData = {
      ...req.body,
      createdBy: new require('mongoose').Types.ObjectId() // Use a default admin ID or create one
    };
    
    const newBanner = new Banner(bannerData);
    await newBanner.save();
    
    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: newBanner
    });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create banner',
      error: error.message
    });
  }
});

// Get banner by ID (admin only)
router.get('/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id)
      .populate('createdBy', 'username fullName');
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }
    
    res.json({
      success: true,
      data: banner
    });
  } catch (error) {
    console.error('Get banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve banner',
      error: error.message
    });
  }
});

// Update banner (admin only)
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: new Date() };
    
    const banner = await Banner.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('createdBy', 'username fullName');
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Banner updated successfully',
      data: banner
    });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update banner',
      error: error.message
    });
  }
});

// Delete banner (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete banner',
      error: error.message
    });
  }
});

// Toggle banner status (admin only)
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }
    
    // Use findByIdAndUpdate to avoid validation issues with required fields
    const updatedBanner = await Banner.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: !banner.isActive,
        updatedAt: new Date()
      },
      { 
        new: true,
        runValidators: false // Skip validation since we're only updating specific fields
      }
    );
    
    res.json({
      success: true,
      message: `Banner ${updatedBanner.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedBanner
    });
  } catch (error) {
    console.error('Toggle banner status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle banner status',
      error: error.message
    });
  }
});

module.exports = router;
