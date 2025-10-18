const express = require('express');
const router = express.Router();
const {
  enrollGuest,
  getLoyaltyDetails,
  addPoints,
  getAllMembers,
  deleteMember,
  getTransactionHistory,
  getMemberTransactions,
  getPointsStats,
  redeemReward
} = require('../controllers/loyaltyController');

// Loyalty program routes
router.post('/enroll', enrollGuest);
router.get('/details/:guestId', getLoyaltyDetails);
router.post('/add-points', addPoints);
router.post('/redeem-reward', redeemReward); // New endpoint for reward redemption with stock management
router.get('/members', getAllMembers);
router.delete('/member/:guestId', deleteMember);

// Transaction history routes
router.get('/transactions/history', getTransactionHistory);
router.get('/transactions/member/:guestId', getMemberTransactions);

// Statistics route
router.get('/points/stats', getPointsStats);

module.exports = router;
