const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function assignMenuImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    // Get all menu items without images
    const menuItemsWithoutImages = await MenuItem.find({ 
      $or: [
        { image: null }, 
        { image: '' }, 
        { image: { $exists: false } }
      ]
    }).select('name image');
    
    console.log(`Found ${menuItemsWithoutImages.length} menu items without images`);
    
    // Get all available image files
    const uploadsDir = path.join(__dirname, 'uploads');
    const imageFiles = fs.readdirSync(uploadsDir)
      .filter(file => file.startsWith('image-') && (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')))
      .sort();
    
    console.log(`Found ${imageFiles.length} image files in uploads directory`);
    
    if (imageFiles.length === 0) {
      console.log('No image files found. Please upload some images first.');
      return;
    }
    
    // Assign images to menu items
    let assignedCount = 0;
    for (let i = 0; i < menuItemsWithoutImages.length && i < imageFiles.length; i++) {
      const menuItem = menuItemsWithoutImages[i];
      const imageFile = imageFiles[i];
      const imagePath = `/uploads/${imageFile}`;
      
      await MenuItem.findByIdAndUpdate(menuItem._id, { image: imagePath });
      console.log(`Assigned ${imageFile} to "${menuItem.name}"`);
      assignedCount++;
    }
    
    console.log(`\nSuccessfully assigned ${assignedCount} images to menu items`);
    
    // Show final status
    const totalMenuItems = await MenuItem.countDocuments();
    const itemsWithImages = await MenuItem.countDocuments({ 
      image: { $exists: true, $ne: null, $ne: '' } 
    });
    const itemsWithoutImages = totalMenuItems - itemsWithImages;
    
    console.log(`\nFinal Status:`);
    console.log(`Total menu items: ${totalMenuItems}`);
    console.log(`Items with images: ${itemsWithImages}`);
    console.log(`Items without images: ${itemsWithoutImages}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

assignMenuImages();
