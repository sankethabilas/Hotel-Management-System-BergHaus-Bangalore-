const mongoose = require('mongoose');
const InventoryItem = require('./models/InventoryItem');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://Sanketh:Gv5T0YzYqgFCI6th@cluster0.6vyj3nr.mongodb.net/hms_database?retryWrites=true&w=majority');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Migrate data from items collection to inventoryitems collection
const migrateInventoryData = async () => {
  try {
    await connectDB();
    
    // Get all items from the items collection
    const db = mongoose.connection.db;
    const itemsCollection = db.collection('items');
    const items = await itemsCollection.find({}).toArray();
    
    console.log(`Found ${items.length} items to migrate`);
    
    // Clear existing inventoryitems collection
    await InventoryItem.deleteMany({});
    console.log('Cleared existing inventoryitems collection');
    
    // Migrate each item
    for (const item of items) {
      const inventoryItem = new InventoryItem({
        name: item.name,
        quantity: item.quantity || 0,
        allocated: item.allocated || 0,
        damaged: item.damaged || 0,
        returned: item.returned || 0,
        imageUrl: item.imageUrl || '',
        description: item.description || '',
        supplierName: item.supplierName || '',
        supplierEmail: item.supplierEmail || '',
        supplierPhone: item.supplierPhone || '',
        category: item.category || 'Kitchen',
        price: item.price || 0
      });
      
      await inventoryItem.save();
      console.log(`Migrated item: ${item.name}`);
    }
    
    console.log('Migration completed successfully!');
    
    // Verify migration
    const migratedItems = await InventoryItem.find({});
    console.log(`Total items in inventoryitems collection: ${migratedItems.length}`);
    
    // Show summary
    const totalQuantity = migratedItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = migratedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    console.log('\n=== Migration Summary ===');
    console.log(`Total Items: ${migratedItems.length}`);
    console.log(`Total Quantity: ${totalQuantity}`);
    console.log(`Total Value: LKR ${totalValue.toFixed(2)}`);
    
    // Category breakdown
    const categoryBreakdown = {};
    migratedItems.forEach(item => {
      categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
    });
    
    console.log('\nCategory Breakdown:');
    Object.entries(categoryBreakdown).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} items`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

migrateInventoryData();
