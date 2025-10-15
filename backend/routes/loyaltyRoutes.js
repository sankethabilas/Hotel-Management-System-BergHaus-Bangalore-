const express = require('express');
const router = express.Router();
const {
  enrollGuest,
  getLoyaltyDetails,
  addPoints,
  getAllMembers,
  deleteMember
} = require('../controllers/loyaltyController');

// Loyalty program routes
router.post('/enroll', enrollGuest);
router.get('/details/:guestId', getLoyaltyDetails);
router.post('/add-points', addPoints);
router.get('/members', getAllMembers);
router.delete('/member/:guestId', deleteMember);

module.exports = router;
