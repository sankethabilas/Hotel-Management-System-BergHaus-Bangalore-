'use client';

import { useState, useEffect } from 'react';
import LeaveRequestForm from '@/components/LeaveRequestForm';
import { leaveAPI } from '@/lib/leaveApi';

interface Leave {
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

// Leave status configuration
const LEAVE_STATUS_CONFIG = {
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

// Leave type configuration
const LEAVE_TYPE_CONFIG = {
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

export default function LeaveRequestPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await leaveAPI.getMyLeaves();
      setLeaves(response.leaves || []);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchLeaves(); // Refresh the list
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Submit Leave Request</h1>
                <p className="mt-2 text-gray-600">Fill out the form below to request time off</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                ← Back to List
              </button>
            </div>
            <LeaveRequestForm 
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Navigation */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/staff-dashboard" className="hover:text-blue-600 transition-colors">
              Staff Dashboard
            </a>
            <span>→</span>
            <span className="text-gray-900 font-medium">Leave Requests</span>
          </div>

          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Leave Requests</h1>
              <p className="mt-2 text-gray-600">Submit and manage your leave requests</p>
            </div>
            <div className="flex space-x-3">
              <a
                href="/staff-dashboard"
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                ← Back to Dashboard
              </a>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
              >
                + New Leave Request
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
              <button 
                onClick={fetchLeaves}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading leave requests...</p>
            </div>
          )}

          {/* Leave Requests List */}
          {!loading && (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
              {leaves.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests yet</h3>
                  <p className="text-gray-500 mb-6">Start by submitting your first leave request</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    Submit Leave Request
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Leave Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dates
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leaves.map((leave) => (
                        <tr key={leave._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-lg mr-3">
                                {LEAVE_TYPE_CONFIG[leave.leaveType]?.icon || '📋'}
                              </span>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {LEAVE_TYPE_CONFIG[leave.leaveType]?.label || leave.leaveType}
                                </div>
                                <div className={`inline-flex px-2 py-1 text-xs rounded-full border ${LEAVE_TYPE_CONFIG[leave.leaveType]?.color || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                  {leave.leaveType}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">
                              {leave.numberOfDays || calculateDuration(leave.startDate, leave.endDate)} day(s)
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div>{formatDate(leave.startDate)}</div>
                              <div className="text-gray-500">to {formatDate(leave.endDate)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${LEAVE_STATUS_CONFIG[leave.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                              {LEAVE_STATUS_CONFIG[leave.status]?.label || leave.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs">
                              <p className="truncate" title={leave.reason}>
                                {leave.reason || 'No reason provided'}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {leave.createdAt ? formatDate(leave.createdAt) : 'N/A'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
