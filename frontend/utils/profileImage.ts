/**
 * Utility functions for handling profile images consistently across the application
 */

/**
 * Get the full URL for a profile image
 * @param profileImage - The profile image path from the database
 * @param baseUrl - The base URL for the backend (defaults to localhost:5000)
 * @param cacheBust - Whether to add a cache-busting parameter (defaults to true)
 * @returns The full URL for the profile image or undefined if no image
 */
export const getProfileImageUrl = (profileImage: string | null | undefined, baseUrl: string = 'http://localhost:5000', cacheBust: boolean = true): string | undefined => {
  if (!profileImage) return undefined;
  
  // If it's already a full URL (Google profile image), return as is
  if (profileImage.startsWith('http')) {
    return profileImage;
  }
  
  // If it's a local upload path, prepend the base URL
  if (profileImage.startsWith('/uploads/')) {
    const url = `${baseUrl}${profileImage}`;
    // Add cache-busting parameter to prevent browser caching issues
    if (cacheBust) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}t=${Date.now()}`;
    }
    return url;
  }
  
  // For any other format, try to construct the URL
  const url = `${baseUrl}/uploads/${profileImage}`;
  if (cacheBust) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  }
  return url;
};

/**
 * Get user initials for fallback display
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns User initials in uppercase
 */
export const getUserInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return `${first}${last}`.toUpperCase() || 'U';
};

/**
 * Check if a profile image is a Google profile image
 * @param profileImage - The profile image path
 * @returns True if it's a Google profile image
 */
export const isGoogleProfileImage = (profileImage: string | null | undefined): boolean => {
  return !!(profileImage && profileImage.startsWith('http'));
};

/**
 * Check if a profile image is a local upload
 * @param profileImage - The profile image path
 * @returns True if it's a local upload
 */
export const isLocalProfileImage = (profileImage: string | null | undefined): boolean => {
  return !!(profileImage && profileImage.startsWith('/uploads/'));
};
