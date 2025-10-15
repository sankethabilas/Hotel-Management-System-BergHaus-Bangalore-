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
    const { guestId } = req.query;
    if (!guestId) {
      return res.status(400).json({ message: 'guestId query param is required' });
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




