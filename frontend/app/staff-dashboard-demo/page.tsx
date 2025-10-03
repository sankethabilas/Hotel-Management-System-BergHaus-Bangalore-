'use client';

import React from 'react';

// Mock staff data
const mockStaffData = {
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
};

// Simple Icon Components
const ClockIcon = () => (
  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CurrencyIcon = () => (
  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

const TaskIcon = () => (
  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const QrIcon = () => (
  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  </svg>
);

export default function StaffDashboardDemo() {
  const getDepartmentColor = (department: string) => {
    const colors: { [key: string]: string } = {
      'Kitchen': 'bg-red-100 text-red-800',
      'Housekeeping': 'bg-blue-100 text-blue-800',
      'Front Desk': 'bg-green-100 text-green-800',
      'Maintenance': 'bg-yellow-100 text-yellow-800',
      'Security': 'bg-purple-100 text-purple-800',
      'Management': 'bg-indigo-100 text-indigo-800',
    };
    return colors[department] || 'bg-gray-100 text-gray-800';
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

  const dashboardStats = [
    { title: 'Hours This Week', value: '42.5', change: '+2.3', icon: ClockIcon, color: 'blue' },
    { title: 'Leave Balance', value: '18', subtitle: 'days remaining', icon: CalendarIcon, color: 'green' },
    { title: 'This Month Salary', value: '₹75,000', change: '+₹5,000 overtime', icon: CurrencyIcon, color: 'yellow' },
    { title: 'Tasks Completed', value: '23', subtitle: 'this week', icon: TaskIcon, color: 'purple' }
  ];

  const quickActions = [
    { title: 'Mark Attendance', desc: 'Scan QR code to check in/out', icon: QrIcon, color: 'bg-blue-500' },
    { title: 'Request Leave', desc: 'Submit a new leave request', icon: CalendarIcon, color: 'bg-green-500' },
    { title: 'View Payments', desc: 'Check salary and payment history', icon: CurrencyIcon, color: 'bg-yellow-500' },
    { title: 'Today\'s Tasks', desc: 'View assigned tasks for today', icon: TaskIcon, color: 'bg-purple-500' }
  ];

  const recentActivities = [
    { type: 'attendance', title: 'Checked in', desc: 'Successfully marked attendance for today', time: '2h ago', icon: '🕐' },
    { type: 'task', title: 'Task completed', desc: 'Finished preparing breakfast menu items', time: '3h ago', icon: '✅' },
    { type: 'leave', title: 'Leave approved', desc: 'Your casual leave request for Oct 5-6 has been approved', time: '1d ago', icon: '🏖️' },
    { type: 'payment', title: 'Salary credited', desc: 'Monthly salary for September has been credited', time: '3d ago', icon: '💰' }
  ];

  const todayTasks = [
    { title: 'Prepare breakfast menu items', priority: 'high', status: 'pending', time: '07:00 AM', category: 'Kitchen' },
    { title: 'Stock inventory check', priority: 'medium', status: 'in-progress', time: '10:00 AM', category: 'Inventory' },
    { title: 'Clean kitchen equipment', priority: 'medium', status: 'pending', time: '03:00 PM', category: 'Maintenance' },
    { title: 'Prep vegetables for dinner', priority: 'high', status: 'completed', time: '04:00 PM', category: 'Kitchen' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">🏨 BergHaus Staff Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500 rounded-full">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>
              
              {/* Profile Section */}
              <div className="flex items-center space-x-3 bg-white rounded-lg p-2 border border-gray-200">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">{mockStaffData.fullName}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDepartmentColor(mockStaffData.department)}`}>
                      <span className="mr-1">{getDepartmentIcon(mockStaffData.department)}</span>
                      {mockStaffData.department}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{mockStaffData.jobRole} • ID: {mockStaffData.employeeId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {mockStaffData.fullName.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your work today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    {stat.subtitle && <p className="text-sm text-gray-500">{stat.subtitle}</p>}
                  </div>
                  {stat.change && (
                    <div className="flex items-center mt-2">
                      <span className="text-sm font-medium text-green-600">↗️ {stat.change}</span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-xl border-2 bg-${stat.color}-50 text-${stat.color}-600 border-${stat.color}-200`}>
                  <stat.icon />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="group relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 text-left"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`p-4 rounded-full ${action.color} text-white group-hover:scale-110 transition-transform`}>
                    <action.icon />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{action.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tasks & Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Today's Tasks */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <TaskIcon />
                  <span className="ml-2">Today's Tasks</span>
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {todayTasks.map((task, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{task.title}</h4>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                              task.priority === 'high' ? 'bg-red-100 text-red-800 border-red-200' : 
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                              'bg-green-100 text-green-800 border-green-200'
                            }`}>
                              {task.priority.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-gray-500">⏰ {task.time}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-500">📂 {task.category}</span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status === 'completed' ? '✅ Completed' :
                           task.status === 'in-progress' ? '🔄 In Progress' : '⏳ Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="relative">
                      {index < recentActivities.length - 1 && (
                        <div className="absolute left-5 top-12 w-0.5 h-8 bg-gray-200"></div>
                      )}
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-50 border-2 border-gray-200 flex items-center justify-center">
                          <span className="text-lg">{activity.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <span className="text-xs text-gray-500">{activity.time}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{activity.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment & Notifications */}
          <div className="space-y-8">
            {/* Payment Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <CurrencyIcon />
                  <span className="ml-2">Payment Summary</span>
                </h3>
              </div>
              <div className="p-6">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">September 2025</h4>
                  <div className="text-3xl font-bold text-green-600">₹80,500</div>
                  <p className="text-sm text-gray-500">Total Earnings</p>
                </div>
                <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Basic Salary</span>
                    <span className="font-medium text-gray-900">₹75,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Overtime</span>
                    <span className="font-medium text-green-600">+₹5,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bonus</span>
                    <span className="font-medium text-green-600">+₹2,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Deductions</span>
                    <span className="font-medium text-red-600">-₹1,500</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-900">Net Pay</span>
                    <span className="font-bold text-gray-900">₹80,500</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0"><div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Leave request approved</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0"><div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Salary credited</p>
                      <p className="text-xs text-gray-500">Yesterday</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0"><div className="h-2 w-2 bg-yellow-500 rounded-full mt-2"></div></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">New task assigned</p>
                      <p className="text-xs text-gray-500">3 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}