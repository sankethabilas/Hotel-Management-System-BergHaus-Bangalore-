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
  idDetails?: {
    idType?: 'passport' | 'national_id' | 'driving_license';
    idNumber?: string;
  };
  department?: UserDepartment;
  isBanned?: boolean;
  bannedReason?: string;
  bannedAt?: string;
  bannedBy?: string;
}

export type UserRole = 'admin' | 'employee' | 'guest' | 'manager' | 'frontdesk';
export type UserDepartment = 'frontdesk' | 'housekeeping' | 'kitchen' | 'maintenance' | 'management' | 'security' | 'other';

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
  verificationId: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  user?: User; // For updateProfile response
  errors?: Record<string, string> | any[];
  details?: string;
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

export interface EmailVerificationResponse {
  verificationId: string;
  expiresIn?: number;
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
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
  isActive?: boolean;
}

// Booking Types
export interface Booking {
  _id: string;
  roomId: string;
  roomNumber: string;
  roomType: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestIdPassport: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalNights: number;
  arrivalTime?: string;
  roomPrice: number;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentReference?: string;
  status: BookingStatus;
  specialRequests?: string;
  cancellationDate?: string;
  cancellationReason?: string;
  refundAmount: number;
  bookingDate: string;
  lastModified: string;
  bookingReference: string;
  confirmationEmailSent: boolean;
  reminderEmailSent: boolean;
  room?: {
    _id: string;
    roomNumber: string;
    roomType: string;
    capacity: number;
    amenities: string[];
  };
}

export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';

// User Management Types
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  bannedUsers: number;
  usersByRole: Array<{ _id: string; count: number }>;
  usersByDepartment: Array<{ _id: string; count: number }>;
  recentRegistrations: number;
  monthlyGrowth: Array<{ _id: { year: number; month: number }; count: number }>;
}

export interface ActivityLog {
  _id: string;
  userId: string | User;
  action: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  resourceId?: string;
  resourceType?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UserManagementFilters {
  page?: number;
  limit?: number;
  role?: UserRole;
  department?: UserDepartment;
  status?: 'active' | 'inactive' | 'banned';
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface NotificationRecipients {
  type: 'all' | 'role' | 'department' | 'specific';
  role?: UserRole;
  department?: UserDepartment;
  userIds?: string[];
}

export interface UserAnalytics {
  userGrowth: Array<{ _id: { year: number; month: number; day: number }; count: number }>;
  activeUsers: number;
  loginTrends: Array<{ _id: { year: number; month: number; day: number }; count: number }>;
  roleDistribution: Array<{ _id: string; count: number }>;
  departmentDistribution: Array<{ _id: string; count: number }>;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  department?: UserDepartment;
  password?: string;
  isActive?: boolean;
}

export interface UpdateUserStatusData {
  isActive?: boolean;
  isBanned?: boolean;
  bannedReason?: string;
}