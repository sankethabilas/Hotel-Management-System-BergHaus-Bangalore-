const express = require('express');
const MenuItem = require('../models/MenuItem');
const router = express.Router();

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const { category, isAvailable, search, sortBy = 'name' } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === 'true';
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'price-low':
        sort = { price: 1 };
        break;
      case 'price-high':
        sort = { price: -1 };
        break;
      case 'popular':
        sort = { isPopular: -1, name: 1 };
        break;
      case 'name':
      default:
        sort = { name: 1 };
        break;
    }

    const menuItems = await MenuItem.find(filter)
      .populate('createdBy', 'fullName username')
      .sort(sort)
      .lean();

    res.json({
      success: true,
      data: menuItems,
      count: menuItems.length
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu items',
      error: error.message
    });
  }
});

// Get menu item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const menuItem = await MenuItem.findById(id)
      .populate('createdBy', 'fullName username')
      .lean();

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu item',
      error: error.message
    });
  }
});

// Create menu item (admin only)
router.post('/', async (req, res) => {
  try {
    const menuItemData = {
      ...req.body,
      createdBy: req.user?.id || '000000000000000000000000' // Default admin ID
    };

    const menuItem = new MenuItem(menuItemData);
    await menuItem.save();

    const populatedItem = await MenuItem.findById(menuItem._id)
      .populate('createdBy', 'fullName username')
      .lean();

    res.status(201).json({
      success: true,
      data: populatedItem,
      message: 'Menu item created successfully'
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create menu item',
      error: error.message
    });
  }
});

// Update menu item (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const menuItem = await MenuItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'fullName username');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      data: menuItem,
      message: 'Menu item updated successfully'
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update menu item',
      error: error.message
    });
  }
});

// Delete menu item (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findByIdAndDelete(id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete menu item',
      error: error.message
    });
  }
});

// Get menu categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await MenuItem.distinct('category');
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// Get popular items
router.get('/popular/items', async (req, res) => {
  try {
    const popularItems = await MenuItem.find({ isPopular: true, isAvailable: true })
      .populate('createdBy', 'fullName username')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: popularItems
    });
  } catch (error) {
    console.error('Get popular items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular items',
      error: error.message
    });
  }
});

module.exports = router;
