/**
 * Booking validation utilities
 */

/**
 * Check if two date ranges overlap, considering maintenance period
 * @param {Date} requestedCheckIn - Requested check-in date
 * @param {Date} requestedCheckOut - Requested check-out date
 * @param {Date} existingCheckIn - Existing booking check-in date
 * @param {Date} existingCheckOut - Existing booking check-out date
 * @param {number} maintenanceDays - Number of maintenance days (default: 1)
 * @returns {boolean} - True if there's an overlap
 */
function hasBookingOverlap(requestedCheckIn, requestedCheckOut, existingCheckIn, existingCheckOut, maintenanceDays = 1) {
  // Add maintenance period after existing checkout
  const maintenanceEndDate = new Date(existingCheckOut);
  maintenanceEndDate.setDate(maintenanceEndDate.getDate() + maintenanceDays);
  
  // Check if the requested dates overlap with existing booking + maintenance period
  // Two date ranges overlap if: start1 <= end2 AND start2 < end1
  // Where end2 includes the maintenance period
  return (
    requestedCheckIn <= maintenanceEndDate && 
    requestedCheckOut > existingCheckIn
  );
}

/**
 * Get the next available check-in date for a room
 * @param {Date} existingCheckOut - Existing booking check-out date
 * @param {number} maintenanceDays - Number of maintenance days (default: 1)
 * @returns {Date} - Next available check-in date
 */
function getNextAvailableCheckIn(existingCheckOut, maintenanceDays = 1) {
  const nextAvailable = new Date(existingCheckOut);
  nextAvailable.setDate(nextAvailable.getDate() + maintenanceDays + 1);
  return nextAvailable;
}

/**
 * Format date for user-friendly display
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatDateForDisplay(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Validate booking dates
 * @param {Date} checkIn - Check-in date
 * @param {Date} checkOut - Check-out date
 * @returns {Object} - Validation result with success boolean and message
 */
function validateBookingDates(checkIn, checkOut) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (checkIn < today) {
    return {
      success: false,
      message: 'Check-in date cannot be in the past'
    };
  }
  
  if (checkIn >= checkOut) {
    return {
      success: false,
      message: 'Check-out date must be after check-in date'
    };
  }
  
  return {
    success: true,
    message: 'Dates are valid'
  };
}

module.exports = {
  hasBookingOverlap,
  getNextAvailableCheckIn,
  formatDateForDisplay,
  validateBookingDates
};
