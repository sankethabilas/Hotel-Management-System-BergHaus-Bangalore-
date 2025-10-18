/**
 * Parse natural language dates from user messages
 */

const parseNaturalDate = (dateString) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Handle relative dates
  if (dateString.toLowerCase().includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  
  if (dateString.toLowerCase().includes('next week')) {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek;
  }
  
  if (dateString.toLowerCase().includes('next month')) {
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth;
  }
  
  // Handle specific dates (MM/DD/YYYY, DD/MM/YYYY, etc.)
  const datePatterns = [
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY or DD/MM/YYYY
    /(\d{1,2})-(\d{1,2})-(\d{4})/, // MM-DD-YYYY or DD-MM-YYYY
    /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
    /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})/i, // DD MMM YYYY
  ];
  
  for (const pattern of datePatterns) {
    const match = dateString.match(pattern);
    if (match) {
      if (pattern === datePatterns[0] || pattern === datePatterns[1]) {
        // MM/DD/YYYY or DD/MM/YYYY - assume MM/DD/YYYY for US format
        const [, month, day, year] = match;
        return new Date(year, month - 1, day);
      } else if (pattern === datePatterns[2]) {
        // YYYY-MM-DD
        const [, year, month, day] = match;
        return new Date(year, month - 1, day);
      } else if (pattern === datePatterns[3]) {
        // DD MMM YYYY
        const [, day, monthName, year] = match;
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                           'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const monthIndex = monthNames.indexOf(monthName.toLowerCase());
        return new Date(year, monthIndex, day);
      }
    }
  }
  
  return null;
};

const extractDates = (message) => {
  const dates = [];
  const words = message.toLowerCase().split(/\s+/);
  
  // Look for date patterns
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const nextWord = words[i + 1];
    const twoWords = `${word} ${nextWord || ''}`;
    
    // Check for "from X to Y" pattern
    if (word === 'from' && nextWord) {
      const fromIndex = i + 1;
      const toIndex = words.indexOf('to', fromIndex);
      if (toIndex > fromIndex) {
        const fromDate = parseNaturalDate(words.slice(fromIndex, toIndex).join(' '));
        const toDate = parseNaturalDate(words.slice(toIndex + 1, toIndex + 4).join(' '));
        if (fromDate && toDate) {
          dates.push({ type: 'range', checkIn: fromDate, checkOut: toDate });
        }
      }
    }
    
    // Check for single dates
    const singleDate = parseNaturalDate(word);
    if (singleDate) {
      dates.push({ type: 'single', date: singleDate });
    }
  }
  
  return dates;
};

const extractRoomType = (message) => {
  const roomTypes = ['standard', 'deluxe', 'suite', 'premium', 'executive'];
  const messageLower = message.toLowerCase();
  
  for (const roomType of roomTypes) {
    if (messageLower.includes(roomType)) {
      return roomType;
    }
  }
  
  return null;
};

const extractGuestCount = (message) => {
  const guestPatterns = [
    /(\d+)\s+(adults?|guests?|people)/i,
    /for\s+(\d+)/i,
    /(\d+)\s+persons?/i
  ];
  
  for (const pattern of guestPatterns) {
    const match = message.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  return null;
};

module.exports = {
  parseNaturalDate,
  extractDates,
  extractRoomType,
  extractGuestCount
};
