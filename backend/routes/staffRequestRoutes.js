const express = require('express');
const StaffRequest = require('../models/StaffRequest');

const router = express.Router();

// Create Request
router.post('/addrequest', async (req, res) => {
  try {
    const newRequest = new StaffRequest(req.body);
    await newRequest.save();
    return res.status(200).json({ success: "Request submitted successfully!" });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Get All Requests
router.get('/getrequests', async (req, res) => {
  try {
    const requests = await StaffRequest.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, requests });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Delete Request
router.delete('/deleterequest/:id', async (req, res) => {
  try {
    const deleted = await StaffRequest.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: "Request deleted", deleted });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Mark as Done 
router.put('/markdone/:id', async (req, res) => {
  try {
    await StaffRequest.findByIdAndUpdate(req.params.id, { isDone: true });
    return res.status(200).json({ success: "Marked as done" });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
