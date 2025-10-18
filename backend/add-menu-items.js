const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
require('dotenv').config();

// Menu items to add
const menuItemsToAdd = [
  // Main Course Items
  {
    name: 'Vegetable Fried Rice',
    description: 'Classic veggie fried rice served with chili paste',
    category: 'lunch',
    price: 850,
    preparationTime: 15,
    isVegetarian: true,
    spiceLevel: 'mild',
    tags: ['rice', 'vegetables', 'asian'],
    ingredients: ['rice', 'vegetables', 'soy sauce', 'chili paste'],
    dietaryInfo: {
      vegetarian: true,
      vegan: true
    }
  },
  {
    name: 'Devilled Chicken',
    description: 'Spicy Sri Lankan-style devilled chicken with onions & capsicum',
    category: 'lunch',
    price: 1200,
    preparationTime: 25,
    spiceLevel: 'hot',
    tags: ['chicken', 'spicy', 'sri lankan'],
    ingredients: ['chicken', 'onions', 'capsicum', 'spices'],
    dietaryInfo: {
      halal: true
    }
  },
  {
    name: 'Fish Curry',
    description: 'Traditional Sri Lankan fish curry with coconut milk',
    category: 'lunch',
    price: 1100,
    preparationTime: 30,
    spiceLevel: 'medium',
    tags: ['fish', 'curry', 'coconut', 'sri lankan'],
    ingredients: ['fish', 'coconut milk', 'curry leaves', 'spices']
  },
  {
    name: 'Egg Fried Rice',
    description: 'Rice fried with scrambled eggs and vegetables',
    category: 'lunch',
    price: 800,
    preparationTime: 12,
    spiceLevel: 'mild',
    tags: ['rice', 'eggs', 'vegetables'],
    ingredients: ['rice', 'eggs', 'vegetables', 'soy sauce'],
    dietaryInfo: {
      vegetarian: true
    }
  },
  {
    name: 'Chicken Kottu',
    description: 'Paratha chopped with chicken, egg, and spices',
    category: 'dinner',
    price: 1000,
    preparationTime: 20,
    spiceLevel: 'medium',
    tags: ['kottu', 'chicken', 'paratha', 'sri lankan'],
    ingredients: ['paratha', 'chicken', 'egg', 'vegetables', 'spices'],
    dietaryInfo: {
      halal: true
    }
  },
  {
    name: 'Vegetable Kottu',
    description: 'Kottu with mixed vegetables and curry sauce',
    category: 'dinner',
    price: 900,
    preparationTime: 18,
    spiceLevel: 'medium',
    isVegetarian: true,
    tags: ['kottu', 'vegetables', 'paratha', 'sri lankan'],
    ingredients: ['paratha', 'vegetables', 'curry sauce', 'spices'],
    dietaryInfo: {
      vegetarian: true,
      vegan: true
    }
  },
  {
    name: 'Prawn Curry',
    description: 'Spicy prawn curry cooked in coconut milk',
    category: 'lunch',
    price: 1400,
    preparationTime: 35,
    spiceLevel: 'hot',
    tags: ['prawn', 'curry', 'coconut', 'seafood'],
    ingredients: ['prawns', 'coconut milk', 'curry leaves', 'spices']
  },
  {
    name: 'Chicken Biriyani',
    description: 'Aromatic rice with chicken, boiled egg, and raita',
    category: 'lunch',
    price: 1300,
    preparationTime: 40,
    spiceLevel: 'medium',
    tags: ['biriyani', 'chicken', 'rice', 'aromatic'],
    ingredients: ['basmati rice', 'chicken', 'egg', 'yogurt', 'spices'],
    dietaryInfo: {
      halal: true
    }
  },

  // Snacks / Light Meals
  {
    name: 'Vegetable Sandwich',
    description: 'Fresh sandwich with tomato, cucumber, and lettuce',
    category: 'snacks',
    price: 450,
    preparationTime: 8,
    isVegetarian: true,
    spiceLevel: 'none',
    tags: ['sandwich', 'vegetables', 'light meal'],
    ingredients: ['bread', 'tomato', 'cucumber', 'lettuce', 'mayo'],
    dietaryInfo: {
      vegetarian: true
    }
  },
  {
    name: 'Chicken Burger',
    description: 'Crispy chicken patty with lettuce and sauce',
    category: 'snacks',
    price: 850,
    preparationTime: 15,
    spiceLevel: 'mild',
    tags: ['burger', 'chicken', 'crispy'],
    ingredients: ['chicken patty', 'burger bun', 'lettuce', 'sauce'],
    dietaryInfo: {
      halal: true
    }
  },
  {
    name: 'French Fries',
    description: 'Golden crispy fries served with ketchup',
    category: 'snacks',
    price: 400,
    preparationTime: 10,
    isVegetarian: true,
    spiceLevel: 'none',
    tags: ['fries', 'crispy', 'side dish'],
    ingredients: ['potatoes', 'salt', 'oil'],
    dietaryInfo: {
      vegetarian: true,
      vegan: true
    }
  },
  {
    name: 'Vegetable Roti',
    description: 'Soft roti stuffed with spicy vegetables',
    category: 'snacks',
    price: 350,
    preparationTime: 12,
    isVegetarian: true,
    spiceLevel: 'medium',
    tags: ['roti', 'vegetables', 'stuffed'],
    ingredients: ['flour', 'vegetables', 'spices', 'oil'],
    dietaryInfo: {
      vegetarian: true,
      vegan: true
    }
  },

  // Beverages
  {
    name: 'Tea (Plain / Milk)',
    description: 'Sri Lankan black tea with or without milk',
    category: 'beverages',
    price: 150,
    preparationTime: 5,
    spiceLevel: 'none',
    tags: ['tea', 'hot beverage', 'sri lankan'],
    ingredients: ['tea leaves', 'water', 'milk (optional)', 'sugar (optional)'],
    dietaryInfo: {
      vegetarian: true,
      vegan: false // milk version is not vegan
    }
  },
  {
    name: 'Coffee (Plain / Milk)',
    description: 'Strong coffee brewed locally',
    category: 'beverages',
    price: 200,
    preparationTime: 5,
    spiceLevel: 'none',
    tags: ['coffee', 'hot beverage', 'local'],
    ingredients: ['coffee beans', 'water', 'milk (optional)', 'sugar (optional)'],
    dietaryInfo: {
      vegetarian: true,
      vegan: false // milk version is not vegan
    }
  },
  {
    name: 'Fresh Lime Juice',
    description: 'Freshly squeezed lime juice',
    category: 'beverages',
    price: 250,
    preparationTime: 3,
    spiceLevel: 'none',
    isVegetarian: true,
    isVegan: true,
    tags: ['lime', 'fresh juice', 'citrus', 'refreshing'],
    ingredients: ['lime', 'water', 'sugar', 'ice'],
    dietaryInfo: {
      vegetarian: true,
      vegan: true,
      glutenFree: true
    }
  },
  {
    name: 'Fruit Juice',
    description: 'Seasonal mixed fruit juice',
    category: 'beverages',
    price: 350,
    preparationTime: 5,
    spiceLevel: 'none',
    isVegetarian: true,
    isVegan: true,
    tags: ['fruit juice', 'seasonal', 'mixed fruits', 'healthy'],
    ingredients: ['seasonal fruits', 'water', 'ice'],
    dietaryInfo: {
      vegetarian: true,
      vegan: true,
      glutenFree: true
    }
  }
];

// Connect to MongoDB and add items
async function addMenuItems() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://Sanketh:Gv5T0YzYqgFCI6th@cluster0.6vyj3nr.mongodb.net/hms_database?retryWrites=true&w=majority';
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connected to MongoDB');
    console.log('');

    // Create default admin ID
    const defaultAdminId = new mongoose.Types.ObjectId();
    
    console.log('🍽️  Adding Menu Items via CRUD...');
    console.log('=====================================');
    
    let successCount = 0;
    let errorCount = 0;

    for (const itemData of menuItemsToAdd) {
      try {
        // Add the required createdBy field
        const menuItemWithAdmin = {
          ...itemData,
          createdBy: defaultAdminId
        };

        // Create menu item using the model (simulates POST API call)
        const menuItem = new MenuItem(menuItemWithAdmin);
        const savedItem = await menuItem.save();
        
        console.log(`✅ Added: ${savedItem.name} - Rs. ${savedItem.price}`);
        console.log(`   Category: ${savedItem.category} | Prep Time: ${savedItem.preparationTime} mins`);
        console.log('');
        
        successCount++;
      } catch (error) {
        console.log(`❌ Failed to add: ${itemData.name}`);
        console.log(`   Error: ${error.message}`);
        console.log('');
        errorCount++;
      }
    }

    console.log('📊 Summary:');
    console.log(`✅ Successfully added: ${successCount} items`);
    console.log(`❌ Failed to add: ${errorCount} items`);
    console.log('');
    
    // Display categories added
    const addedCategories = [...new Set(menuItemsToAdd.map(item => item.category))];
    console.log('📂 Categories added:');
    addedCategories.forEach(cat => {
      const count = menuItemsToAdd.filter(item => item.category === cat).length;
      console.log(`   - ${cat}: ${count} items`);
    });

    console.log('');
    console.log('🎉 Menu items added successfully via CRUD operations!');
    console.log('💡 Note: Images can be added later through the admin interface');
    
  } catch (error) {
    console.error('❌ Error adding menu items:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
addMenuItems();