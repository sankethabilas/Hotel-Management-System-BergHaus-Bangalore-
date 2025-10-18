const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
require('dotenv').config();

async function updatePortionPricing() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hms');
    console.log('✅ Connected to MongoDB');

    // Get all menu items
    const menuItems = await MenuItem.find({});
    console.log(`\n📋 Found ${menuItems.length} menu items to update`);

    let updatedCount = 0;

    for (const item of menuItems) {
      // Set default portion pricing if not already set
      const currentPricing = item.portionPricing || {};
      
      // Only update if portion pricing is not properly set
      if (!currentPricing.small && !currentPricing.regular && !currentPricing.large) {
        // Set reasonable default pricing based on item price
        const basePrice = item.price;
        const smallDiscount = Math.round(basePrice * 0.1); // 10% discount for small
        const largeExtra = Math.round(basePrice * 0.2); // 20% extra for large

        item.portionPricing = {
          small: -smallDiscount, // Negative for discount
          regular: 0, // Base price
          large: largeExtra // Positive for extra charge
        };

        await item.save();
        console.log(`✅ Updated ${item.name}: Small(-${smallDiscount}), Regular(0), Large(+${largeExtra})`);
        updatedCount++;
      } else {
        console.log(`⏭️  Skipped ${item.name} - already has portion pricing`);
      }
    }

    console.log(`\n🎉 Updated ${updatedCount} menu items with portion pricing!`);
    console.log('\n📝 Example pricing structure:');
    console.log('   Small: 10% discount from base price');
    console.log('   Regular: Base price (no change)');
    console.log('   Large: 20% extra charge');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
updatePortionPricing();
