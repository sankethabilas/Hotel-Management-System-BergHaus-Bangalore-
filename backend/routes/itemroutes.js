const express = require('express');
const Item = require('../models/Item');

const router = express.Router();

//  Add Item
router.post('/additem', async (req, res) => {
  try {
    let newItem = new Item(req.body);
    await newItem.save();
    return res.status(200).json({ success: "Saved successfully!" });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

//  Get All Items
router.get('/getitems', async (req, res) => {
  try {
    const items = await Item.find();
    return res.status(200).json({ success: true, existingItems: items });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

//  Get Item Details by ID
router.get('/getOneitem/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    return res.status(200).json({ success: true, item });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

//  Update Item
router.put('/updateitem/:id', async (req, res) => {
  try {
    await Item.findByIdAndUpdate(req.params.id, { $set: req.body });
    return res.status(200).json({ success: "Updated Successfully" });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

//  Delete Item
router.delete('/deleteitem/:id', async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);  //  use this because findByIdAndRemove is a older version. newer version is findByIdAndDelete
    if (!deletedItem) {
      return res.status(404).json({ error: "Item not found" });
    }
    return res.status(200).json({ message: "Delete Successful", deletedItem });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});


module.exports = router;