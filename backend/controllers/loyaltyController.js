const Loyalty = require('../models/loyaltyModel');
const User = require('../models/User');
const PointTransaction = require('../models/pointTransactionModel');

exports.enrollGuest = async (req, res) => {
  try {
    const { userId, initialPoints = 0 } = req.body || {};
    
    console.log('Enroll request:', { userId, initialPoints });
    
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // Fetch user from Users collection
    const user = await User.findById(userId);
    console.log('Found user:', user ? { 
      id: user._id, 
      firstName: user.firstName, 
      lastName: user.lastName, 
      name: user.name,
      email: user.email, 
      role: user.role 
    } : 'null');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify user is a guest
    if (user.role !== 'guest') {
      return res.status(400).json({ message: 'Only guests can be enrolled in loyalty program' });
    }

    // Check if user already enrolled
    const existing = await Loyalty.findOne({ userId });
    if (existing) {
      return res.status(409).json({ message: 'Guest already enrolled in loyalty program', loyalty: existing });
    }

    // Calculate tier based on initial points
    let tier = 'Silver';
    if (initialPoints >= 5000) tier = 'Platinum';
    else if (initialPoints >= 2000) tier = 'Gold';

    // Construct full name from firstName and lastName
    // Handle both old format (name) and new format (firstName + lastName)
    let fullName;
    if (user.firstName && user.lastName) {
      fullName = `${user.firstName} ${user.lastName}`;
    } else if (user.name) {
      fullName = user.name;
    } else {
      fullName = user.email.split('@')[0]; // Fallback to email username
    }

    console.log('Enrolling guest:', { userId, fullName, email: user.email, tier });

    // Create loyalty record
    const loyalty = await Loyalty.create({
      userId: user._id,
      guestId: user.email, // Use email as guestId
      guestName: fullName,
      email: user.email,
      phone: user.phone || '',
      points: initialPoints,
      tier: tier,
      status: 'active'
    });

    // Create initial point transaction if points > 0
    if (initialPoints > 0) {
      await PointTransaction.create({
        guestId: user.email,
        loyaltyId: loyalty._id,
        points: initialPoints,
        type: 'bonus',
        description: 'Initial enrollment bonus',
        referenceType: 'manual',
        balanceAfter: initialPoints
      });
    }

    res.status(201).json(loyalty);
  } catch (error) {
    console.error('Error enrolling guest:', error);
    res.status(500).json({ message: 'Error enrolling guest', error: error.message });
  }
};

exports.getLoyaltyDetails = async (req, res) => {
  try {
    const { guestId } = req.params;  // Changed from req.query to req.params
    if (!guestId) {
      return res.status(400).json({ message: 'guestId parameter is required' });
    }
    const loyalty = await Loyalty.findOne({ guestId }).populate('assignedOffers');
    if (!loyalty) {
      return res.status(404).json({ message: 'Loyalty record not found' });
    }
    res.json(loyalty);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching loyalty details', error: error.message });
  }
};

exports.addPoints = async (req, res) => {
  try {
    const { guestId, points, description, referenceType, referenceId } = req.body || {};
    if (!guestId || typeof points !== 'number') {
      return res.status(400).json({ message: 'guestId and numeric points are required' });
    }
    const loyalty = await Loyalty.findOne({ guestId });
    if (!loyalty) {
      return res.status(404).json({ message: 'Loyalty record not found' });
    }
    
    const previousPoints = loyalty.points;
    loyalty.points = Math.max(0, loyalty.points + points);
    
    // Auto-update tier based on points
    if (loyalty.points >= 5000) loyalty.tier = 'Platinum';
    else if (loyalty.points >= 2000) loyalty.tier = 'Gold';
    else loyalty.tier = 'Silver';
    
    const saved = await loyalty.save();
    
    // Record point transaction
    const transactionType = points > 0 ? 'earn' : 'redeem';
    const transactionDescription = description || 
      (points > 0 ? `Points added` : `Points redeemed`);
    
    await PointTransaction.create({
      guestId: loyalty.guestId,
      loyaltyId: loyalty._id,
      points: Math.abs(points),
      type: transactionType,
      description: transactionDescription,
      referenceType: referenceType || 'manual',
      referenceId: referenceId || null,
      balanceAfter: loyalty.points
    });
    
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error updating points', error: error.message });
  }
}

// Get all loyalty members
exports.getAllMembers = async (req, res) => {
  try {
    const members = await Loyalty.find()
      .populate('userId', 'name email phone')
      .populate('assignedOffers')
      .sort({ points: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching loyalty members', error: error.message });
  }
}

// Delete loyalty member
exports.deleteMember = async (req, res) => {
  try {
    const { guestId } = req.params;
    const loyalty = await Loyalty.findOneAndDelete({ guestId });
    if (!loyalty) {
      return res.status(404).json({ message: 'Loyalty member not found' });
    }
    res.json({ message: 'Loyalty member removed successfully', loyalty });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting loyalty member', error: error.message });
  }
}

// Get transaction history with filters
exports.getTransactionHistory = async (req, res) => {
  try {
    const { guestId, startDate, endDate, type, limit = 50 } = req.query;
    
    const filter = {};
    if (guestId) filter.guestId = guestId;
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const transactions = await PointTransaction.find(filter)
      .populate('loyaltyId', 'guestName tier')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching transaction history', 
      error: error.message 
    });
  }
};

// Get member transaction history
exports.getMemberTransactions = async (req, res) => {
  try {
    const { guestId } = req.params;
    const { limit = 10 } = req.query;

    const loyalty = await Loyalty.findOne({ guestId });
    if (!loyalty) {
      return res.status(404).json({ 
        success: false,
        message: 'Loyalty member not found' 
      });
    }

    const transactions = await PointTransaction.find({ loyaltyId: loyalty._id })
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      member: {
        guestId: loyalty.guestId,
        guestName: loyalty.guestName,
        tier: loyalty.tier,
        points: loyalty.points
      },
      transactions: transactions
    });
  } catch (error) {
    console.error('Error fetching member transactions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching member transactions', 
      error: error.message 
    });
  }
};

// Get points statistics
exports.getPointsStats = async (req, res) => {
  try {
    // Total points issued (all earn transactions)
    const earnStats = await PointTransaction.aggregate([
      { $match: { points: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);
    const totalPointsIssued = earnStats[0]?.total || 0;

    // Total points redeemed (all redeem transactions)
    const redeemStats = await PointTransaction.aggregate([
      { $match: { points: { $lt: 0 } } },
      { $group: { _id: null, total: { $sum: { $abs: '$points' } } } }
    ]);
    const totalPointsRedeemed = redeemStats[0]?.total || 0;

    // Current points balance across all members
    const balanceStats = await Loyalty.aggregate([
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);
    const currentBalance = balanceStats[0]?.total || 0;

    // Average points per member
    const memberCount = await Loyalty.countDocuments();
    const avgPointsPerMember = memberCount > 0 ? Math.round(currentBalance / memberCount) : 0;

    // Most active members (by transaction count)
    const activeMembers = await PointTransaction.aggregate([
      {
        $group: {
          _id: '$loyaltyId',
          transactionCount: { $sum: 1 },
          totalEarned: {
            $sum: {
              $cond: [{ $gt: ['$points', 0] }, '$points', 0]
            }
          },
          totalRedeemed: {
            $sum: {
              $cond: [{ $lt: ['$points', 0] }, { $abs: '$points' }, 0]
            }
          }
        }
      },
      { $sort: { transactionCount: -1 } },
      { $limit: 5 }
    ]);

    // Populate member details
    const populatedActiveMembers = await Loyalty.populate(activeMembers, {
      path: '_id',
      select: 'guestName tier points guestId'
    });

    // Recent transactions
    const recentTransactions = await PointTransaction.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // Points by tier
    const pointsByTier = await Loyalty.aggregate([
      {
        $group: {
          _id: '$tier',
          members: { $sum: 1 },
          totalPoints: { $sum: '$points' },
          avgPoints: { $avg: '$points' }
        }
      },
      { $sort: { totalPoints: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalPointsIssued,
          totalPointsRedeemed,
          currentBalance,
          avgPointsPerMember,
          totalMembers: memberCount,
          recentTransactions7Days: recentTransactions
        },
        mostActiveMembers: populatedActiveMembers.map(m => ({
          guestId: m._id?.guestId,
          guestName: m._id?.guestName,
          tier: m._id?.tier,
          currentPoints: m._id?.points,
          transactionCount: m.transactionCount,
          totalEarned: m.totalEarned,
          totalRedeemed: m.totalRedeemed
        })),
        pointsByTier
      }
    });
  } catch (error) {
    console.error('Error fetching points statistics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching points statistics', 
      error: error.message 
    });
  }
};

// Redeem reward with stock management
exports.redeemReward = async (req, res) => {
  try {
    const { guestId, rewardId } = req.body;

    if (!guestId || !rewardId) {
      return res.status(400).json({ 
        success: false,
        message: 'guestId and rewardId are required' 
      });
    }

    // Import Reward model
    const Reward = require('../models/rewardModel');

    // Find loyalty member
    const loyalty = await Loyalty.findOne({ guestId });
    if (!loyalty) {
      return res.status(404).json({ 
        success: false,
        message: 'Loyalty record not found' 
      });
    }

    // Find reward
    const reward = await Reward.findById(rewardId);
    if (!reward) {
      return res.status(404).json({ 
        success: false,
        message: 'Reward not found' 
      });
    }

    // Check if reward is active
    if (reward.status !== 'active') {
      return res.status(400).json({ 
        success: false,
        message: 'This reward is currently inactive' 
      });
    }

    // Check stock availability
    if (reward.stockAvailable !== null && reward.stockAvailable <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'This reward is out of stock' 
      });
    }

    // Check if user has enough points
    if (loyalty.points < reward.pointsCost) {
      return res.status(400).json({ 
        success: false,
        message: `Insufficient points. You need ${reward.pointsCost - loyalty.points} more points`,
        required: reward.pointsCost,
        current: loyalty.points,
        needed: reward.pointsCost - loyalty.points
      });
    }

    // Check tier requirement
    const tierLevels = { Silver: 1, Gold: 2, Platinum: 3 };
    const userTierLevel = tierLevels[loyalty.tier] || 0;
    const requiredTierLevel = tierLevels[reward.minTierRequired] || 0;
    
    if (userTierLevel < requiredTierLevel) {
      return res.status(400).json({ 
        success: false,
        message: `This reward requires ${reward.minTierRequired} tier membership`,
        userTier: loyalty.tier,
        requiredTier: reward.minTierRequired
      });
    }

    // Deduct points
    const previousPoints = loyalty.points;
    loyalty.points -= reward.pointsCost;
    
    // Auto-update tier based on new points
    if (loyalty.points >= 5000) loyalty.tier = 'Platinum';
    else if (loyalty.points >= 2000) loyalty.tier = 'Gold';
    else loyalty.tier = 'Silver';
    
    await loyalty.save();

    // Decrease stock count (if not unlimited)
    if (reward.stockAvailable !== null) {
      reward.stockAvailable -= 1;
      await reward.save();
    }

    // Record transaction
    await PointTransaction.create({
      guestId: loyalty.guestId,
      loyaltyId: loyalty._id,
      points: reward.pointsCost,
      type: 'redeem',
      description: `Redeemed reward: ${reward.name}`,
      referenceType: 'reward',
      referenceId: reward._id,
      balanceAfter: loyalty.points
    });

    res.json({
      success: true,
      message: 'Reward redeemed successfully',
      loyalty: {
        points: loyalty.points,
        tier: loyalty.tier,
        pointsDeducted: reward.pointsCost,
        previousPoints
      },
      reward: {
        id: reward._id,
        name: reward.name,
        stockRemaining: reward.stockAvailable
      }
    });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error redeeming reward', 
      error: error.message 
    });
  }
};
