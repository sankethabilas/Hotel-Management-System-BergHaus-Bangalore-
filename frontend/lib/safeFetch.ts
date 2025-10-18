import { safeJsonParse, getErrorMessage } from './safeJsonParse';
import Cookies from 'js-cookie';

/**
 * Safe fetch wrapper that handles JSON parsing errors gracefully
 */
export const safeFetch = async (url: string, options?: RequestInit): Promise<{
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
}> => {
  try {
    const response = await fetch(url, options);
    
    // Check if response is ok
    if (!response.ok) {
      const errorData = await safeJsonParse(response);
      return {
        success: false,
        error: getErrorMessage(errorData),
        status: response.status
      };
    }
    
    // Parse response safely
    const data = await safeJsonParse(response);
    
    return {
      success: true,
      data,
      status: response.status
    };
  } catch (error) {
    console.error('Fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred'
    };
  }
};

/**
 * Safe fetch for API calls with automatic error handling and authentication
 */
export const safeApiFetch = async (endpoint: string, options?: RequestInit) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  // Get authentication token
  const token = Cookies.get('token');
  
  return safeFetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options?.headers
    },
    ...options
  });
};
