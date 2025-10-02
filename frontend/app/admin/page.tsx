'use client';

import { useState, useEffect } from 'react';
import { staffAPI } from '@/lib/staffApi';
import { leaveAPI } from '@/lib/leaveApi';
import { Staff } from '@/types/staff';

export default function AdminDashboardPage() {
  const [activeStaffCount, setActiveStaffCount] = useState<number>(0);
  const [pendingLeavesCount, setPendingLeavesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch staff data
      const staffData: Staff[] = await staffAPI.getAllStaff();
      const activeStaff = staffData.filter(staff => staff.isActive);
      setActiveStaffCount(activeStaff.length);

      // Fetch leave data
      try {
        const leaveResponse = await leaveAPI.getAllLeaves();
        const leaves = leaveResponse.leaves || [];
        const pendingLeaves = leaves.filter((leave: any) => leave.status === 'pending');
        setPendingLeavesCount(pendingLeaves.length);
      } catch (leaveError) {
        console.error('Failed to fetch leave data:', leaveError);
        setPendingLeavesCount(0);
      }
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      // Set default values in case of error
      setActiveStaffCount(0);
      setPendingLeavesCount(0);
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
    { 
      label: "Active Staff", 
      value: loading ? "..." : activeStaffCount.toString(), 
      sub: loading ? "Loading..." : error ? "Unable to load" : `${activeStaffCount} currently active` 
    },
    { 
      label: "Pending Leaves", 
      value: loading ? "..." : pendingLeavesCount.toString(), 
      sub: loading ? "Loading..." : error ? "Unable to load" : `${pendingLeavesCount} awaiting approval` 
    },
    { 
      label: "Total Revenue", 
      value: "Rs. 600,000.00", 
      sub: "This month"
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">Overview of today across Berghaus Bungalow</p>
        </div>
        <div className="inline-flex gap-2">
          <button 
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Refresh dashboard data"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Download Report
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Share
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">{k.label}</div>
            <div className="mt-2 text-2xl font-semibold text-blue-600">{k.value}</div>
            <div className="mt-1 text-xs text-gray-500">{k.sub}</div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Bookings (Last 7 days)</h2>
            <span className="text-xs text-gray-500">Mock data</span>
          </div>
          <div className="mt-6 grid grid-cols-7 gap-2 text-center">
            {["M","T","W","T","F","S","S"].map((d, i) => (
              <div key={d+i} className="space-y-2">
                <div className="h-24 rounded-md bg-gradient-to-t from-blue-500 to-blue-200"
                  style={{ 
                    background: `linear-gradient(0deg, #3b82f6 ${(i+2)*10}%, #dbeafe 0%)` 
                  }}
                />
                <div className="text-xs text-gray-600">{d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="text-gray-700">
                {loading ? 'Loading leave requests...' : 
                 error ? 'Unable to load leave data' :
                 pendingLeavesCount > 0 ? `${pendingLeavesCount} leave requests pending approval` : 'No pending leave requests'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-400" />
              <span className="text-gray-700">Staff attendance tracking updated</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
              <span className="text-gray-700">
                {loading ? 'Loading staff data...' :
                 error ? 'Unable to load staff data' :
                 activeStaffCount > 0 ? `${activeStaffCount} staff members currently active` : 'No active staff members'}
              </span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}