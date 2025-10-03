const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const Admin = require('./models/Admin');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
const Banner = require('./models/Banner');
const Promotion = require('./models/Promotion');
const Bill = require('./models/Bill');
const billGenerator = require('./services/billGenerator');

const app = express();
const PORT = 5001;

let isMongoConnected = false;
let tempAdmins = [];
let tempMenuItems = [];
let tempBanners = [];
let tempPromotions = [];
let tempOrders = [];

const connectDB = async () => {
  try {
    const mongoURI = 'mongodb+srv://jayavi:123jayavi123@cluster0.6vyj3nr.mongodb.net/hms_database';
    const opts = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      heartbeatFrequencyMS: 10000,
    };
    
    await mongoose.connect(mongoURI, opts);
    console.log('MongoDB Connected:', mongoose.connection.host);
    isMongoConnected = true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Server will continue with in-memory storage for testing');
    isMongoConnected = false;
  }
};

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  isMongoConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  isMongoConnected = false;
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
  isMongoConnected = true;
});

// Menu Schema
const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['starters', 'mains', 'desserts', 'beverages', 'specials']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: ''
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  allergens: [{
    type: String,
    trim: true
  }],
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  isGlutenFree: {
    type: Boolean,
    default: false
  },
  spiceLevel: {
    type: String,
    enum: ['none', 'mild', 'medium', 'hot', 'very-hot'],
    default: 'none'
  },
  preparationTime: {
    type: Number,
    required: true,
    min: 1
  },
  calories: {
    type: Number,
    min: 0
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

connectDB().catch(error => {
  console.error('Database connection failed:', error);
  console.log('Continuing with in-memory storage...');
});

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Import upload middleware
const upload = require('./middleware/upload');

// Image upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imagePath: imagePath,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
});

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Body:', req.body);
  next();
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'BergHaus Express Server is running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Express.js backend is working!',
    data: 'BergHaus API is ready'
  });
});

// Admin Registration Endpoint
app.post('/api/admin/register', async (req, res) => {
  try {
    const { username, email, password, fullName, role = 'admin' } = req.body;

    if (isMongoConnected) {
      // MongoDB logic
      const existingAdmin = await Admin.findOne({
        $or: [{ email }, { username }]
      });

      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Admin with this email or username already exists'
        });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newAdmin = new Admin({
        username,
        email,
        password: hashedPassword,
        fullName,
        role
      });

      await newAdmin.save();

      res.status(201).json({
        success: true,
        message: 'Admin account created successfully',
        data: {
          id: newAdmin._id,
          username: newAdmin.username,
          email: newAdmin.email,
          fullName: newAdmin.fullName,
          role: newAdmin.role
        }
      });
    } else {
      // In-memory storage logic for testing
      const existingAdmin = tempAdmins.find(admin => 
        admin.email === email || admin.username === username
      );

      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Admin with this email or username already exists'
        });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newAdmin = {
        id: Date.now().toString(),
        username,
        email,
        password: hashedPassword,
        fullName,
        role,
        isActive: true,
        createdAt: new Date(),
        lastLogin: null
      };

      tempAdmins.push(newAdmin);

      res.status(201).json({
        success: true,
        message: 'Admin account created successfully (in-memory)',
        data: {
          id: newAdmin.id,
          username: newAdmin.username,
          email: newAdmin.email,
          fullName: newAdmin.fullName,
          role: newAdmin.role
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// Admin Login Endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (isMongoConnected) {
      // MongoDB logic
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

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      admin.lastLogin = new Date();
      await admin.save();

      const jwtSecret = process.env.JWT_SECRET || 'berghaus-secret-key-2025';
      const token = jwt.sign(
        {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        },
        jwtSecret,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: admin._id,
            username: admin.username,
            email: admin.email,
            fullName: admin.fullName,
            role: admin.role,
            lastLogin: admin.lastLogin
          }
        }
      });
    } else {
      // In-memory storage logic
      console.log('🔍 Login: Searching in tempAdmins for:', username);
      console.log('🔍 Login: Available admins:', tempAdmins.map(a => ({ username: a.username, email: a.email })));
      
      const admin = tempAdmins.find(admin => 
        (admin.username === username || admin.email === username) && admin.isActive
      );

      if (!admin) {
        console.log('❌ Login: No admin found for:', username);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      console.log('✅ Login: Admin found:', { username: admin.username, email: admin.email });
      console.log('🔍 Login: Comparing password:', password, 'with hash:', admin.password.substring(0, 20) + '...');
      
      const isValidPassword = await bcrypt.compare(password, admin.password);
      console.log('🔍 Login: Password valid?', isValidPassword);
      
      if (!isValidPassword) {
        console.log('❌ Login: Invalid password for:', username);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      admin.lastLogin = new Date();

      const jwtSecret = process.env.JWT_SECRET || 'berghaus-secret-key-2025';
      const token = jwt.sign(
        {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        },
        jwtSecret,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful (in-memory)',
        data: {
          token,
          user: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            fullName: admin.fullName,
            role: admin.role,
            lastLogin: admin.lastLogin
          }
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// Get Admin Profile (protected route)
app.get('/api/admin/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'berghaus-secret-key-2025';
    const decoded = jwt.verify(token, jwtSecret);
    
    if (isMongoConnected) {
      const admin = await Admin.findById(decoded.id).select('-password');
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
    } else {
      // In-memory storage logic
      const admin = tempAdmins.find(admin => admin.id === decoded.id || admin.email === decoded.email);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      const { password, ...adminData } = admin;
      res.json({
        success: true,
        data: adminData
      });
    }
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

app.get('/api/debug/admins', (req, res) => {
  res.json({
    success: true,
    isMongoConnected,
    adminsCount: tempAdmins.length,
    admins: tempAdmins.map(admin => ({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      createdAt: admin.createdAt
    }))
  });
});

app.get('/api/debug/create-admin', async (req, res) => {
  try {
    const existingAdmin = tempAdmins.find(admin => admin.email === 'abcd@gmail.com');
    if (existingAdmin) {
      return res.json({
        success: true,
        message: 'Admin already exists',
        data: {
          id: existingAdmin.id,
          username: existingAdmin.username,
          email: existingAdmin.email,
          fullName: existingAdmin.fullName,
          role: existingAdmin.role
        }
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin', saltRounds);

    const testAdmin = {
      id: Date.now().toString(),
      username: 'admin',
      email: 'abcd@gmail.com',
      password: hashedPassword,
      fullName: 'Admin User',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      lastLogin: null
    };

    tempAdmins.push(testAdmin);

    res.json({
      success: true,
      message: 'Test admin created successfully',
      data: {
        id: testAdmin.id,
        username: testAdmin.username,
        email: testAdmin.email,
        fullName: testAdmin.fullName,
        role: testAdmin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create test admin',
      error: error.message
    });
  }
});

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'berghaus-secret-key-2025';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// MENU API ENDPOINTS

app.get('/api/menu', async (req, res) => {
  try {
    const { category, isAvailable, search, sort } = req.query;
    
    if (isMongoConnected) {
      // MongoDB logic
      let query = {};
      
      // Build query filters
      if (category) {
        query.category = category;
      }
      
      if (isAvailable !== undefined) {
        query.isAvailable = isAvailable === 'true';
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { ingredients: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ];
      }
      
      let menuQuery = MenuItem.find(query);
      
      // Add sorting
      if (sort) {
        if (sort === 'price-low') {
          menuQuery = menuQuery.sort({ price: 1 });
        } else if (sort === 'price-high') {
          menuQuery = menuQuery.sort({ price: -1 });
        } else if (sort === 'name') {
          menuQuery = menuQuery.sort({ name: 1 });
        } else if (sort === 'popular') {
          menuQuery = menuQuery.sort({ isPopular: -1, name: 1 });
        } else {
          menuQuery = menuQuery.sort({ createdAt: -1 });
        }
      } else {
        menuQuery = menuQuery.sort({ createdAt: -1 });
      }
      
      const menuItems = await menuQuery.exec();
      
      res.json({
        success: true,
        count: menuItems.length,
        data: menuItems
      });
    } else {
      // In-memory logic
      let filteredItems = [...tempMenuItems];
      
      // Apply filters
      if (category) {
        filteredItems = filteredItems.filter(item => item.category === category);
      }
      
      if (isAvailable !== undefined) {
        filteredItems = filteredItems.filter(item => item.isAvailable === (isAvailable === 'true'));
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredItems = filteredItems.filter(item =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.ingredients.some(ing => ing.toLowerCase().includes(searchLower)) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      // Apply sorting
      if (sort) {
        if (sort === 'price-low') {
          filteredItems.sort((a, b) => a.price - b.price);
        } else if (sort === 'price-high') {
          filteredItems.sort((a, b) => b.price - a.price);
        } else if (sort === 'name') {
          filteredItems.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === 'popular') {
          filteredItems.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || a.name.localeCompare(b.name));
        }
      } else {
        filteredItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      
      res.json({
        success: true,
        count: filteredItems.length,
        data: filteredItems
      });
    }
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching menu items',
      error: error.message
    });
  }
});

// Get single menu item by ID
app.get('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isMongoConnected) {
      const menuItem = await MenuItem.findById(id);
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
    } else {
      const menuItem = tempMenuItems.find(item => item._id === id || item.id === id);
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
    }
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching menu item',
      error: error.message
    });
  }
});

// Create new menu item (protected)
app.post('/api/menu', authenticate, async (req, res) => {
  try {
    const menuItemData = req.body;
    
    if (isMongoConnected) {
      const newMenuItem = new MenuItem(menuItemData);
      await newMenuItem.save();
      
      res.status(201).json({
        success: true,
        message: 'Menu item created successfully',
        data: newMenuItem
      });
    } else {
      const newMenuItem = {
        _id: Date.now().toString(),
        id: Date.now().toString(),
        ...menuItemData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      tempMenuItems.push(newMenuItem);
      
      res.status(201).json({
        success: true,
        message: 'Menu item created successfully (in-memory)',
        data: newMenuItem
      });
    }
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating menu item',
      error: error.message
    });
  }
});

// Update menu item (protected)
app.put('/api/menu/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (isMongoConnected) {
      const updatedMenuItem = await MenuItem.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      if (!updatedMenuItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Menu item updated successfully',
        data: updatedMenuItem
      });
    } else {
      const itemIndex = tempMenuItems.findIndex(item => item._id === id || item.id === id);
      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }
      
      tempMenuItems[itemIndex] = {
        ...tempMenuItems[itemIndex],
        ...updateData,
        updatedAt: new Date()
      };
      
      res.json({
        success: true,
        message: 'Menu item updated successfully (in-memory)',
        data: tempMenuItems[itemIndex]
      });
    }
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating menu item',
      error: error.message
    });
  }
});

// Delete menu item (protected)
app.delete('/api/menu/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isMongoConnected) {
      const deletedMenuItem = await MenuItem.findByIdAndDelete(id);
      if (!deletedMenuItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Menu item deleted successfully'
      });
    } else {
      const itemIndex = tempMenuItems.findIndex(item => item._id === id || item.id === id);
      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }
      
      tempMenuItems.splice(itemIndex, 1);
      
      res.json({
        success: true,
        message: 'Menu item deleted successfully (in-memory)'
      });
    }
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting menu item',
      error: error.message
    });
  }
});

// Toggle menu item availability (protected)
app.patch('/api/menu/:id/toggle-availability', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isMongoConnected) {
      const menuItem = await MenuItem.findById(id);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }
      
      menuItem.isAvailable = !menuItem.isAvailable;
      menuItem.updatedAt = new Date();
      await menuItem.save();
      
      res.json({
        success: true,
        message: `Menu item ${menuItem.isAvailable ? 'enabled' : 'disabled'} successfully`,
        data: menuItem
      });
    } else {
      const itemIndex = tempMenuItems.findIndex(item => item._id === id || item.id === id);
      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }
      
      tempMenuItems[itemIndex].isAvailable = !tempMenuItems[itemIndex].isAvailable;
      tempMenuItems[itemIndex].updatedAt = new Date();
      
      res.json({
        success: true,
        message: `Menu item ${tempMenuItems[itemIndex].isAvailable ? 'enabled' : 'disabled'} successfully (in-memory)`,
        data: tempMenuItems[itemIndex]
      });
    }
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling menu item availability',
      error: error.message
    });
  }
});

// Create new order
app.post('/api/orders', async (req, res) => {
  try {
    const { customerInfo, items, paymentMethod = 'cash' } = req.body;
    
    console.log('Order request received:', { customerInfo, items, paymentMethod });
    
    if (!customerInfo || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer info and items are required'
      });
    }
    
    if (isMongoConnected) {
      // Calculate totals
      let subtotal = 0;
      const orderItems = [];
      
      for (const item of items) {
        const menuItem = await MenuItem.findById(item.menuItemId);
        if (!menuItem) {
          return res.status(400).json({
            success: false,
            message: `Menu item with ID ${item.menuItemId} not found`
          });
        }
        
        const itemTotal = menuItem.price * item.quantity;
        subtotal += itemTotal;
        
        orderItems.push({
          menuItem: item.menuItemId,
          quantity: item.quantity,
          price: menuItem.price,
          totalPrice: itemTotal,
          customization: item.customization || {
            dietaryRestrictions: [],
            portionSize: 'regular',
            modifications: [],
            specialInstructions: '',
            cookingPreferences: []
          }
        });
      }
      
      // Calculate tax and service charge (example: 10% tax, 5% service)
      const tax = subtotal * 0.10;
      const serviceCharge = subtotal * 0.05;
      const totalAmount = subtotal + tax + serviceCharge;
      
      // Generate order number manually
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const count = await Order.countDocuments({
        createdAt: { $gte: todayStart, $lt: todayEnd }
      });
      
      const orderNumber = `BH${dateStr}${String(count + 1).padStart(3, '0')}`;
      
      const newOrder = new Order({
        orderNumber,
        customerInfo,
        items: orderItems,
        subtotal,
        tax,
        serviceCharge,
        totalAmount,
        paymentMethod,
        status: 'pending',
        paymentStatus: 'pending'
      });
      
      await newOrder.save();
      
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          orderId: newOrder._id,
          orderNumber: newOrder.orderNumber,
          totalAmount: newOrder.totalAmount,
          status: newOrder.status
        }
      });
    } else {
      // In-memory storage for testing
      const orderNumber = `BH${Date.now().toString().slice(-6)}`;
      
      // Calculate totals using temp menu items
      let subtotal = 0;
      const orderItems = [];
      
      for (const item of items) {
        const menuItem = tempMenuItems.find(m => m._id === item.menuItemId);
        if (!menuItem) {
          return res.status(400).json({
            success: false,
            message: `Menu item with ID ${item.menuItemId} not found`
          });
        }
        
        const itemTotal = menuItem.price * item.quantity;
        subtotal += itemTotal;
        
        orderItems.push({
          menuItem: item.menuItemId,
          quantity: item.quantity,
          price: menuItem.price,
          totalPrice: itemTotal,
          customization: item.customization || {
            dietaryRestrictions: [],
            portionSize: 'regular',
            modifications: [],
            specialInstructions: '',
            cookingPreferences: []
          }
        });
      }
      
      const tax = subtotal * 0.10;
      const serviceCharge = subtotal * 0.05;
      const totalAmount = subtotal + tax + serviceCharge;
      
      const newOrder = {
        _id: Date.now().toString(),
        orderNumber,
        customerInfo,
        items: orderItems,
        subtotal,
        tax,
        serviceCharge,
        totalAmount,
        paymentMethod,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date()
      };
      
      res.status(201).json({
        success: true,
        message: 'Order created successfully (in-memory)',
        data: {
          orderId: newOrder._id,
          orderNumber: newOrder.orderNumber,
          totalAmount: newOrder.totalAmount,
          status: newOrder.status
        }
      });
    }
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// Get order by order number (for tracking)
app.get('/api/orders/track/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    console.log('Order tracking request for:', orderNumber);
    
    if (isMongoConnected) {
      const order = await Order.findOne({ orderNumber }).populate('items.menuItem');
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Order found',
        data: order
      });
    } else {
      // In-memory storage for testing
      res.status(404).json({
        success: false,
        message: 'Order tracking not available in test mode'
      });
    }
  } catch (error) {
    console.error('Order tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track order',
      error: error.message
    });
  }
});

// Get all orders (admin only)
app.get('/api/admin/orders', async (req, res) => {
  try {
    if (isMongoConnected) {
      const orders = await Order.find()
        .populate('items.menuItem')
        .sort({ createdAt: -1 });
      
      res.json({
        success: true,
        message: 'Orders retrieved successfully',
        data: orders
      });
    } else {
      // In-memory storage for testing
      res.json({
        success: true,
        message: 'Orders retrieved successfully (in-memory)',
        data: []
      });
    }
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders',
      error: error.message
    });
  }
});

// Update order status (admin only)
app.put('/api/admin/orders/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, confirmed, preparing, ready, delivered, completed, cancelled'
      });
    }

    if (isMongoConnected) {
      const order = await Order.findByIdAndUpdate(
        id, 
        { status }, 
        { new: true }
      ).populate('items.menuItem');
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: order
      });
    } else {
      // In-memory fallback
      const orderIndex = inMemoryOrders.findIndex(o => o._id === id);
      if (orderIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      inMemoryOrders[orderIndex].status = status;
      res.json({
        success: true,
        message: 'Order status updated successfully (in-memory)',
        data: inMemoryOrders[orderIndex]
      });
    }
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

// Get all banners (public)
app.get('/api/banners', async (req, res) => {
  try {
    if (isMongoConnected) {
      const banners = await Banner.find().sort({ priority: -1, createdAt: -1 });
      
      res.json({
        success: true,
        message: 'Banners retrieved successfully',
        data: banners
      });
    } else {
      // In-memory storage for testing
      res.json({
        success: true,
        message: 'Banners retrieved successfully (in-memory)',
        data: []
      });
    }
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve banners',
      error: error.message
    });
  }
});

// Create new menu item (admin only)
app.post('/api/admin/menu', authenticate, async (req, res) => {
  try {
    const menuItemData = req.body;
    
    if (isMongoConnected) {
      const newMenuItem = new MenuItem({
        ...menuItemData,
        createdBy: req.user.id
      });
      await newMenuItem.save();
      
      res.status(201).json({
        success: true,
        message: 'Menu item created successfully',
        data: newMenuItem
      });
    } else {
      const newMenuItem = {
        _id: Date.now().toString(),
        id: Date.now().toString(),
        ...menuItemData,
        createdBy: req.user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      tempMenuItems.push(newMenuItem);
      
      res.status(201).json({
        success: true,
        message: 'Menu item created successfully (in-memory)',
        data: newMenuItem
      });
    }
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create menu item'
    });
  }
});

// Get all menu items (admin only)
app.get('/api/admin/menu', authenticate, async (req, res) => {
  try {
    if (isMongoConnected) {
      const menuItems = await MenuItem.find().sort({ createdAt: -1 });
      
      res.json({
        success: true,
        message: 'Menu items retrieved successfully',
        data: menuItems
      });
    } else {
      // In-memory storage for testing
      res.json({
        success: true,
        message: 'Menu items retrieved successfully (in-memory)',
        data: inMemoryMenuItems
      });
    }
  } catch (error) {
    console.error('Get admin menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve menu items',
      error: error.message
    });
  }
});

// Create new banner (admin only)
app.post('/api/admin/banners', authenticate, async (req, res) => {
  try {
    const bannerData = {
      ...req.body,
      createdBy: req.user.id // Add the authenticated user's ID
    };
    
    if (isMongoConnected) {
      const newBanner = new Banner(bannerData);
      await newBanner.save();
      
      res.status(201).json({
        success: true,
        message: 'Banner created successfully',
        data: newBanner
      });
    } else {
      const newBanner = {
        _id: Date.now().toString(),
        id: Date.now().toString(),
        ...bannerData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      inMemoryBanners.push(newBanner);
      
      res.status(201).json({
        success: true,
        message: 'Banner created successfully (in-memory)',
        data: newBanner
      });
    }
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create banner',
      error: error.message
    });
  }
});

// Get all banners (admin only)
app.get('/api/admin/banners', authenticate, async (req, res) => {
  try {
    if (isMongoConnected) {
      const banners = await Banner.find().sort({ createdAt: -1 });
      
      res.json({
        success: true,
        message: 'Banners retrieved successfully',
        data: banners
      });
    } else {
      // In-memory storage for testing
      res.json({
        success: true,
        message: 'Banners retrieved successfully (in-memory)',
        data: []
      });
    }
  } catch (error) {
    console.error('Get admin banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve banners',
      error: error.message
    });
  }
});

// Update banner (admin only)
app.put('/api/admin/banners/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    if (isMongoConnected) {
      const banner = await Banner.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      );
      
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
    } else {
      const bannerIndex = tempBanners.findIndex(banner => banner._id === id || banner.id === id);
      if (bannerIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Banner not found'
        });
      }
      
      tempBanners[bannerIndex] = {
        ...tempBanners[bannerIndex],
        ...updateData
      };
      
      res.json({
        success: true,
        message: 'Banner updated successfully (in-memory)',
        data: tempBanners[bannerIndex]
      });
    }
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
app.delete('/api/admin/banners/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isMongoConnected) {
      const banner = await Banner.findByIdAndDelete(id);
      
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
    } else {
      res.status(500).json({
        success: false,
        message: 'Database not connected'
      });
    }
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete banner',
      error: error.message
    });
  }
});

// Update menu item (admin only)
app.put('/api/admin/menu/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    if (isMongoConnected) {
      const menuItem = await MenuItem.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      );
      
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Menu item updated successfully',
        data: menuItem
      });
    } else {
      const itemIndex = tempMenuItems.findIndex(item => item._id === id || item.id === id);
      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }
      
      tempMenuItems[itemIndex] = {
        ...tempMenuItems[itemIndex],
        ...updateData
      };
      
      res.json({
        success: true,
        message: 'Menu item updated successfully (in-memory)',
        data: tempMenuItems[itemIndex]
      });
    }
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update menu item',
      error: error.message
    });
  }
});

// Delete menu item (admin only)
app.delete('/api/admin/menu/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isMongoConnected) {
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
    } else {
      res.status(500).json({
        success: false,
        message: 'Database not connected'
      });
    }
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete menu item',
      error: error.message
    });
  }
});

// ==================== PROMOTION MANAGEMENT ENDPOINTS ====================

// Get all promotions (admin)
app.get('/api/admin/promotions', authenticate, async (req, res) => {
  try {
    if (isMongoConnected) {
      const promotions = await Promotion.find().sort({ createdAt: -1 });
      
      res.json({
        success: true,
        message: 'Promotions retrieved successfully',
        data: promotions
      });
    } else {
      res.json({
        success: true,
        message: 'Promotions retrieved successfully (in-memory)',
        data: []
      });
    }
  } catch (error) {
    console.error('Get promotions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve promotions',
      error: error.message
    });
  }
});

// Create new promotion (admin)
app.post('/api/admin/promotions', authenticate, async (req, res) => {
  try {
    const promotionData = req.body;
    
    if (isMongoConnected) {
      const promotion = new Promotion(promotionData);
      await promotion.save();
      
      res.status(201).json({
        success: true,
        message: 'Promotion created successfully',
        data: promotion
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Database not connected'
      });
    }
  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create promotion',
      error: error.message
    });
  }
});

// Update promotion (admin)
app.put('/api/admin/promotions/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (isMongoConnected) {
      const promotion = await Promotion.findByIdAndUpdate(
        id,
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
    } else {
      const promotionIndex = tempPromotions.findIndex(promo => promo._id === id || promo.id === id);
      if (promotionIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Promotion not found'
        });
      }
      
      tempPromotions[promotionIndex] = {
        ...tempPromotions[promotionIndex],
        ...updateData,
        updatedAt: new Date()
      };
      
      res.json({
        success: true,
        message: 'Promotion updated successfully (in-memory)',
        data: tempPromotions[promotionIndex]
      });
    }
  } catch (error) {
    console.error('Update promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update promotion',
      error: error.message
    });
  }
});

// Delete promotion (admin)
app.delete('/api/admin/promotions/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isMongoConnected) {
      const promotion = await Promotion.findByIdAndDelete(id);
      
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
    } else {
      res.status(500).json({
        success: false,
        message: 'Database not connected'
      });
    }
  } catch (error) {
    console.error('Delete promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete promotion',
      error: error.message
    });
  }
});

// Get active promotions for guests
app.get('/api/promotions/active', async (req, res) => {
  try {
    if (isMongoConnected) {
      const promotions = await Promotion.find({ isActive: true });
      
      // Filter promotions that are currently valid
      const activePromotions = promotions.filter(promotion => promotion.isCurrentlyValid());
      
      res.json({
        success: true,
        message: 'Active promotions retrieved successfully',
        data: activePromotions
      });
    } else {
      res.json({
        success: true,
        message: 'Active promotions retrieved successfully (in-memory)',
        data: []
      });
    }
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
app.post('/api/promotions/calculate-discount', async (req, res) => {
  try {
    const { orderItems, totalAmount } = req.body;
    
    if (isMongoConnected) {
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
    } else {
      res.json({
        success: true,
        message: 'Discount calculated successfully (in-memory)',
        data: {
          discountAmount: 0,
          promotion: null,
          finalAmount: totalAmount
        }
      });
    }
  } catch (error) {
    console.error('Calculate discount error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate discount',
      error: error.message
    });
  }
});

// ==================== ORDER MANAGEMENT ENDPOINTS ====================

// Get all orders (for guest orders page)
app.get('/api/orders', async (req, res) => {
  try {
    if (isMongoConnected) {
      const orders = await Order.find()
        .populate('items.menuItem')
        .sort({ createdAt: -1 });
      
      res.json({
        success: true,
        message: 'Orders retrieved successfully',
        data: orders
      });
    } else {
      res.json({
        success: true,
        message: 'Orders retrieved successfully (in-memory)',
        data: []
      });
    }
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders',
      error: error.message
    });
  }
});

// Cancel order (guest only)
app.put('/api/orders/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isMongoConnected) {
      const order = await Order.findById(id);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Only allow cancellation of pending or confirmed orders
      if (order.status === 'preparing' || order.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel order that is already being prepared or completed'
        });
      }

      if (order.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Order is already cancelled'
        });
      }

      // Update order status to cancelled
      order.status = 'cancelled';
      await order.save();

      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: order
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Database not connected'
      });
    }
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
});

// ==================== REPORT GENERATION ENDPOINTS ====================

// Daily Sales Report
app.get('/api/reports/daily-sales', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { status: 'completed' };
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to last 7 days if no date range provided
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query.createdAt = { $gte: sevenDaysAgo };
    }

    if (isMongoConnected) {
      const orders = await Order.find(query).populate('items.menuItem');
      
      // Calculate summary data
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const totalOrders = orders.length;
      
      // Category breakdown
      const categoryBreakdown = {};
      const topSellingItems = {};
      const hourlySales = {};
      
      orders.forEach(order => {
        // Hourly sales
        const hour = new Date(order.createdAt).getHours();
        hourlySales[hour] = (hourlySales[hour] || 0) + order.totalAmount;
        
        order.items.forEach(item => {
          if (item.menuItem) {
            // Category breakdown
            const category = item.menuItem.category || 'Uncategorized';
            categoryBreakdown[category] = (categoryBreakdown[category] || 0) + item.totalPrice;
            
            // Top selling items
            topSellingItems[item.menuItem.name] = (topSellingItems[item.menuItem.name] || 0) + item.quantity;
          }
        });
      });

      // Payment method breakdown
      const paymentMethods = {};
      orders.forEach(order => {
        paymentMethods[order.paymentMethod] = (paymentMethods[order.paymentMethod] || 0) + 1;
      });

      res.json({
        success: true,
        data: {
          summary: {
            totalRevenue,
            totalOrders,
            averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
          },
          categoryBreakdown,
          topSellingItems: Object.entries(topSellingItems)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10),
          hourlySales,
          paymentMethods
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          summary: { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 },
          categoryBreakdown: {},
          topSellingItems: [],
          hourlySales: {},
          paymentMethods: {}
        }
      });
    }
  } catch (error) {
    console.error('Daily sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate daily sales report',
      error: error.message
    });
  }
});

// Food Waste Analysis Report
app.get('/api/reports/food-waste', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { status: 'cancelled' };
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.createdAt = { $gte: thirtyDaysAgo };
    }

    if (isMongoConnected) {
      const cancelledOrders = await Order.find(query).populate('items.menuItem');
      
      const totalWasteValue = cancelledOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const totalCancelledOrders = cancelledOrders.length;
      
      // Most wasted items
      const wastedItems = {};
      cancelledOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.menuItem) {
            const itemName = item.menuItem.name;
            wastedItems[itemName] = {
              quantity: (wastedItems[itemName]?.quantity || 0) + item.quantity,
              value: (wastedItems[itemName]?.value || 0) + item.totalPrice
            };
          }
        });
      });

      // Calculate waste percentage (assuming total orders for comparison)
      const totalOrders = await Order.countDocuments({ 
        createdAt: query.createdAt || { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });
      const wastePercentage = totalOrders > 0 ? (totalCancelledOrders / totalOrders) * 100 : 0;

      // Generate recommendations based on waste analysis
      const recommendations = [];
      if (wastePercentage > 20) {
        recommendations.push("High waste percentage detected - review order management process");
      }
      if (totalCancelledOrders > 5) {
        recommendations.push("Multiple cancellations - consider prepayment or order confirmation");
      }
      if (Object.keys(wastedItems).length > 0) {
        const topWasted = Object.entries(wastedItems)[0];
        recommendations.push(`Reduce inventory for ${topWasted[0]} - high cancellation rate`);
      }
      if (recommendations.length === 0) {
        recommendations.push("Waste levels are within acceptable range");
      }

      res.json({
        success: true,
        data: {
          summary: {
            totalWasteValue,
            totalCancelledOrders,
            wastePercentage: Math.round(wastePercentage * 100) / 100
          },
          topWastedItems: Object.entries(wastedItems)
            .sort(([,a], [,b]) => b.value - a.value)
            .slice(0, 10)
            .map(([itemName, data]) => [itemName, data.quantity]),
          recommendations
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          summary: { totalWasteValue: 0, totalCancelledOrders: 0, wastePercentage: 0 },
          topWastedItems: [],
          recommendations: ["No waste data available for the selected period"]
        }
      });
    }
  } catch (error) {
    console.error('Food waste report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate food waste report',
      error: error.message
    });
  }
});

// Ingredient Usage Forecast Report
app.get('/api/reports/ingredient-forecast', authenticate, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    if (isMongoConnected) {
      // Get completed orders from last 30 days for forecasting
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentOrders = await Order.find({
        status: 'completed',
        createdAt: { $gte: thirtyDaysAgo }
      }).populate('items.menuItem');

      // Calculate average daily usage
      const dailyUsage = {};
      const totalDays = 30;
      
      recentOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.menuItem) {
            const itemName = item.menuItem.name;
            dailyUsage[itemName] = (dailyUsage[itemName] || 0) + item.quantity;
          }
        });
      });

      // Calculate forecast for next N days
      const forecast = {};
      Object.entries(dailyUsage).forEach(([itemName, totalQuantity]) => {
        const avgDailyUsage = totalQuantity / totalDays;
        const forecastQuantity = Math.ceil(avgDailyUsage * parseInt(days));
        
        forecast[itemName] = {
          currentDailyAverage: Math.round(avgDailyUsage * 100) / 100,
          forecastQuantity,
          recommendation: forecastQuantity > 50 ? 'High demand expected' : 
                         forecastQuantity > 20 ? 'Moderate demand' : 'Low demand'
        };
      });

      // Transform data to match frontend expectations
      const topIngredients = Object.entries(forecast)
        .sort(([,a], [,b]) => b.forecastQuantity - a.forecastQuantity)
        .map(([name, data]) => [name, data.currentDailyAverage]);

      const next7Days = Object.fromEntries(
        Object.entries(forecast).map(([name, data]) => [name, data.forecastQuantity])
      );

      const recommendations = Object.entries(forecast)
        .filter(([,data]) => data.recommendation === 'High demand expected')
        .map(([name]) => `High demand expected for ${name} - prepare extra inventory`);

      res.json({
        success: true,
        data: {
          forecastPeriod: `${days} days`,
          topIngredients,
          categoryTrends: {},
          forecasts: {
            next7Days
          },
          recommendations,
          summary: {
            totalItemsForecasted: Object.keys(forecast).length,
            highDemandItems: Object.values(forecast).filter(item => item.recommendation === 'High demand expected').length
          }
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          forecastPeriod: `${days} days`,
          topIngredients: [],
          categoryTrends: {},
          forecasts: {
            next7Days: {}
          },
          recommendations: [],
          summary: { totalItemsForecasted: 0, highDemandItems: 0 }
        }
      });
    }
  } catch (error) {
    console.error('Ingredient forecast report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate ingredient forecast report',
      error: error.message
    });
  }
});

// ================================
// BILL GENERATION ENDPOINTS
// ================================

// Generate bill for an order (guest version - no auth required)
app.post('/api/bills/generate/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { serviceChargePercentage = 10, vatPercentage = 15, discount = 0, discountReason = '', notes = '' } = req.body;

    let order;
    if (isMongoConnected) {
      order = await Order.findById(orderId).populate('items.menuItem');
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
    } else {
      order = tempOrders.find(o => o._id === orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
    }

    // Allow generating multiple bills for the same order
    // (Removed duplicate bill check to allow multiple bill generations)

    // Prepare bill data
    const billNumber = Bill.generateBillNumber();
    const items = order.items.map(item => ({
      menuItemId: item.menuItem._id || item.menuItem,
      name: item.menuItem.name || 'Unknown Item',
      quantity: item.quantity,
      unitPrice: item.menuItem.price || 0,
      totalPrice: (item.menuItem.price || 0) * item.quantity
    }));

    const billData = {
      billNumber,
      orderId,
      orderNumber: order.orderNumber,
      customerInfo: order.customerInfo,
      items,
      pricing: {
        subtotal: items.reduce((sum, item) => sum + item.totalPrice, 0),
        serviceChargePercentage,
        vatPercentage,
        discount,
        discountReason
      },
      paymentMethod: order.paymentMethod,
      status: 'generated',
      generatedBy: req.user ? req.user.id : null, // Allow guest generation
      notes
    };

    // Calculate totals
    const bill = new Bill(billData);
    bill.calculateTotals();

    let savedBill;
    if (isMongoConnected) {
      savedBill = await bill.save();
    } else {
      // For in-memory storage
      savedBill = {
        ...bill.toObject(),
        _id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    res.status(201).json({
      success: true,
      message: 'Bill generated successfully',
      data: {
        billId: savedBill._id,
        billNumber: savedBill.billNumber,
        orderNumber: savedBill.orderNumber,
        total: savedBill.pricing.total,
        status: savedBill.status
      }
    });

  } catch (error) {
    console.error('Generate bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate bill',
      error: error.message
    });
  }
});

// Get bill PDF (guest version - no auth required)
app.get('/api/bills/:billId/pdf', async (req, res) => {
  try {
    console.log('PDF request for bill ID:', req.params.billId);
    const { billId } = req.params;

    let bill;
    if (isMongoConnected) {
      bill = await Bill.findById(billId).populate('orderId');
      if (!bill) {
        console.log('Bill not found:', billId);
        return res.status(404).json({
          success: false,
          message: 'Bill not found'
        });
      }
      console.log('Bill found:', bill.billNumber);
    } else {
      console.log('Database not connected');
      return res.status(503).json({
        success: false,
        message: 'PDF generation requires database connection'
      });
    }

    // Generate PDF
    console.log('Converting bill to plain object...');
    const plainBill = bill.toObject ? bill.toObject() : bill;
    console.log('Bill data before PDF generation:', JSON.stringify(plainBill, null, 2));
    
    console.log('Calling PDF generator...');
    const pdfBuffer = await billGenerator.generatePDF(plainBill);
    console.log('PDF generated successfully, size:', pdfBuffer.length);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="bill-${bill.billNumber}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Generate PDF error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error.message
    });
  }
});

// Get all bills
app.get('/api/bills', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customerEmail, roomNumber } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (customerEmail) query['customerInfo.email'] = customerEmail;
    if (roomNumber) query['customerInfo.roomNumber'] = roomNumber;

    let bills;
    if (isMongoConnected) {
      bills = await Bill.find(query)
        .populate('orderId', 'orderNumber status')
        .populate('generatedBy', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Bill.countDocuments(query);
      
      res.json({
        success: true,
        data: {
          bills,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          bills: [],
          pagination: { current: 1, pages: 0, total: 0 }
        }
      });
    }

  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bills',
      error: error.message
    });
  }
});

// Get bill by ID
app.get('/api/bills/:billId', authenticate, async (req, res) => {
  try {
    const { billId } = req.params;

    let bill;
    if (isMongoConnected) {
      bill = await Bill.findById(billId)
        .populate('orderId', 'orderNumber status items')
        .populate('generatedBy', 'username')
        .populate('items.menuItemId', 'name price');
      
      if (!bill) {
        return res.status(404).json({
          success: false,
          message: 'Bill not found'
        });
      }
    } else {
      return res.status(503).json({
        success: false,
        message: 'Bill retrieval requires database connection'
      });
    }

    res.json({
      success: true,
      data: bill
    });

  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bill',
      error: error.message
    });
  }
});

// Mark bill as paid
app.put('/api/bills/:billId/pay', authenticate, async (req, res) => {
  try {
    const { billId } = req.params;

    let bill;
    if (isMongoConnected) {
      bill = await Bill.findById(billId);
      if (!bill) {
        return res.status(404).json({
          success: false,
          message: 'Bill not found'
        });
      }

      await bill.markAsPaid();
      
      res.json({
        success: true,
        message: 'Bill marked as paid',
        data: { billId: bill._id, status: bill.status, paidAt: bill.paidAt }
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Bill payment requires database connection'
      });
    }

  } catch (error) {
    console.error('Mark bill as paid error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark bill as paid',
      error: error.message
    });
  }
});

// Process refund
app.put('/api/bills/:billId/refund', authenticate, async (req, res) => {
  try {
    const { billId } = req.params;
    const { reason } = req.body;

    let bill;
    if (isMongoConnected) {
      bill = await Bill.findById(billId);
      if (!bill) {
        return res.status(404).json({
          success: false,
          message: 'Bill not found'
        });
      }

      await bill.processRefund(reason);
      
      res.json({
        success: true,
        message: 'Refund processed successfully',
        data: { 
          billId: bill._id, 
          status: bill.status, 
          refundedAt: bill.refundedAt,
          refundReason: bill.refundReason
        }
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Refund processing requires database connection'
      });
    }

  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log('BergHaus F&B Server running on port ' + PORT);
  console.log('Health check: http://localhost:' + PORT + '/health');
  console.log('API test: http://localhost:' + PORT + '/api/test');
  console.log('Admin register: POST http://localhost:' + PORT + '/api/admin/register');
  console.log('Admin login: POST http://localhost:' + PORT + '/api/admin/login');
});
