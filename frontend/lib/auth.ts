import { authAPI, setAuthToken, removeAuthToken, getAuthToken } from './api';
import { 
  LoginCredentials, 
  RegisterData, 
  User, 
  AuthResponse, 
  ApiResponse, 
  UpdateUserData, 
  ChangePasswordData,
  ValidationResult 
} from '@/types';

// Auth context and utilities
export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        setAuthToken(response.data?.token || null);
        return {
          success: true,
          message: 'Authentication successful',
          user: response.data?.user
        };
      }
      
      return {
        success: false,
        message: response.message
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  }

  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        setAuthToken(response.data?.token || null);
        return {
          success: true,
          message: 'Authentication successful',
          user: response.data?.user
        };
      }
      
      return {
        success: false,
        message: response.message,
        errors: response.errors
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        errors: error.response?.data?.errors
      };
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const token = getAuthToken();
      if (!token) {
        return null;
      }

      const response = await authAPI.getMe();
      
      if (response.success) {
        return response.data?.user || null;
      }
      
      return null;
    } catch (error: any) {
      removeAuthToken();
      return null;
    }
  }

  static async updateProfile(profileData: UpdateUserData): Promise<AuthResponse> {
    try {
      const response = await authAPI.updateProfile(profileData);
      
      if (response.success) {
        return {
          success: true,
          user: response.data?.user,
          message: response.message
        };
      }
      
      return {
        success: false,
        message: response.message,
        errors: response.errors
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed',
        errors: error.response?.data?.errors
      };
    }
  }

  static async changePassword(passwordData: ChangePasswordData): Promise<ApiResponse> {
    try {
      const response = await authAPI.changePassword(passwordData);
      
      if (response.success) {
        return {
          success: true,
          message: response.message
        };
      }
      
      return {
        success: false,
        message: response.message,
        errors: response.errors
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password change failed',
        errors: error.response?.data?.errors
      };
    }
  }

  static logout(): void {
    removeAuthToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  static isAuthenticated(): boolean {
    return !!getAuthToken();
  }

  static hasRole(user: User | null, role: string): boolean {
    return user?.role === role;
  }
}

// Validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): ValidationResult => {
  const minLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return {
    isValid: minLength && hasUpperCase && hasLowerCase && hasNumber,
    errors: {
      minLength: !minLength ? 'Password must be at least 6 characters' : null,
      hasUpperCase: !hasUpperCase ? 'Password must contain at least one uppercase letter' : null,
      hasLowerCase: !hasLowerCase ? 'Password must contain at least one lowercase letter' : null,
      hasNumber: !hasNumber ? 'Password must contain at least one number' : null,
    }
  };
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};