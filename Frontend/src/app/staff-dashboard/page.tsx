'use client';

import React, { useState, useEffect } from 'react';
import { Staff } from '../../types/staff';
import { Leave } from '../../types/leave';

// Icon components
const ClockIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CurrencyDollarIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

const QrCodeIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  </svg>
);

const BellIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationCircleIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LogoutIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export default function StaffDashboard() {
  const [staffData, setStaffData] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock staff data
    const mockStaff: Staff = {
      _id: '1',
      employeeId: 'EMP001',
      fullName: 'John Doe',
      dob: '1990-05-15',
      gender: 'Male',
      nicPassport: '123456789V',
      phone: '+94771234567',
      email: 'john.doe@berghaus.com',
      address: '123 Main St, Bangalore',
      jobRole: 'Senior Chef',
      department: 'Kitchen',
      joinDate: '2022-01-15',
      salary: 75000,
      overtimeRate: 1000,
      bankAccount: '1234567890',
      bankName: 'Bank of Ceylon',
      branch: 'Bangalore Branch',
      profilePic: '',
      isActive: true,
      createdAt: '2022-01-15T00:00:00Z',
      updatedAt: '2025-09-28T00:00:00Z'
    };

    setTimeout(() => {
      setStaffData(mockStaff);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!staffData) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationCircleIcon className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Unable to load dashboard</h2>
          <p className="text-gray-600">Please try again later or contact support.</p>
        </div>
      </div>
    );
  }

  const getDepartmentColor = (department: string) => {
    const colors: { [key: string]: string } = {
      'Kitchen': 'bg-red-50 text-red-700 border-red-200',
      'Housekeeping': 'bg-blue-50 text-blue-700 border-blue-200',
      'Front Desk': 'bg-green-50 text-green-700 border-green-200',
      'Maintenance': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Security': 'bg-purple-50 text-purple-700 border-purple-200',
      'Management': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    return colors[department] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case 'Kitchen': return '👨‍🍳';
      case 'Housekeeping': return '🧹';
      case 'Front Desk': return '🏨';
      case 'Maintenance': return '🔧';
      case 'Security': return '🛡️';
      case 'Management': return '💼';
      default: return '👤';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-50 overflow-hidden">
      {/* Full Screen Dashboard */}
      <div className="h-full flex flex-col">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left side - Welcome */}
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white text-lg font-medium">
                  {getDepartmentIcon(staffData.department)}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Welcome, {staffData.fullName.split(' ')[0]} 👋
                  </h1>
                  <p className="text-sm text-gray-600">{formatDate(new Date())}</p>
                </div>
              </div>

              {/* Right side - Profile */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <BellIcon className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">3</span>
                </button>

                {/* Profile */}
                <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                  <div className="h-8 w-8 rounded-lg bg-gray-300 flex items-center justify-center">
                    <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-gray-900">{staffData.fullName}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getDepartmentColor(staffData.department)}`}>
                        {staffData.department}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">ID: {staffData.employeeId}</p>
                  </div>
                  <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                    <LogoutIcon className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Hours Today */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Hours Today</p>
                    <p className="text-2xl font-bold text-gray-900">8.5</p>
                    <p className="text-sm text-green-600 font-medium">On track</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Leave Balance */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Leave Balance</p>
                    <p className="text-2xl font-bold text-gray-900">18</p>
                    <p className="text-sm text-gray-500">days remaining</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CalendarIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Monthly Salary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">₹80,500</p>
                    <p className="text-sm text-green-600">+₹5,500 overtime</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* Tasks Completed */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Tasks Today</p>
                    <p className="text-2xl font-bold text-gray-900">7/9</p>
                    <p className="text-sm text-blue-600">2 remaining</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Quick Actions - Left Side */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    
                    {/* QR Code Attendance */}
                    <button className="w-full bg-blue-600 text-white rounded-lg p-4 hover:bg-blue-700 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <QrCodeIcon className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold">Mark Attendance</h3>
                          <p className="text-blue-100 text-sm">Scan QR to check in/out</p>
                        </div>
                      </div>
                    </button>

                    {/* Leave Request */}
                    <button className="w-full bg-green-600 text-white rounded-lg p-4 hover:bg-green-700 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                          <CalendarIcon className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold">Request Leave</h3>
                          <p className="text-green-100 text-sm">Submit leave application</p>
                        </div>
                      </div>
                    </button>

                    {/* Payment History */}
                    <button className="w-full bg-yellow-600 text-white rounded-lg p-4 hover:bg-yellow-700 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-500 rounded-lg">
                          <CurrencyDollarIcon className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold">Payment History</h3>
                          <p className="text-yellow-100 text-sm">View salary details</p>
                        </div>
                      </div>
                    </button>

                  </div>
                </div>

                {/* Notifications Panel */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Updates</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Leave request approved</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Salary processed</p>
                        <p className="text-xs text-gray-500">Yesterday</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">New task assigned</p>
                        <p className="text-xs text-gray-500">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks & Schedule - Right Side */}
              <div className="lg:col-span-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Today's Schedule & Tasks</h2>
                    <div className="text-sm text-gray-500">
                      {staffData.jobRole} • {staffData.department}
                    </div>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-auto">
                    
                    {/* Current Task */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">🔥 CURRENT: Prep breakfast station</h4>
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">HIGH</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Set up ingredients and equipment for morning service</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>⏰ Started: 07:00 AM</span>
                            <span>📍 Main Kitchen</span>
                            <span>⏱️ Est. 2 hours</span>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Complete
                        </button>
                      </div>
                    </div>

                    {/* Upcoming Tasks */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">Stock inventory check</h4>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">MEDIUM</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Check and update ingredient levels</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>⏰ 10:00 AM</span>
                            <span>📍 Storage Room</span>
                            <span>⏱️ 45 minutes</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-lg text-sm">Pending</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">Lunch menu preparation</h4>
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">HIGH</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Prepare today's lunch specials</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>⏰ 11:30 AM</span>
                            <span>📍 Main Kitchen</span>
                            <span>⏱️ 2 hours</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-lg text-sm">Scheduled</span>
                      </div>
                    </div>

                    {/* Completed Tasks */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-700">Equipment sanitization</h4>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">COMPLETED</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Clean and sanitize all kitchen equipment</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>✅ Completed: 06:30 AM</span>
                            <span>📍 Main Kitchen</span>
                            <span>⏱️ 30 minutes</span>
                          </div>
                        </div>
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}