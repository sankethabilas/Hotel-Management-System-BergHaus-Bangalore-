const express = require('express');
const InventoryItem = require('../models/InventoryItem');

const router = express.Router();

// Add Item
router.post('/additem', async (req, res) => {
  try {
    let newItem = new InventoryItem(req.body);
    await newItem.save();
    return res.status(200).json({ success: "Saved successfully!" });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Get All Items
router.get('/getitems', async (req, res) => {
  try {
    const items = await InventoryItem.find();
    return res.status(200).json({ success: true, existingItems: items });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Get Item Details by ID
router.get('/getOneitem/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    return res.status(200).json({ success: true, item });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Update Item
router.put('/updateitem/:id', async (req, res) => {
  try {
    await InventoryItem.findByIdAndUpdate(req.params.id, { $set: req.body });
    return res.status(200).json({ success: "Updated Successfully" });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Delete Item
router.delete('/deleteitem/:id', async (req, res) => {
  try {
    const deletedItem = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ error: "Item not found" });
    }
    return res.status(200).json({ message: "Delete Successful", deletedItem });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Get Inventory Dashboard Stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    const items = await InventoryItem.find();
    
    const totalProducts = items.length;
    const stocksBelowFive = items.filter(i => {
      const availableStock = (i.quantity || 0) - ((i.allocated || 0) + (i.damaged || 0));
      return availableStock <= 5;
    }).length;
    
    // Total suppliers (distinct supplierName, ignoring empty)
    const supplierSet = new Set();
    for (const item of items) {
      if (item.supplierName && item.supplierName.trim()) {
        supplierSet.add(item.supplierName.trim());
      }
    }
    const totalSuppliers = supplierSet.size;
    
    // Total inventory value
    const totalInventoryValue = items.reduce((acc, item) => 
      acc + (item.price || 0) * (item.quantity || 0), 0
    );
    
    // Category breakdown
    const categoryBreakdown = {
      Kitchen: 0,
      Housekeeping: 0,
      Maintenance: 0
    };
    
    items.forEach(item => {
      const category = item.category || 'Uncategorized';
      if (categoryBreakdown[category] !== undefined) {
        categoryBreakdown[category] += Number(item.quantity || 0);
      }
    });
    
    // Supplier stats
    const supplierStats = [];
    const supplierMap = new Map();
    
    for (const item of items) {
      const supplier = (item.supplierName || 'Unknown').trim();
      if (!supplierMap.has(supplier)) {
        supplierMap.set(supplier, { supplier, itemSet: new Set(), totalQuantity: 0 });
      }
      const entry = supplierMap.get(supplier);
      entry.itemSet.add(item.name || 'Unnamed');
      entry.totalQuantity += Number(item.quantity || 0);
    }
    
    supplierStats.push(...Array.from(supplierMap.values()).map(e => ({
      supplier: e.supplier,
      distinctItems: e.itemSet.size,
      totalQuantity: e.totalQuantity
    })));
    
    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        stocksBelowFive,
        totalSuppliers,
        totalInventoryValue,
        categoryBreakdown,
        supplierStats
      }
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
