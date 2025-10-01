const mongoose = require('mongoose');

// MongoDB connection
const mongoURI = 'mongodb+srv://jayavi:123jayavi123@cluster0.6vyj3nr.mongodb.net/hms_database';

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  populateData();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Menu Item Schema
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['breakfast', 'lunch', 'dinner', 'beverages', 'desserts', 'snacks', 'appetizers', 'specials'],
    required: true 
  },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'anytime'], default: 'anytime' },
  availableHours: {
    start: { type: String, default: "00:00" },
    end: { type: String, default: "23:59" }
  },
  image: { type: String },
  isAvailable: { type: Boolean, default: true },
  dietaryInfo: {
    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false },
    allergens: [{ type: String }]
  },
  customizationOptions: {
    portionSizes: [{ size: String, price: Number }],
    modifications: [{ name: String, price: Number }]
  },
  portionPricing: {
    small: { type: Number },
    medium: { type: Number },
    large: { type: Number }
  }
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, default: 'admin' }
});

const Admin = mongoose.model('Admin', adminSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    quantity: { type: Number, required: true },
    customization: {
      dietaryRestrictions: { type: String },
      portionSize: { type: String },
      modifications: [{ type: String }],
      specialInstructions: { type: String },
      cookingPreferences: { type: String }
    }
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending' 
  },
  orderDate: { type: Date, default: Date.now },
  estimatedTime: { type: Number, default: 30 },
  specialInstructions: { type: String }
});

const Order = mongoose.model('Order', orderSchema);

// Promotion Schema
const promotionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  discountPercentage: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['percentage', 'seasonal', 'category', 'time-based'],
    required: true 
  },
  categories: [{ type: String }],
  timeRanges: [{
    startTime: String,
    endTime: String,
    days: [String]
  }],
  seasonalDates: {
    startDate: Date,
    endDate: Date
  },
  isActive: { type: Boolean, default: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscountAmount: { type: Number },
  usageCount: { type: Number, default: 0 },
  maxUsage: { type: Number }
});

const Promotion = mongoose.model('Promotion', promotionSchema);

// Banner Schema
const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String, required: true },
  linkUrl: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date }
});

const Banner = mongoose.model('Banner', bannerSchema);

async function populateData() {
  try {
    console.log('🗑️  Clearing existing data...');
    await MenuItem.deleteMany({});
    await Admin.deleteMany({});
    await Order.deleteMany({});
    await Promotion.deleteMany({});
    await Banner.deleteMany({});

    console.log('🍽️  Creating menu items...');
    const menuItems = [
      // Breakfast Items
      {
        name: "Continental Breakfast",
        description: "Fresh croissants, butter, jam, orange juice, and coffee",
        price: 12.99,
        category: "breakfast",
        mealType: "breakfast",
        availableHours: { start: "06:00", end: "11:00" },
        dietaryInfo: { isVegetarian: true, allergens: ["gluten", "dairy"] },
        customizationOptions: {
          portionSizes: [{ size: "Regular", price: 12.99 }],
          modifications: [{ name: "Extra Coffee", price: 2.00 }]
        }
      },
      {
        name: "Full English Breakfast",
        description: "Eggs, bacon, sausage, beans, toast, and tea",
        price: 15.99,
        category: "breakfast",
        mealType: "breakfast",
        availableHours: { start: "06:00", end: "11:00" },
        dietaryInfo: { isVegetarian: false, allergens: ["gluten", "dairy", "eggs"] }
      },
      {
        name: "Pancakes with Maple Syrup",
        description: "Fluffy pancakes served with maple syrup and fresh berries",
        price: 11.99,
        category: "breakfast",
        mealType: "breakfast",
        availableHours: { start: "06:00", end: "11:00" },
        dietaryInfo: { isVegetarian: true, allergens: ["gluten", "dairy", "eggs"] }
      },

      // Lunch Items
      {
        name: "Caesar Salad",
        description: "Fresh romaine lettuce, parmesan cheese, croutons, and caesar dressing",
        price: 13.99,
        category: "lunch",
        mealType: "lunch",
        availableHours: { start: "11:00", end: "15:00" },
        dietaryInfo: { isVegetarian: true, allergens: ["dairy", "gluten"] }
      },
      {
        name: "Grilled Chicken Sandwich",
        description: "Grilled chicken breast with lettuce, tomato, and mayo on artisan bread",
        price: 16.99,
        category: "lunch",
        mealType: "lunch",
        availableHours: { start: "11:00", end: "15:00" },
        dietaryInfo: { isVegetarian: false, allergens: ["gluten", "eggs"] }
      },
      {
        name: "Beef Burger",
        description: "Juicy beef patty with cheese, lettuce, tomato, and special sauce",
        price: 18.99,
        category: "lunch",
        mealType: "lunch",
        availableHours: { start: "11:00", end: "15:00" },
        dietaryInfo: { isVegetarian: false, allergens: ["gluten", "dairy", "eggs"] }
      },

      // Dinner Items
      {
        name: "Grilled Salmon",
        description: "Fresh Atlantic salmon with lemon butter sauce and seasonal vegetables",
        price: 24.99,
        category: "dinner",
        mealType: "dinner",
        availableHours: { start: "15:00", end: "22:00" },
        dietaryInfo: { isVegetarian: false, allergens: ["fish", "dairy"] }
      },
      {
        name: "Beef Steak",
        description: "Tender beef steak cooked to perfection with roasted potatoes",
        price: 28.99,
        category: "dinner",
        mealType: "dinner",
        availableHours: { start: "15:00", end: "22:00" },
        dietaryInfo: { isVegetarian: false, allergens: [] }
      },
      {
        name: "Vegetarian Pasta",
        description: "Penne pasta with seasonal vegetables in tomato basil sauce",
        price: 19.99,
        category: "dinner",
        mealType: "dinner",
        availableHours: { start: "15:00", end: "22:00" },
        dietaryInfo: { isVegetarian: true, allergens: ["gluten"] }
      },

      // Beverages
      {
        name: "Fresh Orange Juice",
        description: "Freshly squeezed orange juice",
        price: 4.99,
        category: "beverages",
        mealType: "anytime",
        availableHours: { start: "00:00", end: "23:59" },
        dietaryInfo: { isVegetarian: true, isVegan: true, allergens: [] }
      },
      {
        name: "Cappuccino",
        description: "Rich espresso with steamed milk and foam",
        price: 3.99,
        category: "beverages",
        mealType: "anytime",
        availableHours: { start: "00:00", end: "23:59" },
        dietaryInfo: { isVegetarian: true, allergens: ["dairy"] }
      },
      {
        name: "Iced Tea",
        description: "Refreshing iced tea with lemon",
        price: 2.99,
        category: "beverages",
        mealType: "anytime",
        availableHours: { start: "00:00", end: "23:59" },
        dietaryInfo: { isVegetarian: true, isVegan: true, allergens: [] }
      },

      // Desserts
      {
        name: "Chocolate Cake",
        description: "Rich chocolate cake with chocolate ganache",
        price: 8.99,
        category: "desserts",
        mealType: "anytime",
        availableHours: { start: "00:00", end: "23:59" },
        dietaryInfo: { isVegetarian: true, allergens: ["gluten", "dairy", "eggs"] }
      },
      {
        name: "Tiramisu",
        description: "Classic Italian dessert with coffee and mascarpone",
        price: 9.99,
        category: "desserts",
        mealType: "anytime",
        availableHours: { start: "00:00", end: "23:59" },
        dietaryInfo: { isVegetarian: true, allergens: ["gluten", "dairy", "eggs"] }
      }
    ];

    await MenuItem.insertMany(menuItems);
    console.log(`✅ Created ${menuItems.length} menu items`);

    console.log('👤 Creating admin user...');
    const admin = new Admin({
      username: 'admin',
      email: 'admin@berghaus.com',
      password: 'admin123',
      fullName: 'BergHaus Administrator',
      role: 'admin'
    });
    await admin.save();
    console.log('✅ Created admin user');

    console.log('🎉 Creating promotions...');
    const promotions = [
      {
        name: "Early Bird Special",
        description: "20% off breakfast items before 9 AM",
        discountPercentage: 20,
        type: "time-based",
        categories: ["breakfast"],
        timeRanges: [{
          startTime: "06:00",
          endTime: "09:00",
          days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        }],
        isActive: true,
        minOrderAmount: 15,
        maxDiscountAmount: 10
      },
      {
        name: "Weekend Brunch",
        description: "15% off all lunch items on weekends",
        discountPercentage: 15,
        type: "category",
        categories: ["lunch"],
        isActive: true,
        minOrderAmount: 20
      },
      {
        name: "Summer Special",
        description: "10% off all beverages during summer",
        discountPercentage: 10,
        type: "seasonal",
        categories: ["beverages"],
        seasonalDates: {
          startDate: new Date('2025-06-01'),
          endDate: new Date('2025-08-31')
        },
        isActive: true,
        minOrderAmount: 10
      }
    ];

    await Promotion.insertMany(promotions);
    console.log(`✅ Created ${promotions.length} promotions`);

    console.log('🖼️  Creating banners...');
    const banners = [
      {
        title: "Welcome to BergHaus",
        description: "Experience luxury dining at its finest",
        imageUrl: "/images/banner1.jpg",
        linkUrl: "/guest/menu",
        isActive: true,
        order: 1
      },
      {
        title: "Special Offers",
        description: "Check out our latest promotions",
        imageUrl: "/images/banner2.jpg",
        linkUrl: "/guest/menu",
        isActive: true,
        order: 2
      }
    ];

    await Banner.insertMany(banners);
    console.log(`✅ Created ${banners.length} banners`);

    console.log('📋 Creating sample orders...');
    const sampleOrders = [
      {
        orderNumber: "ORD-001",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: "+1234567890",
        items: [{
          item: menuItems[0]._id,
          quantity: 2,
          customization: {
            dietaryRestrictions: "No dairy",
            portionSize: "Regular",
            specialInstructions: "Extra crispy"
          }
        }],
        totalAmount: 25.98,
        status: "confirmed",
        orderDate: new Date(),
        estimatedTime: 25
      },
      {
        orderNumber: "ORD-002",
        customerName: "Jane Smith",
        customerEmail: "jane@example.com",
        customerPhone: "+1234567891",
        items: [{
          item: menuItems[5]._id,
          quantity: 1,
          customization: {
            portionSize: "Large",
            modifications: ["Extra cheese"],
            specialInstructions: "Well done"
          }
        }],
        totalAmount: 18.99,
        status: "preparing",
        orderDate: new Date(),
        estimatedTime: 30
      }
    ];

    await Order.insertMany(sampleOrders);
    console.log(`✅ Created ${sampleOrders.length} sample orders`);

    console.log('\n🎉 Database populated successfully!');
    console.log('📊 Summary:');
    console.log(`   - Menu Items: ${menuItems.length}`);
    console.log(`   - Admin Users: 1`);
    console.log(`   - Promotions: ${promotions.length}`);
    console.log(`   - Banners: ${banners.length}`);
    console.log(`   - Orders: ${sampleOrders.length}`);
    console.log('\n✅ Your F&B system is ready for testing!');

  } catch (error) {
    console.error('❌ Error populating data:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}
