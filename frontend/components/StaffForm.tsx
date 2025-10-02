'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Staff, StaffFormData } from '@/types/staff';
import { staffAPI } from '@/lib/staffApi';

interface StaffFormProps {
  staffId?: string;
  isEdit?: boolean;
  basePathPrefix?: string; // e.g., '/admin' for admin routes
}

export default function StaffForm({ staffId, isEdit = false, basePathPrefix = '' }: StaffFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staff, setStaff] = useState<Staff | null>(null);

  const [formData, setFormData] = useState<StaffFormData>({
    employeeId: '',
    fullName: '',
    dob: '',
    gender: 'Male',
    nicPassport: '',
    phone: '',
    email: '',
    address: '',
    jobRole: '',
    department: '',
    joinDate: new Date().toISOString().split('T')[0],
    salary: 0,
    overtimeRate: 0,
    bankAccount: '',
    bankName: '',
    branch: '',
    profilePic: '',
    isActive: true,
  });

  useEffect(() => {
    if (isEdit && staffId) {
      fetchStaff();
    }
  }, [isEdit, staffId]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const staffData = await staffAPI.getStaffById(staffId!);
      setStaff(staffData);
      
      // Convert dates to YYYY-MM-DD format for input fields
      setFormData({
        employeeId: staffData.employeeId,
        fullName: staffData.fullName,
        dob: staffData.dob ? new Date(staffData.dob).toISOString().split('T')[0] : '',
        gender: staffData.gender || 'Male',
        nicPassport: staffData.nicPassport || '',
        phone: staffData.phone,
        email: staffData.email,
        address: staffData.address || '',
        jobRole: staffData.jobRole,
        department: staffData.department || '',
        joinDate: staffData.joinDate ? new Date(staffData.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        salary: staffData.salary || 0,
        overtimeRate: staffData.overtimeRate || 0,
        bankAccount: staffData.bankAccount || '',
        bankName: staffData.bankName || '',
        branch: staffData.branch || '',
        profilePic: staffData.profilePic || '',
        isActive: staffData.isActive !== undefined ? staffData.isActive : true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch staff details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit && staffId) {
        await staffAPI.updateStaff(staffId, formData);
      } else {
        // Remove employeeId from formData when creating new staff (backend auto-generates it)
        const { employeeId, ...createData } = formData;
        await staffAPI.createStaff(createData as StaffFormData);
      }
      router.push(`${basePathPrefix}/staff` || '/admin/staff');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save staff');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-gray-600">Loading staff details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <a href="/admin" className="hover:text-blue-600 transition-colors">
            Admin Dashboard
          </a>
          <span>→</span>
          <a href="/admin/staff" className="hover:text-blue-600 transition-colors">
            Staff Management
          </a>
          <span>→</span>
          <span className="text-gray-900 font-medium">
            {isEdit ? 'Edit Staff' : 'Add Staff'}
          </span>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h1>
              <button
                onClick={() => router.push(`${basePathPrefix}/staff` || '/admin/staff')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ← Back to Staff List
              </button>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {isEdit && (
                    <div>
                      <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-2">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        name="employeeId"
                        id="employeeId"
                        disabled
                        value={formData.employeeId}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dob"
                      id="dob"
                      required
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      id="gender"
                      required
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="nicPassport" className="block text-sm font-medium text-gray-700 mb-2">
                      NIC/Passport *
                    </label>
                    <input
                      type="text"
                      name="nicPassport"
                      id="nicPassport"
                      required
                      value={formData.nicPassport}
                      onChange={handleChange}
                      placeholder="Enter NIC or Passport number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      name="address"
                      id="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter full address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Job Information */}
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Job Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="jobRole" className="block text-sm font-medium text-gray-700 mb-2">
                      Job Role *
                    </label>
                    <input
                      type="text"
                      name="jobRole"
                      id="jobRole"
                      required
                      value={formData.jobRole}
                      onChange={handleChange}
                      placeholder="e.g., Front Desk Manager"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      name="department"
                      id="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Department</option>
                      <option value="Front Office">Front Office</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Security">Security</option>
                      <option value="IT">IT</option>
                      <option value="HR">HR</option>
                      <option value="Management">Management</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Join Date
                    </label>
                    <input
                      type="date"
                      name="joinDate"
                      id="joinDate"
                      value={formData.joinDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-2">
                      Salary *
                    </label>
                    <input
                      type="number"
                      name="salary"
                      id="salary"
                      required
                      min="0"
                      step="0.01"
                      value={formData.salary}
                      onChange={handleChange}
                      placeholder="Enter monthly salary"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="overtimeRate" className="block text-sm font-medium text-gray-700 mb-2">
                      Overtime Rate (per hour)
                    </label>
                    <input
                      type="number"
                      name="overtimeRate"
                      id="overtimeRate"
                      min="0"
                      step="0.01"
                      value={formData.overtimeRate}
                      onChange={handleChange}
                      placeholder="Enter overtime rate"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="profilePic" className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Picture URL
                    </label>
                    <input
                      type="url"
                      name="profilePic"
                      id="profilePic"
                      value={formData.profilePic}
                      onChange={handleChange}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Banking Information */}
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Banking Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Account Number
                    </label>
                    <input
                      type="text"
                      name="bankAccount"
                      id="bankAccount"
                      value={formData.bankAccount}
                      onChange={handleChange}
                      placeholder="Enter account number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      id="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      placeholder="Enter bank name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
                      Branch
                    </label>
                    <input
                      type="text"
                      name="branch"
                      id="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      placeholder="Enter branch name/location"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active Employee
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Inactive employees cannot log in to the system
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.push(`${basePathPrefix}/staff` || '/admin/staff')}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    isEdit ? 'Update Staff' : 'Add Staff'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}