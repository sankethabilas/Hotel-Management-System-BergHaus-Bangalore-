/**
 * Global fetch wrapper that automatically handles JSON parsing errors
 * This replaces the native fetch function to prevent JSON parsing errors
 */

import { safeJsonParse, getErrorMessage } from './safeJsonParse';

// Store the original fetch function
const originalFetch = globalThis.fetch;

/**
 * Enhanced fetch function that automatically handles JSON parsing errors
 * AND adds authentication token to all requests
 */
export const enhancedFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  // Get auth token from localStorage
  const token = typeof window !== 'undefined' ? (
    localStorage.getItem('adminToken') || 
    localStorage.getItem('staffToken') || 
    localStorage.getItem('authToken')
  ) : null;

  // Add Authorization header if token exists
  const enhancedInit = init || {};
  if (token) {
    enhancedInit.headers = {
      ...(enhancedInit.headers || {}),
      'Authorization': `Bearer ${token}`,
    };
    console.log('🔐 Auth token added to request:', typeof input === 'string' ? input : input.toString());
  } else {
    console.warn('⚠️ No auth token found for request:', typeof input === 'string' ? input : input.toString());
  }

  const response = await originalFetch(input, enhancedInit);
  
  // Create a new response object with enhanced methods
  const enhancedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });

  // Override the json() method to use safe parsing
  const originalJson = enhancedResponse.json.bind(enhancedResponse);
  enhancedResponse.json = async () => {
    try {
      return await safeJsonParse(response);
    } catch (error) {
      console.error('Error in enhanced fetch json parsing:', error);
      return {
        success: false,
        message: 'Failed to parse response',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  // Override the text() method to ensure it works properly
  const originalText = enhancedResponse.text.bind(enhancedResponse);
  enhancedResponse.text = async () => {
    return await originalText();
  };

  return enhancedResponse;
};

/**
 * Initialize global fetch replacement
 * Call this in your app initialization
 */
export const initializeGlobalFetch = () => {
  if (typeof window !== 'undefined') {
    // Only replace fetch in browser environment
    globalThis.fetch = enhancedFetch as any;
    console.log('Enhanced fetch initialized with safe JSON parsing');
  }
};

/**
 * Restore original fetch function
 */
export const restoreOriginalFetch = () => {
  globalThis.fetch = originalFetch;
  console.log('Original fetch restored');
};
