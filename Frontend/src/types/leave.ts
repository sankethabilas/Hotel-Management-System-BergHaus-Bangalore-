export interface Leave {
  _id?: string;
  staffId: string;
  leaveType: 'sick' | 'casual' | 'annual';
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveFormData {
  staffId: string;
  leaveType: 'sick' | 'casual' | 'annual';
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface LeaveWithStaffInfo extends Leave {
  staffInfo?: {
    _id: string;
    employeeId: string;
    fullName: string;
    email: string;
    department: string;
    jobRole: string;
  };
}

export interface ApiResponse<T> {
  leaves?: T;
  leave?: Leave;
  message?: string;
  error?: string;
}

// Utility type for leave status colors and badges
export const LEAVE_STATUS_CONFIG = {
  pending: {
    color: 'bg-yellow-100 text-yellow-800',
    label: 'Pending'
  },
  approved: {
    color: 'bg-green-100 text-green-800',
    label: 'Approved'
  },
  rejected: {
    color: 'bg-red-100 text-red-800',
    label: 'Rejected'
  }
} as const;

export const LEAVE_TYPE_CONFIG = {
  sick: {
    color: 'bg-red-50 text-red-700 border-red-200',
    label: 'Sick Leave',
    icon: '🏥'
  },
  casual: {
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    label: 'Casual Leave',
    icon: '🏖️'
  },
  annual: {
    color: 'bg-green-50 text-green-700 border-green-200',
    label: 'Annual Leave',
    icon: '🌴'
  }
} as const;