export interface Leave {
  _id?: string;
  staffId: string;
  staffName: string;
  staffEmail: string;
  department: string;
  leaveType: 'sick' | 'annual' | 'casual' | 'emergency' | 'maternity' | 'paternity' | 'unpaid' | 'other';
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  emergencyContact: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  adminComments?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  cancelledAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveFormData {
  leaveType: 'sick' | 'annual' | 'casual' | 'emergency' | 'maternity' | 'paternity' | 'unpaid' | 'other';
  startDate: string;
  endDate: string;
  reason: string;
  emergencyContact?: string;
  staffId?: string; // Optional for backward compatibility
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
  },
  cancelled: {
    color: 'bg-gray-100 text-gray-800',
    label: 'Cancelled'
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
  },
  emergency: {
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    label: 'Emergency Leave',
    icon: '🚨'
  },
  maternity: {
    color: 'bg-pink-50 text-pink-700 border-pink-200',
    label: 'Maternity Leave',
    icon: '👶'
  },
  paternity: {
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    label: 'Paternity Leave',
    icon: '👨‍👶'
  },
  unpaid: {
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    label: 'Unpaid Leave',
    icon: '💼'
  },
  other: {
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    label: 'Other Leave',
    icon: '📋'
  }
} as const;