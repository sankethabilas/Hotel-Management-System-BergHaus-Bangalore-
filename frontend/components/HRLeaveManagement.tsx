'use client';

import { useState, useEffect } from 'react';
import { Leave, LeaveWithStaffInfo, LEAVE_STATUS_CONFIG, LEAVE_TYPE_CONFIG } from '@/types/leave';
import { Staff } from '@/types/staff';
import { leaveAPI } from '@/lib/leaveApi';
import { staffAPI } from '@/lib/staffApi';

export default function HRLeaveManagement() {
  const [leaves, setLeaves] = useState<LeaveWithStaffInfo[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [processingId, setProcessingId] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leavesResponse, staffResponse] = await Promise.all([
        leaveAPI.getAllLeaves(),
        staffAPI.getAllStaff()
      ]);

      const staffList = staffResponse || [];
      const leavesList = leavesResponse.leaves || [];

      // Merge leave data with staff info
      const leavesWithStaffInfo = leavesList.map(leave => {
        const staffInfo = staffList.find(s => s._id === leave.staffId);
        return {
          ...leave,
          staffInfo: staffInfo ? {
            _id: staffInfo._id!,
            employeeId: staffInfo.employeeId,
            fullName: staffInfo.fullName,
            email: staffInfo.email,
            department: staffInfo.department || '',
            jobRole: staffInfo.jobRole
          } : undefined
        };
      });

      setLeaves(leavesWithStaffInfo);
      setStaff(staffList);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (leaveId: string, newStatus: 'approved' | 'rejected') => {
    try {
      setProcessingId(leaveId);
      await leaveAPI.updateLeaveStatus(leaveId, newStatus);
      
      // Update local state
      setLeaves(prev => prev.map(leave => 
        leave._id === leaveId 
          ? { ...leave, status: newStatus }
          : leave
      ));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update leave status');
    } finally {
      setProcessingId('');
    }
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

  const filteredLeaves = leaves.filter(leave => {
    if (filter === 'all') return true;
    return leave.status === filter;
  });

  const getStatusCounts = () => {
    return {
      all: leaves.length,
      pending: leaves.filter(l => l.status === 'pending').length,
      approved: leaves.filter(l => l.status === 'approved').length,
      rejected: leaves.filter(l => l.status === 'rejected').length,
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading leave requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR - Leave Management</h1>
          <p className="mt-2 text-gray-600">Review and manage all staff leave requests</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
            </div>
            <div className="text-blue-600">📋</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
            </div>
            <div className="text-yellow-600">⏳</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{statusCounts.approved}</p>
            </div>
            <div className="text-green-600">✅</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
            </div>
            <div className="text-red-600">❌</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === status
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
              </button>
            ))}
          </nav>
        </div>

        {/* Leave Requests Table */}
        <div className="overflow-x-auto">
          {filteredLeaves.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {filter === 'all' ? '' : filter} leave requests
              </h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'No leave requests have been submitted yet.'
                  : `No ${filter} leave requests to display.`
                }
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {leave.staffInfo ? leave.staffInfo.fullName : 'Unknown Staff'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {leave.staffInfo && (
                              <>
                                {leave.staffInfo.employeeId} • {leave.staffInfo.department}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">
                          {LEAVE_TYPE_CONFIG[leave.leaveType].icon}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {LEAVE_TYPE_CONFIG[leave.leaveType].label}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {calculateDuration(leave.startDate, leave.endDate)} day(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>{formatDate(leave.startDate)}</div>
                        <div className="text-gray-500">to {formatDate(leave.endDate)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${LEAVE_STATUS_CONFIG[leave.status].color}`}>
                        {LEAVE_STATUS_CONFIG[leave.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {leave.reason || 'No reason provided'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {leave.status === 'pending' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusUpdate(leave._id!, 'approved')}
                            disabled={processingId === leave._id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            {processingId === leave._id ? '...' : '✅ Approve'}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(leave._id!, 'rejected')}
                            disabled={processingId === leave._id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {processingId === leave._id ? '...' : '❌ Reject'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500">
                          {leave.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}