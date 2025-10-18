/**
 * Utility functions to extract session data from various sources
 * for auto-filling forms
 */

export interface SessionData {
  name?: string;
  email?: string;
  phone?: string;
  roomNumber?: string;
  bookingReference?: string;
  userType?: 'guest' | 'user' | 'staff' | 'admin';
  additionalInfo?: {
    guestIdPassport?: string;
    checkInDate?: string;
    checkOutDate?: string;
    roomType?: string;
    totalNights?: number;
    specialRequests?: string;
  };
}

/**
 * Extract session data from various sources
 */
export const getSessionData = (): SessionData => {
  if (typeof window === 'undefined') {
    return {};
  }

  const sessionData: SessionData = {};

  try {
    // 1. Check for authenticated user data (from AuthContext)
    const userData = getUserDataFromAuth();
    if (userData) {
      sessionData.name = userData.name;
      sessionData.email = userData.email;
      sessionData.phone = userData.phone;
      sessionData.userType = 'user';
    }

    // 2. Check for guest information (from localStorage)
    const guestInfo = getGuestInfoFromStorage();
    if (guestInfo) {
      sessionData.name = sessionData.name || guestInfo.name;
      sessionData.email = sessionData.email || guestInfo.email;
      sessionData.phone = sessionData.phone || guestInfo.phone;
      sessionData.roomNumber = guestInfo.roomNumber;
      sessionData.userType = 'guest';
    }

    // 3. Check for staff data (from localStorage)
    const staffData = getStaffDataFromStorage();
    if (staffData) {
      sessionData.name = sessionData.name || staffData.fullName;
      sessionData.email = sessionData.email || staffData.email;
      sessionData.phone = sessionData.phone || staffData.phone;
      sessionData.userType = 'staff';
    }

    // 4. Check for admin data (from localStorage)
    const adminData = getAdminDataFromStorage();
    if (adminData) {
      sessionData.name = sessionData.name || adminData.fullName;
      sessionData.email = sessionData.email || adminData.email;
      sessionData.phone = sessionData.phone || adminData.phone;
      sessionData.userType = 'admin';
    }

    // 5. Check for booking data (from localStorage)
    const bookingData = getBookingDataFromStorage();
    if (bookingData) {
      sessionData.roomNumber = sessionData.roomNumber || bookingData.roomNumber;
      sessionData.bookingReference = bookingData.bookingReference;
      sessionData.additionalInfo = {
        roomType: bookingData.roomType,
        checkInDate: bookingData.checkIn,
        checkOutDate: bookingData.checkOut,
        totalNights: bookingData.nights,
        specialRequests: bookingData.specialRequests
      };
    }

    // 6. Check for current booking session (from URL params or sessionStorage)
    const currentBooking = getCurrentBookingSession();
    if (currentBooking) {
      sessionData.roomNumber = sessionData.roomNumber || currentBooking.roomNumber;
      sessionData.bookingReference = sessionData.bookingReference || currentBooking.bookingReference;
    }

  } catch (error) {
    console.error('Error extracting session data:', error);
  }

  return sessionData;
};

/**
 * Get user data from authentication context
 */
const getUserDataFromAuth = (): { name: string; email: string; phone?: string } | null => {
  try {
    // Check for session cookie (Google OAuth)
    const sessionCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('hms-session='));
    
    if (sessionCookie) {
      const cookieValue = sessionCookie.split('=')[1];
      const sessionData = JSON.parse(decodeURIComponent(cookieValue));
      
      if (sessionData.isAuthenticated && sessionData.user) {
        return {
          name: sessionData.user.fullName || `${sessionData.user.firstName} ${sessionData.user.lastName}`.trim(),
          email: sessionData.user.email,
          phone: sessionData.user.phone
        };
      }
    }

    // Check for JWT token (email-password login)
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='));
    
    if (token) {
      // Try to decode JWT token to get user info
      const tokenValue = token.split('=')[1];
      try {
        const payload = JSON.parse(atob(tokenValue.split('.')[1]));
        return {
          name: payload.fullName || `${payload.firstName} ${payload.lastName}`.trim(),
          email: payload.email,
          phone: payload.phone
        };
      } catch (e) {
        // Token might be encrypted, skip
      }
    }
  } catch (error) {
    console.error('Error getting user data from auth:', error);
  }
  
  return null;
};

/**
 * Get guest information from localStorage
 */
const getGuestInfoFromStorage = (): { name: string; email: string; phone: string; roomNumber: string } | null => {
  try {
    const guestInfo = localStorage.getItem('guestInfo');
    if (guestInfo) {
      return JSON.parse(guestInfo);
    }
  } catch (error) {
    console.error('Error getting guest info from storage:', error);
  }
  return null;
};

/**
 * Get staff data from localStorage
 */
const getStaffDataFromStorage = (): { fullName: string; email: string; phone?: string } | null => {
  try {
    const staffData = localStorage.getItem('staffData');
    if (staffData) {
      return JSON.parse(staffData);
    }
  } catch (error) {
    console.error('Error getting staff data from storage:', error);
  }
  return null;
};

/**
 * Get admin data from localStorage
 */
const getAdminDataFromStorage = (): { fullName: string; email: string; phone?: string } | null => {
  try {
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      return JSON.parse(adminData);
    }
  } catch (error) {
    console.error('Error getting admin data from storage:', error);
  }
  return null;
};

/**
 * Get booking data from localStorage
 */
const getBookingDataFromStorage = (): any | null => {
  try {
    const bookingData = localStorage.getItem('bookingData');
    if (bookingData) {
      return JSON.parse(bookingData);
    }
  } catch (error) {
    console.error('Error getting booking data from storage:', error);
  }
  return null;
};

/**
 * Get current booking session data
 */
const getCurrentBookingSession = (): any | null => {
  try {
    const currentBooking = sessionStorage.getItem('currentBooking');
    if (currentBooking) {
      return JSON.parse(currentBooking);
    }
  } catch (error) {
    console.error('Error getting current booking session:', error);
  }
  return null;
};

/**
 * Generate auto-fill suggestions based on session data
 */
export const getAutoFillSuggestions = (sessionData: SessionData): {
  name: string;
  email: string;
  phone: string;
  category: string;
  comments: string;
} => {
  const suggestions = {
    name: sessionData.name || '',
    email: sessionData.email || '',
    phone: sessionData.phone || '',
    category: '',
    comments: ''
  };

  // Auto-suggest category based on user type and context
  if (sessionData.userType === 'staff' || sessionData.userType === 'admin') {
    suggestions.category = 'Management';
  } else if (sessionData.roomNumber) {
    suggestions.category = 'Room Service';
  } else {
    suggestions.category = 'Front Desk';
  }

  // Auto-suggest comments based on session context
  const commentParts: string[] = [];
  
  if (sessionData.roomNumber) {
    commentParts.push(`Room: ${sessionData.roomNumber}`);
  }
  
  if (sessionData.bookingReference) {
    commentParts.push(`Booking Reference: ${sessionData.bookingReference}`);
  }
  
  if (sessionData.additionalInfo?.roomType) {
    commentParts.push(`Room Type: ${sessionData.additionalInfo.roomType}`);
  }
  
  if (sessionData.additionalInfo?.checkInDate && sessionData.additionalInfo?.checkOutDate) {
    commentParts.push(`Stay: ${sessionData.additionalInfo.checkInDate} to ${sessionData.additionalInfo.checkOutDate}`);
  }
  
  if (sessionData.additionalInfo?.totalNights) {
    commentParts.push(`Duration: ${sessionData.additionalInfo.totalNights} nights`);
  }

  if (commentParts.length > 0) {
    suggestions.comments = `Context: ${commentParts.join(', ')}`;
  }

  return suggestions;
};
