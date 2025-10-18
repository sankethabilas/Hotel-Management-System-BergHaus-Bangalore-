const express = require('express');
const router = express.Router();
const {
  getAllRewards,
  getRewardById,
  createReward,
  updateReward,
  deleteReward,
  getRewardsCatalog,
  getRewardStats
} = require('../controllers/rewardController');
const { protect, authorize } = require('../middleware/auth');

// Public catalog route (for guests)
router.get('/catalog', protect, getRewardsCatalog);

// Stats route (admin only)
router.get('/stats', protect, authorize('admin'), getRewardStats);

// CRUD routes (admin only)
router
  .route('/')
  .get(protect, authorize('admin'), getAllRewards)
  .post(protect, authorize('admin'), createReward);

router
  .route('/:id')
  .get(protect, getRewardById)
  .put(protect, authorize('admin'), updateReward)
  .delete(protect, authorize('admin'), deleteReward);

module.exports = router;
