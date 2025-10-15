// Auth utility functions

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('authToken') || 
         localStorage.getItem('adminToken') || 
         localStorage.getItem('staffToken');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const clearAuthTokens = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('authToken');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('staffToken');
};

export const setAuthToken = (token: string, type: 'admin' | 'staff' | 'auth' = 'auth'): void => {
  if (typeof window === 'undefined') return;
  
  const key = type === 'admin' ? 'adminToken' : type === 'staff' ? 'staffToken' : 'authToken';
  localStorage.setItem(key, token);
};

export const getTokenType = (): 'admin' | 'staff' | 'auth' | null => {
  if (typeof window === 'undefined') return null;
  
  if (localStorage.getItem('adminToken')) return 'admin';
  if (localStorage.getItem('staffToken')) return 'staff';
  if (localStorage.getItem('authToken')) return 'auth';
  return null;
};
