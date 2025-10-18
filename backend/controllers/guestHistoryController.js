const User = require('../models/User');
const Loyalty = require('../models/loyaltyModel');
const Booking = require('../models/Booking');
const Feedback = require('../models/Feedback');
const PointTransaction = require('../models/pointTransactionModel');

// Get comprehensive guest history
exports.getGuestHistory = async (req, res) => {
  try {
    const { guestId } = req.params;
    
    if (!guestId) {
      return res.status(400).json({ message: 'guestId is required' });
    }

    // Fetch guest user data
    const user = await User.findById(guestId).lean();
    if (!user) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    // Fetch loyalty data with populated offers
    const loyalty = await Loyalty.findOne({ userId: guestId })
      .populate('assignedOffers')
      .lean();

    // Fetch bookings
    const bookings = await Booking.find({ guestId })
      .sort({ checkInDate: -1 })
      .lean();

    // Fetch feedback - filter by guestId or email (for backwards compatibility)
    const feedback = await Feedback.find({ 
      $or: [
        { guestId },
        { email: user.email }
      ]
    })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch point transactions
    const pointTransactions = loyalty 
      ? await PointTransaction.find({ loyaltyId: loyalty._id })
          .sort({ createdAt: -1 })
          .lean()
      : [];

    // Calculate summary statistics
    const completedBookings = bookings.filter(b => b.status === 'checked_out');
    const totalStays = completedBookings.length;
    const totalSpent = completedBookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    // Get last stay date
    const lastStay = completedBookings.length > 0 
      ? completedBookings[0].checkOutDate 
      : null;

    // Get upcoming stay
    const now = new Date();
    const upcomingBooking = bookings.find(b => 
      new Date(b.checkInDate) > now && 
      (b.status === 'confirmed' || b.status === 'pending')
    );

    // Construct response
    const guestHistory = {
      guest: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage
      },
      loyalty: loyalty ? {
        tier: loyalty.tier,
        points: loyalty.points,
        status: loyalty.status,
        memberSince: loyalty.createdAt,
        assignedOffers: loyalty.assignedOffers || []
      } : null,
      summary: {
        totalStays,
        totalSpent,
        totalBookings: bookings.length,
        totalFeedback: feedback.length,
        lastStay,
        upcomingStay: upcomingBooking ? upcomingBooking.checkInDate : null
      },
      bookings: bookings.map(b => ({
        id: b._id,
        checkIn: b.checkInDate,
        checkOut: b.checkOutDate,
        roomType: b.roomType,
        roomNumber: b.roomNumber,
        totalNights: b.totalNights,
        roomPrice: b.roomPrice,
        totalAmount: b.totalAmount,
        status: b.status,
        paymentStatus: b.paymentStatus,
        bookingReference: b.bookingReference
      })),
      feedback: feedback.map(f => ({
        id: f._id,
        date: f.createdAt,
        rating: f.rating,
        comment: f.comment,
        category: f.category,
        status: f.status
      })),
      pointTransactions: pointTransactions.map(t => ({
        id: t._id,
        date: t.createdAt,
        points: t.points,
        type: t.type,
        description: t.description,
        balanceAfter: t.balanceAfter
      }))
    };

    res.json(guestHistory);
  } catch (error) {
    console.error('Error fetching guest history:', error);
    res.status(500).json({ message: 'Error fetching guest history', error: error.message });
  }
};

// Get all guests with summary data (for guest list)
exports.getAllGuestsHistory = async (req, res) => {
  try {
    // Get all loyalty members
    const loyaltyMembers = await Loyalty.find().lean();
    
    // Get all users who are guests
    const guestUsers = await User.find({ role: 'guest' }).lean();

    // Create a map for quick lookup
    const loyaltyMap = {};
    loyaltyMembers.forEach(l => {
      loyaltyMap[l.userId.toString()] = l;
    });

    // Fetch bookings and feedback counts for each guest
    const guestsWithHistory = await Promise.all(
      guestUsers.map(async (user) => {
        const loyalty = loyaltyMap[user._id.toString()];
        
        const bookings = await Booking.find({ guestId: user._id }).lean();
        // Fetch feedback by guestId or email for backwards compatibility
        const feedback = await Feedback.find({ 
          $or: [
            { guestId: user._id },
            { email: user.email }
          ]
        }).lean();
        
        const completedBookings = bookings.filter(b => b.status === 'checked_out');
        const totalStays = completedBookings.length;
        const totalSpent = completedBookings
          .filter(b => b.paymentStatus === 'paid')
          .reduce((sum, b) => sum + b.totalAmount, 0);

        const lastStay = completedBookings.length > 0 
          ? completedBookings[0].checkOutDate 
          : null;

        const now = new Date();
        const upcomingBooking = bookings.find(b => 
          new Date(b.checkInDate) > now && 
          (b.status === 'confirmed' || b.status === 'pending')
        );

        return {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone,
          tier: loyalty?.tier || 'None',
          points: loyalty?.points || 0,
          totalStays,
          totalSpent,
          lastStay,
          upcomingStay: upcomingBooking ? upcomingBooking.checkInDate : null,
          hasLoyalty: !!loyalty
        };
      })
    );

    res.json(guestsWithHistory);
  } catch (error) {
    console.error('Error fetching guests history:', error);
    res.status(500).json({ message: 'Error fetching guests history', error: error.message });
  }
}
