const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { protect, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Get all orders
router.get('/', async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate('items.menuItem', 'name price image')
      .populate('assignedTo', 'fullName username')
      .populate('createdBy', 'fullName username')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id)
      .populate('items.menuItem', 'name price image description')
      .populate('assignedTo', 'fullName username')
      .populate('createdBy', 'fullName username')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
});

// Create new order
router.post('/', optionalAuth, async (req, res) => {
  console.log('=== ORDER CREATION REQUEST ===');
  console.log('Body type:', typeof req.body);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Body keys:', req.body ? Object.keys(req.body) : 'req.body is null/undefined');
  console.log('User:', req.user);
  console.log('Headers:', req.headers);
  
  try {
    if (!req.body) {
      console.log('ERROR: req.body is null or undefined');
      return res.status(400).json({
        success: false,
        message: 'Request body is missing or invalid'
      });
    }
    
    const { customerInfo, items, paymentMethod = 'cash', notes } = req.body;
    console.log('Parsed data:', { customerInfo, items, paymentMethod });

    // Validate request data
    if (!customerInfo || !items || items.length === 0) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customerInfo and items are required'
      });
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      console.log('Validation failed: Missing customer info fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required customer information: name, email, and phone are required'
      });
    }

    console.log('Request validation passed');

    // Validate menu items exist and calculate totals
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      console.log(`Processing menu item: ${item.menuItem}`);
      let menuItem;
      try {
        menuItem = await MenuItem.findById(item.menuItem);
        if (!menuItem) {
          console.log(`Menu item not found: ${item.menuItem}`);
          return res.status(400).json({
            success: false,
            message: `Menu item with ID ${item.menuItem} not found`
          });
        }

        console.log(`Found menu item: ${menuItem.name}, Available: ${menuItem.isAvailable}`);

        if (!menuItem.isAvailable) {
          console.log(`Menu item not available: ${menuItem.name}`);
          return res.status(400).json({
            success: false,
            message: `Menu item "${menuItem.name}" is not available`
          });
        }
      } catch (dbError) {
        console.error('Database error finding menu item:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database error while validating menu items',
          error: dbError.message
        });
      }

      const itemPrice = menuItem.price * (1 - (menuItem.discount || 0) / 100);
      const itemTotal = itemPrice * item.quantity;

      validatedItems.push({
        menuItem: item.menuItem,
        quantity: item.quantity,
        price: itemPrice,
        totalPrice: itemTotal,
        customization: item.customization || {}
      });

      subtotal += itemTotal;
    }

    // Calculate tax and service charge (example rates)
    const taxRate = 0.1; // 10% tax
    const serviceChargeRate = 0.05; // 5% service charge
    
    const tax = subtotal * taxRate;
    const serviceCharge = subtotal * serviceChargeRate;
    const totalAmount = subtotal + tax + serviceCharge;

    // Calculate estimated delivery time
    const maxPrepTime = Math.max(...validatedItems.map(item => {
      const menuItem = items.find(i => i.menuItem === item.menuItem.toString());
      return menuItem?.preparationTime || 30; // Default 30 minutes
    }));
    const estimatedDelivery = new Date(Date.now() + (maxPrepTime + 15) * 60000); // Add 15 min buffer

    // Generate unique order number using timestamp and random component
    const now = new Date();
    const timestamp = now.getTime();
    const random = Math.floor(Math.random() * 1000);
    const orderNumber = `BH${timestamp}${random}`;

    const orderData = {
      orderNumber,
      customerInfo,
      items: validatedItems,
      subtotal,
      tax,
      serviceCharge,
      totalAmount,
      paymentMethod,
      estimatedDelivery,
      notes,
      createdBy: req.user?.id || null
    };

    const order = new Order(orderData);
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuItem', 'name price image')
      .populate('createdBy', 'fullName username')
      .lean();

    res.status(201).json({
      success: true,
      data: populatedOrder,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    console.error('Order data:', { customerInfo: req.body?.customerInfo, items: req.body?.items });
    res.status(400).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const updateData = { status };
    if (notes) {
      updateData.notes = notes;
    }

    // Set actual delivery time if status is delivered
    if (status === 'delivered') {
      updateData.actualDelivery = new Date();
    }

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('items.menuItem', 'name price image')
     .populate('assignedTo', 'fullName username')
     .populate('createdBy', 'fullName username');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

// Assign order to staff
router.patch('/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { assignedTo },
      { new: true, runValidators: true }
    ).populate('items.menuItem', 'name price image')
     .populate('assignedTo', 'fullName username')
     .populate('createdBy', 'fullName username');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order,
      message: 'Order assigned successfully'
    });
  } catch (error) {
    console.error('Assign order error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to assign order',
      error: error.message
    });
  }
});

// Get order statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      todayRevenue
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfDay, $lt: endOfDay } }),
      Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'preparing'] } }),
      Order.countDocuments({ status: 'delivered' }),
      Order.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: { status: 'delivered', createdAt: { $gte: startOfDay, $lt: endOfDay } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        todayOrders,
        pendingOrders,
        completedOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        todayRevenue: todayRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: error.message
    });
  }
});

// Cancel order
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      });
    }

    // Update order status to cancelled
    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      data: order,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
});

// Get orders by customer email (for guest orders page)
router.get('/customer/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { status, paymentStatus, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter object
    const filter = {
      'customerInfo.email': email
    };
    
    if (status) {
      filter.status = status;
    }
    
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate('items.menuItem', 'name price image')
      .populate('assignedTo', 'fullName username')
      .populate('createdBy', 'fullName username')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer orders',
      error: error.message
    });
  }
});

// Get order by order number (for tracking)
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    const order = await Order.findOne({ orderNumber })
      .populate('items.menuItem', 'name price image description')
      .populate('assignedTo', 'fullName username')
      .populate('createdBy', 'fullName username')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order by order number error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
});

module.exports = router;
