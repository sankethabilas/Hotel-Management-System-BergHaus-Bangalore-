const Reward = require('../models/rewardModel');
const Loyalty = require('../models/loyaltyModel');
const PointTransaction = require('../models/pointTransactionModel');

// @desc    Get all rewards
// @route   GET /api/rewards
// @access  Private (Admin)
exports.getAllRewards = async (req, res) => {
  try {
    const { category, status, minTier } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (minTier) filter.minTierRequired = minTier;

    const rewards = await Reward.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: rewards.length,
      data: rewards
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rewards',
      error: error.message
    });
  }
};

// @desc    Get single reward by ID
// @route   GET /api/rewards/:id
// @access  Private
exports.getRewardById = async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    res.json({
      success: true,
      data: reward
    });
  } catch (error) {
    console.error('Error fetching reward:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reward',
      error: error.message
    });
  }
};

// @desc    Create new reward
// @route   POST /api/rewards
// @access  Private (Admin)
exports.createReward = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      pointsCost,
      termsAndConditions,
      minTierRequired,
      stockAvailable,
      maxRedemptionsPerGuest,
      validityDays,
      status
    } = req.body;

    // Validation
    if (!name || !description || !category || !pointsCost) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, category, and points cost'
      });
    }

    if (pointsCost < 0) {
      return res.status(400).json({
        success: false,
        message: 'Points cost cannot be negative'
      });
    }

    const reward = await Reward.create({
      name,
      description,
      category,
      pointsCost,
      termsAndConditions,
      minTierRequired: minTierRequired || null,
      stockAvailable: stockAvailable || null,
      maxRedemptionsPerGuest: maxRedemptionsPerGuest || null,
      validityDays: validityDays || 90,
      status: status || 'active',
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Reward created successfully',
      data: reward
    });
  } catch (error) {
    console.error('Error creating reward:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating reward',
      error: error.message
    });
  }
};

// @desc    Update reward
// @route   PUT /api/rewards/:id
// @access  Private (Admin)
exports.updateReward = async (req, res) => {
  try {
    let reward = await Reward.findById(req.params.id);

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    const {
      name,
      description,
      category,
      pointsCost,
      termsAndConditions,
      minTierRequired,
      stockAvailable,
      maxRedemptionsPerGuest,
      validityDays,
      status
    } = req.body;

    // Validation
    if (pointsCost !== undefined && pointsCost < 0) {
      return res.status(400).json({
        success: false,
        message: 'Points cost cannot be negative'
      });
    }

    // Update fields
    reward.name = name || reward.name;
    reward.description = description || reward.description;
    reward.category = category || reward.category;
    reward.pointsCost = pointsCost !== undefined ? pointsCost : reward.pointsCost;
    reward.termsAndConditions = termsAndConditions !== undefined ? termsAndConditions : reward.termsAndConditions;
    reward.minTierRequired = minTierRequired !== undefined ? minTierRequired : reward.minTierRequired;
    reward.stockAvailable = stockAvailable !== undefined ? stockAvailable : reward.stockAvailable;
    reward.maxRedemptionsPerGuest = maxRedemptionsPerGuest !== undefined ? maxRedemptionsPerGuest : reward.maxRedemptionsPerGuest;
    reward.validityDays = validityDays !== undefined ? validityDays : reward.validityDays;
    reward.status = status || reward.status;
    reward.updatedBy = req.user._id;

    await reward.save();

    res.json({
      success: true,
      message: 'Reward updated successfully',
      data: reward
    });
  } catch (error) {
    console.error('Error updating reward:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating reward',
      error: error.message
    });
  }
};

// @desc    Delete reward
// @route   DELETE /api/rewards/:id
// @access  Private (Admin)
exports.deleteReward = async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    await reward.deleteOne();

    res.json({
      success: true,
      message: 'Reward deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reward:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting reward',
      error: error.message
    });
  }
};

// @desc    Get rewards catalog for guests
// @route   GET /api/rewards/catalog
// @access  Private (Guest)
exports.getRewardsCatalog = async (req, res) => {
  try {
    const { category } = req.query;
    
    const filter = { status: 'active' };
    if (category) filter.category = category;

    const rewards = await Reward.find(filter)
      .select('-createdBy -updatedBy')
      .sort({ category: 1, pointsCost: 1 });

    res.json({
      success: true,
      count: rewards.length,
      data: rewards
    });
  } catch (error) {
    console.error('Error fetching rewards catalog:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rewards catalog',
      error: error.message
    });
  }
};

// @desc    Get reward statistics
// @route   GET /api/rewards/stats
// @access  Private (Admin)
exports.getRewardStats = async (req, res) => {
  try {
    const totalRewards = await Reward.countDocuments();
    const activeRewards = await Reward.countDocuments({ status: 'active' });
    const inactiveRewards = await Reward.countDocuments({ status: 'inactive' });

    const rewardsByCategory = await Reward.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPointsCost: { $avg: '$pointsCost' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total: totalRewards,
        active: activeRewards,
        inactive: inactiveRewards,
        byCategory: rewardsByCategory
      }
    });
  } catch (error) {
    console.error('Error fetching reward stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reward statistics',
      error: error.message
    });
  }
};

module.exports = exports;
