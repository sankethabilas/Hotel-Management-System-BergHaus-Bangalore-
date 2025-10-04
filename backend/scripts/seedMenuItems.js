const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
require('dotenv').config();

const sampleMenuItems = [
  {
    name: "Classic Margherita Pizza",
    description: "Fresh mozzarella, tomato sauce, and basil on our signature thin crust",
    price: 18.99,
    category: "dinner",
    mealType: "dinner",
    availableHours: {
      start: "11:00",
      end: "22:00"
    },
    image: "/images/margherita-pizza.jpg",
    isAvailable: true,
    ingredients: ["Mozzarella", "Tomato Sauce", "Fresh Basil", "Olive Oil"],
    allergens: ["Dairy", "Gluten"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: "mild",
    preparationTime: 15,
    calories: 320,
    isPopular: true,
    discount: 0,
    tags: ["italian", "classic", "vegetarian"],
    createdBy: new mongoose.Types.ObjectId(),
    dietaryInfo: {
      vegetarian: true,
      vegan: false,
      glutenFree: false,
      nutFree: true,
      dairyFree: false,
      halal: true,
      kosher: false
    },
    customizationOptions: {
      allowPortionSize: true,
      allowModifications: true,
      allowSpecialInstructions: true,
      commonModifications: ["Extra Cheese", "No Basil", "Extra Sauce"]
    },
    portionPricing: {
      small: 14.99,
      regular: 18.99,
      large: 22.99
    }
  },
  {
    name: "Grilled Chicken Caesar Salad",
    description: "Crisp romaine lettuce, grilled chicken breast, parmesan cheese, and our house-made caesar dressing",
    price: 16.99,
    category: "lunch",
    mealType: "lunch",
    availableHours: {
      start: "11:00",
      end: "21:00"
    },
    image: "/images/caesar-salad.jpg",
    isAvailable: true,
    ingredients: ["Romaine Lettuce", "Grilled Chicken", "Parmesan Cheese", "Croutons", "Caesar Dressing"],
    allergens: ["Dairy", "Gluten", "Eggs"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: "mild",
    preparationTime: 10,
    calories: 280,
    isPopular: true,
    discount: 0,
    tags: ["healthy", "fresh", "protein"],
    createdBy: new mongoose.Types.ObjectId(),
    dietaryInfo: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      nutFree: true,
      dairyFree: false,
      halal: true,
      kosher: false
    },
    customizationOptions: {
      allowPortionSize: false,
      allowModifications: true,
      allowSpecialInstructions: true,
      commonModifications: ["No Croutons", "Extra Dressing", "No Cheese"]
    },
    portionPricing: {
      small: 16.99,
      regular: 16.99,
      large: 16.99
    }
  },
  {
    name: "Beef Burger Deluxe",
    description: "Juicy beef patty with lettuce, tomato, onion, pickles, and our special sauce on a brioche bun",
    price: 19.99,
    category: "lunch",
    mealType: "lunch",
    availableHours: {
      start: "11:00",
      end: "22:00"
    },
    image: "/images/beef-burger.jpg",
    isAvailable: true,
    ingredients: ["Beef Patty", "Brioche Bun", "Lettuce", "Tomato", "Onion", "Pickles", "Special Sauce"],
    allergens: ["Gluten", "Dairy", "Eggs"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: "mild",
    preparationTime: 12,
    calories: 650,
    isPopular: true,
    discount: 0,
    tags: ["american", "comfort", "meat"],
    createdBy: new mongoose.Types.ObjectId(),
    dietaryInfo: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      nutFree: true,
      dairyFree: false,
      halal: true,
      kosher: false
    },
    customizationOptions: {
      allowPortionSize: false,
      allowModifications: true,
      allowSpecialInstructions: true,
      commonModifications: ["No Pickles", "Extra Sauce", "Add Cheese", "No Onion"]
    },
    portionPricing: {
      small: 19.99,
      regular: 19.99,
      large: 19.99
    }
  },
  {
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a molten chocolate center, served with vanilla ice cream",
    price: 12.99,
    category: "desserts",
    mealType: "anytime",
    availableHours: {
      start: "12:00",
      end: "23:00"
    },
    image: "/images/chocolate-lava-cake.jpg",
    isAvailable: true,
    ingredients: ["Dark Chocolate", "Butter", "Eggs", "Sugar", "Flour", "Vanilla Ice Cream"],
    allergens: ["Dairy", "Gluten", "Eggs"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: "mild",
    preparationTime: 20,
    calories: 480,
    isPopular: true,
    discount: 0,
    tags: ["sweet", "chocolate", "indulgent"],
    createdBy: new mongoose.Types.ObjectId(),
    dietaryInfo: {
      vegetarian: true,
      vegan: false,
      glutenFree: false,
      nutFree: true,
      dairyFree: false,
      halal: true,
      kosher: false
    },
    customizationOptions: {
      allowPortionSize: false,
      allowModifications: true,
      allowSpecialInstructions: true,
      commonModifications: ["Extra Ice Cream", "No Ice Cream", "Strawberry Sauce"]
    },
    portionPricing: {
      small: 12.99,
      regular: 12.99,
      large: 12.99
    }
  },
  {
    name: "Fresh Orange Juice",
    description: "Freshly squeezed orange juice, served chilled",
    price: 4.99,
    category: "beverages",
    mealType: "breakfast",
    availableHours: {
      start: "07:00",
      end: "23:00"
    },
    image: "/images/orange-juice.jpg",
    isAvailable: true,
    ingredients: ["Fresh Oranges"],
    allergens: [],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    spiceLevel: "mild",
    preparationTime: 2,
    calories: 110,
    isPopular: false,
    discount: 0,
    tags: ["fresh", "healthy", "vitamin-c"],
    createdBy: new mongoose.Types.ObjectId(),
    dietaryInfo: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      nutFree: true,
      dairyFree: true,
      halal: true,
      kosher: true
    },
    customizationOptions: {
      allowPortionSize: true,
      allowModifications: false,
      allowSpecialInstructions: true,
      commonModifications: []
    },
    portionPricing: {
      small: 3.99,
      regular: 4.99,
      large: 5.99
    }
  }
];

async function seedMenuItems() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hms');
    console.log('Connected to MongoDB');

    // Clear existing menu items
    await MenuItem.deleteMany({});
    console.log('Cleared existing menu items');

    // Insert sample menu items
    const insertedItems = await MenuItem.insertMany(sampleMenuItems);
    console.log(`Inserted ${insertedItems.length} menu items`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding menu items:', error);
    process.exit(1);
  }
}

// Run the seed function
seedMenuItems();
