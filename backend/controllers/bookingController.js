import { Booking } from '../models/bookingModel.js';

// Get all bookings for a specific guest
export async function getGuestBookings(req, res) {
  try {
    const { guestId } = req.params;
    
    if (!guestId) {
      return res.status(400).json({ message: 'guestId is required' });
    }

    const bookings = await Booking.find({ guestId })
      .sort({ checkInDate: -1 })
      .lean();

    // Calculate summary statistics
    const totalStays = bookings.filter(b => b.status === 'checked_out').length;
    const totalSpent = bookings
      .filter(b => b.status === 'checked_out' && b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    res.json({
      bookings,
      summary: {
        totalStays,
        totalSpent,
        totalBookings: bookings.length
      }
    });
  } catch (error) {
    console.error('Error fetching guest bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
}

// Get all bookings (with optional filters)
export async function getAllBookings(req, res) {
  try {
    const { status, paymentStatus, startDate, endDate } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      filter.checkInDate = {};
      if (startDate) filter.checkInDate.$gte = new Date(startDate);
      if (endDate) filter.checkInDate.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(filter)
      .sort({ checkInDate: -1 })
      .lean();

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
}

// Get booking by ID
export async function getBookingById(req, res) {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id).lean();
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Error fetching booking', error: error.message });
  }
}
