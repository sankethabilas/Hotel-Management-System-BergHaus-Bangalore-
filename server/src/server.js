const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = 5001;

// MongoDB connection
let isMongoConnected = false;
let tempAdmins = []; // Temporary in-memory storage for testing

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://jayavi02:12345@cluster0.cwhej.mongodb.net/berghaus?retryWrites=true&w=majority';
    const opts = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    };
    
    await mongoose.connect(mongoURI, opts);
    console.log('✅ MongoDB Connected:', mongoose.connection.host);
    isMongoConnected = true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('📝 Server will continue with in-memory storage for testing');
    isMongoConnected = false;
  }
};

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'kitchen'],
    default: 'admin'
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

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

const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuSchema);

// In-memory menu items for testing
let tempMenuItems = [];

// Connect to database
connectDB();

app.use(cors());
app.use(express.json());

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
          admin: {
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
          admin: {
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

      // Return admin without password
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

// Debug endpoint to check in-memory admins
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

// Debug endpoint to manually create test admin
app.get('/api/debug/create-admin', async (req, res) => {
  try {
    // Check if admin already exists
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
    const hashedPassword = await bcrypt.hash('12345', saltRounds);

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

// Get all menu items with optional filtering
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

// Debug endpoint to seed menu items for testing
app.get('/api/debug/seed-menu', async (req, res) => {
  try {
    const sampleMenuItems = [
      {
        name: "Himalayan Grilled Salmon",
        description: "Fresh Atlantic salmon grilled with herbs and served with roasted vegetables",
        price: 28.50,
        category: "mains",
        isAvailable: true,
        image: "/images/salmon.jpg",
        ingredients: ["Atlantic salmon", "herbs", "roasted vegetables", "lemon"],
        allergens: ["fish"],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: true,
        spiceLevel: "none",
        preparationTime: 25,
        calories: 420,
        isPopular: true,
        discount: 0,
        tags: ["healthy", "protein", "chef-special"]
      },
      {
        name: "Alpine Mushroom Risotto",
        description: "Creamy arborio rice with wild mushrooms and parmesan cheese",
        price: 22.00,
        category: "mains",
        isAvailable: true,
        image: "/images/risotto.jpg",
        ingredients: ["arborio rice", "wild mushrooms", "parmesan", "vegetable stock"],
        allergens: ["dairy"],
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: false,
        spiceLevel: "none",
        preparationTime: 30,
        calories: 380,
        isPopular: false,
        discount: 10,
        tags: ["vegetarian", "comfort-food"]
      },
      {
        name: "Mountain Berry Cheesecake",
        description: "Rich vanilla cheesecake topped with fresh mountain berries",
        price: 12.50,
        category: "desserts",
        isAvailable: true,
        image: "/images/cheesecake.jpg",
        ingredients: ["cream cheese", "vanilla", "mixed berries", "graham crackers"],
        allergens: ["dairy", "eggs", "gluten"],
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: false,
        spiceLevel: "none",
        preparationTime: 10,
        calories: 320,
        isPopular: true,
        discount: 0,
        tags: ["dessert", "sweet", "popular"]
      }
    ];

    if (isMongoConnected) {
      // Clear existing items
      await MenuItem.deleteMany({});
      
      // Insert sample items
      const createdItems = await MenuItem.insertMany(sampleMenuItems);
      
      res.json({
        success: true,
        message: 'Sample menu items seeded successfully',
        count: createdItems.length,
        data: createdItems
      });
    } else {
      // Clear and add to in-memory storage
      tempMenuItems.length = 0;
      
      const menuItems = sampleMenuItems.map((item, index) => ({
        _id: (Date.now() + index).toString(),
        id: (Date.now() + index).toString(),
        ...item,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      tempMenuItems.push(...menuItems);
      
      res.json({
        success: true,
        message: 'Sample menu items seeded successfully (in-memory)',
        count: menuItems.length,
        data: menuItems
      });
    }
  } catch (error) {
    console.error('Seed menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error seeding menu items',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log('🚀 BergHaus F&B Server running on port ' + PORT);
  console.log('📋 Health check: http://localhost:' + PORT + '/health');
  console.log('🧪 API test: http://localhost:' + PORT + '/api/test');
  console.log('👤 Admin register: POST http://localhost:' + PORT + '/api/admin/register');
  console.log('🔐 Admin login: POST http://localhost:' + PORT + '/api/admin/login');
});
