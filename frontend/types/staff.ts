export interface Staff {
  _id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  jobRole: string;
  dateOfJoining: string;
  salary: number;
  isActive: boolean;
  profilePicture?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  bankDetails?: {
    accountNumber?: string;
    bankName?: string;
    branchName?: string;
    ifscCode?: string;
  };
  documents?: Array<{
    type: string;
    filename: string;
    path: string;
    uploadedAt: Date;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface StaffFormData {
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  jobRole: string;
  dateOfJoining: string;
  salary: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  bankDetails?: {
    accountNumber?: string;
    bankName?: string;
    branchName?: string;
    ifscCode?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}