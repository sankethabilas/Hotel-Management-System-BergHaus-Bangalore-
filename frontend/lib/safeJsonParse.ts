/**
 * Safely parse JSON response, handling non-JSON responses gracefully
 */
export const safeJsonParse = async (response: Response): Promise<any> => {
  try {
    const text = await response.text();
    
    // Check if response is empty
    if (!text.trim()) {
      return { success: false, message: 'Empty response received' };
    }
    
    // Try to parse as JSON
    try {
      return JSON.parse(text);
    } catch (parseError) {
      // If JSON parsing fails, return the text as an error message
      console.warn('Non-JSON response received:', text);
      return {
        success: false,
        message: text || 'Invalid response format',
        rawResponse: text
      };
    }
  } catch (error) {
    console.error('Error reading response:', error);
    return {
      success: false,
      message: 'Failed to read response',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Check if a response is likely a rate limit or server error
 */
export const isServerError = (text: string): boolean => {
  const serverErrorPatterns = [
    /too many requests/i,
    /rate limit/i,
    /server error/i,
    /internal server error/i,
    /service unavailable/i,
    /bad gateway/i,
    /gateway timeout/i
  ];
  
  return serverErrorPatterns.some(pattern => pattern.test(text));
};

/**
 * Get user-friendly error message from response
 */
export const getErrorMessage = (response: any): string => {
  if (response.message) {
    return response.message;
  }
  
  if (response.rawResponse) {
    if (isServerError(response.rawResponse)) {
      return 'Server is temporarily unavailable. Please try again later.';
    }
    return response.rawResponse;
  }
  
  return 'An unexpected error occurred. Please try again.';
};
