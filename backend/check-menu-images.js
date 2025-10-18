const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
require('dotenv').config();

async function checkMenuItems() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    const menuItems = await MenuItem.find({}).select('name image').lean();
    console.log('\nMenu Items with Image Data:');
    console.log('============================');
    
    menuItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name}`);
      console.log(`   Image: ${item.image || 'NULL'}`);
      console.log('');
    });
    
    const itemsWithImages = menuItems.filter(item => item.image);
    const itemsWithoutImages = menuItems.filter(item => !item.image);
    
    console.log(`Total menu items: ${menuItems.length}`);
    console.log(`Items with images: ${itemsWithImages.length}`);
    console.log(`Items without images: ${itemsWithoutImages.length}`);
    
    // Show sample image paths
    if (itemsWithImages.length > 0) {
      console.log('\nSample image paths:');
      itemsWithImages.slice(0, 3).forEach(item => {
        console.log(`- ${item.name}: "${item.image}"`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkMenuItems();
