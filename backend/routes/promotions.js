const express = require('express');
const router = express.Router();
const Promotion = require('../models/Promotion');
// const { protect, authorize } = require('../middleware/auth');

// Get all promotions (public)
router.get('/active', async (req, res) => {
  try {
    const promotions = await Promotion.find({ isActive: true });
    
    // Filter promotions that are currently valid
    const activePromotions = promotions.filter(promotion => promotion.isCurrentlyValid());
    
    res.json({
      success: true,
      message: 'Active promotions retrieved successfully',
      data: activePromotions
    });
  } catch (error) {
    console.error('Get active promotions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve active promotions',
      error: error.message
    });
  }
});

// Calculate discount for an order
router.post('/calculate-discount', async (req, res) => {
  try {
    const { orderItems, totalAmount } = req.body;
    
    const promotions = await Promotion.find({ isActive: true });
    
    let bestDiscount = 0;
    let bestPromotion = null;
    
    for (const promotion of promotions) {
      if (!promotion.isCurrentlyValid()) continue;
      
      // Check if promotion applies to any items in the order
      let appliesToOrder = false;
      
      if (promotion.type === 'category') {
        // Check if any item matches the promotion categories
        appliesToOrder = orderItems.some(item => 
          promotion.appliesToCategory(item.category)
        );
      } else {
        // For other types, applies to entire order
        appliesToOrder = true;
      }
      
      if (appliesToOrder && totalAmount >= promotion.minOrderAmount) {
        const discount = promotion.calculateDiscount(totalAmount);
        
        if (discount > bestDiscount) {
          bestDiscount = discount;
          bestPromotion = promotion;
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Discount calculated successfully',
      data: {
        discountAmount: bestDiscount,
        promotion: bestPromotion,
        finalAmount: totalAmount - bestDiscount
      }
    });
  } catch (error) {
    console.error('Calculate discount error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate discount',
      error: error.message
    });
  }
});

// Get all promotions (admin only)
router.get('/admin', async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      message: 'Promotions retrieved successfully',
      data: promotions
    });
  } catch (error) {
    console.error('Get admin promotions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve promotions',
      error: error.message
    });
  }
});

// Create new promotion (admin only)
router.post('/', async (req, res) => {
  try {
    const promotionData = req.body;
    
    const newPromotion = new Promotion(promotionData);
    await newPromotion.save();
    
    res.status(201).json({
      success: true,
      message: 'Promotion created successfully',
      data: newPromotion
    });
  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create promotion',
      error: error.message
    });
  }
});

// Get promotion by ID (admin only)
router.get('/:id', async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }
    
    res.json({
      success: true,
      data: promotion
    });
  } catch (error) {
    console.error('Get promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve promotion',
      error: error.message
    });
  }
});

// Update promotion (admin only)
router.put('/:id', async (req, res) => {
  try {
    const updateData = req.body;
    
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Promotion updated successfully',
      data: promotion
    });
  } catch (error) {
    console.error('Update promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update promotion',
      error: error.message
    });
  }
});

// Delete promotion (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Promotion deleted successfully'
    });
  } catch (error) {
    console.error('Delete promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete promotion',
      error: error.message
    });
  }
});

// Toggle promotion status (admin only)
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }
    
    promotion.isActive = !promotion.isActive;
    promotion.updatedAt = new Date();
    await promotion.save();
    
    res.json({
      success: true,
      message: `Promotion ${promotion.isActive ? 'activated' : 'deactivated'} successfully`,
      data: promotion
    });
  } catch (error) {
    console.error('Toggle promotion status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle promotion status',
      error: error.message
    });
  }
});

module.exports = router;
