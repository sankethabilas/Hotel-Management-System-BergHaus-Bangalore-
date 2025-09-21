// User Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  profileImage?: string;
  dateOfBirth?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
}

export type UserRole = 'admin' | 'employee' | 'guest' | 'manager';

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone?: string;
  role?: UserRole;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  user?: User; // For updateProfile response
  errors?: Record<string, string>;
}

export interface AuthUser {
  user: User | null;
  setUser: (user: User | null) => void;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    users: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// Form Types
export interface FormErrors {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: {
    minLength?: string | null;
    hasUpperCase?: string | null;
    hasLowerCase?: string | null;
    hasNumber?: string | null;
  };
}

// Component Props Types
export interface PageProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

export interface ProtectedPageProps extends PageProps {
  requiredRole?: UserRole;
  redirectTo?: string;
}

// API Request Types
export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
  isActive?: boolean;
}
