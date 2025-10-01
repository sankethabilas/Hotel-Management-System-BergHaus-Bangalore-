export interface Staff {
  _id?: string;
  employeeId: string;
  fullName: string;
  dob: string;
  gender: 'Male' | 'Female';
  nicPassport: string;
  phone: string;
  email: string;
  address: string;
  jobRole: string;
  department: string;
  joinDate: string;
  salary: number;
  overtimeRate: number;
  bankAccount: string;
  bankName: string;
  branch: string;
  profilePic: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffFormData {
  employeeId: string;
  fullName: string;
  dob: string;
  gender: 'Male' | 'Female';
  nicPassport: string;
  phone: string;
  email: string;
  address: string;
  jobRole: string;
  department: string;
  joinDate: string;
  salary: number;
  overtimeRate: number;
  bankAccount: string;
  bankName: string;
  branch: string;
  profilePic: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  staff?: T;
  message?: string;
  error?: string;
}
