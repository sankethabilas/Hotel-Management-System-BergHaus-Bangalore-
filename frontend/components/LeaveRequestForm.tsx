'use client';

import { useState } from 'react';
import { leaveAPI } from '@/lib/leaveApi';
import { LeaveFormData } from '@/types/leave';

interface LeaveRequestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

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

export default function LeaveRequestForm({ onSuccess, onCancel }: LeaveRequestFormProps) {
  const [formData, setFormData] = useState<LeaveFormData>({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
    emergencyContact: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateDates = (): boolean => {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setError('Start date cannot be in the past');
      return false;
    }

    if (end < start) {
      setError('End date cannot be before start date');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDates()) {
      return;
    }

    if (!formData.reason.trim()) {
      setError('Please provide a reason for the leave');
      return;
    }

    // Get current staff data from localStorage
    const staffData = localStorage.getItem('staffData');
    if (!staffData) {
      setError('Staff data not found. Please log in again.');
      return;
    }

    let currentStaffId: string;
    try {
      const parsedStaffData = JSON.parse(staffData);
      currentStaffId = parsedStaffData.id || parsedStaffData._id;
      
      if (!currentStaffId) {
        setError('Staff ID not found. Please log in again.');
        return;
      }
    } catch (error) {
      setError('Invalid staff data. Please log in again.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Include staff ID in the form data
      const leaveRequestData = {
        ...formData,
        staffId: currentStaffId
      };
      
      await leaveAPI.createLeave(leaveRequestData);
      setSuccess('Leave request submitted successfully!');
      
      // Reset form
      setFormData({
        leaveType: 'casual',
        startDate: '',
        endDate: '',
        reason: '',
        emergencyContact: ''
      });

      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess?.();
      }, 1500);

    } catch (error) {
      console.error('Leave request error:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (): number => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit Leave Request</h2>
        <p className="text-gray-600">Fill out the form below to request time off</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Leave Type */}
        <div>
          <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 mb-2">
            Leave Type *
          </label>
          <select
            id="leaveType"
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.entries(LEAVE_TYPE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.icon} {config.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              min={formData.startDate || new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Duration Display */}
        {formData.startDate && formData.endDate && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800">
              <strong>Duration:</strong> {calculateDays()} day(s)
            </p>
          </div>
        )}

        {/* Reason */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Leave *
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={4}
            required
            placeholder="Please provide a detailed reason for your leave request..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Emergency Contact */}
        <div>
          <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
            Emergency Contact (Optional)
          </label>
          <input
            type="tel"
            id="emergencyContact"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleChange}
            placeholder="Phone number for emergency contact"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            If not provided, your registered phone number will be used
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Request'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}