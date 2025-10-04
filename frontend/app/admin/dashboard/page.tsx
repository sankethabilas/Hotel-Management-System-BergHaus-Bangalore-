'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getRequests } from '../../../lib/alertApi';
import { useAuth } from '../../../contexts/AuthContext';
import { LogOut, Home } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeStaff: 0,
    totalPayments: 0,
    pendingLeaves: 0,
    totalBookings: 0,
    occupiedRooms: 0
  });
  const [staffRequests, setStaffRequests] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Load dashboard statistics
      const [staffRes, paymentsRes, leavesRes, bookingsRes, requestsRes] = await Promise.all([
        fetch('http://localhost:5000/api/staff'),
        fetch('http://localhost:5000/api/payments'),
        fetch('http://localhost:5000/api/leaves'),
        fetch('http://localhost:5000/api/bookings'),
        getRequests()
      ]);

      const [staffData, paymentsData, leavesData, bookingsData, requestsData] = await Promise.all([
        staffRes.json(),
        paymentsRes.json(),
        bookingsRes.json(),
        leavesRes.json(),
        requestsRes.data
      ]);

      setStats({
        totalStaff: staffData.data?.length || 0,
        activeStaff: staffData.data?.filter((s: any) => s.status === 'active').length || 0,
        totalPayments: paymentsData.data?.length || 0,
        pendingLeaves: leavesData.data?.filter((l: any) => l.status === 'pending').length || 0,
        totalBookings: bookingsData.data?.length || 0,
        occupiedRooms: bookingsData.data?.filter((b: any) => b.status === 'confirmed').length || 0
      });

      setStaffRequests(requestsData.data?.requests || []);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  // Generate Staff Requests Report
  const downloadStaffRequestsReport = () => {
    const doc = new jsPDF();
    doc.text("Staff Requests Report", 14, 15);

    const tableData = staffRequests.map((req: any) => [
      req.staffName,
      req.staffEmail,
      req.itemName,
      req.quantity,
      req.reason,
      req.category,
      req.concern || "-",
      req.isDone ? "Done" : "Pending",
    ]);

    (doc as any).autoTable({
      head: [
        [
          "Staff Name",
          "Email",
          "Item",
          "Qty",
          "Reason",
          "Category",
          "Concern",
          "Status",
        ],
      ],
      body: tableData,
      startY: 25,
    });

    doc.save("staff_requests_report.pdf");
  };

  return (
    <>
      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
                <p className="text-sm text-gray-600">Are you sure you want to logout?</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">BergHaus Hotel Management System</h1>
              <p className="text-sm text-gray-600">Admin Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Admin'}
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Administrator
              </span>
              <Link
                href="/"
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">👥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Staff</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalStaff}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">✅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Staff</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.activeStaff}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">💰</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Payments</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalPayments}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">📋</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Leaves</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.pendingLeaves}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/staff" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Staff Management</h3>
                  <p className="text-sm text-gray-500">Manage staff members, roles, and permissions</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/payments" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Payments</h3>
                  <p className="text-sm text-gray-500">Manage staff payments and payroll</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/attendance" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Attendance</h3>
                  <p className="text-sm text-gray-500">Track staff attendance and working hours</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/leaves" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏖️</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Leave Management</h3>
                  <p className="text-sm text-gray-500">Manage staff leave requests and approvals</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/demo-payment" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🧮</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Payment Calculator</h3>
                  <p className="text-sm text-gray-500">Calculate staff payments and deductions</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/Food-home" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🍽️</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Food & Beverage</h3>
                  <p className="text-sm text-gray-500">Manage menu, orders, and F&B operations</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/alerts" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔔</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Staff Requests</h3>
                  <p className="text-sm text-gray-500">Manage staff requests and alerts</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Report Generation Section */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">📊 Generate Reports</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={downloadStaffRequestsReport}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Staff Requests Report
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700">Total Bookings</h4>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700">Occupied Rooms</h4>
                <p className="text-2xl font-bold text-gray-900">{stats.occupiedRooms}</p>
              </div>
            </div>
          </div>
        </div>
        </main>
      </div>
    </>
  );
}