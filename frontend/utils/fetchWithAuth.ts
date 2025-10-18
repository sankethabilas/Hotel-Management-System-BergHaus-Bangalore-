/**
 * Fetch wrapper that automatically includes authentication token
 * Use this instead of plain fetch() for authenticated API calls
 */

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? (
    localStorage.getItem('adminToken') || 
    localStorage.getItem('staffToken') || 
    localStorage.getItem('authToken')
  ) : null;

  // Merge headers with proper typing
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Make fetch call with merged options
  return fetch(url, {
    ...options,
    headers,
    credentials: options.credentials || 'include',
  });
};

/**
 * Get auth headers object
 * Use this when you need just the headers
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? (
    localStorage.getItem('adminToken') || 
    localStorage.getItem('staffToken') || 
    localStorage.getItem('authToken')
  ) : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};
