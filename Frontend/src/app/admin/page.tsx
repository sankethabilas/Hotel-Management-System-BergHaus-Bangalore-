'use client';

import { useState, useEffect } from 'react';
import { staffAPI } from '@/services/api';
import { leaveAPI } from '@/services/leaveApi';
import { Staff } from '@/types/staff';
import { Leave } from '@/types/leave';

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
      const leaveResponse = await leaveAPI.getAllLeaves();
      const leaves: Leave[] = leaveResponse.leaves || [];
      const pendingLeaves = leaves.filter(leave => leave.status === 'pending');
      setPendingLeavesCount(pendingLeaves.length);
      
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
      value: "Rs. 600000.00", 
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Overview of today across BergHaus Bangalore</p>
        </div>
        <div className="inline-flex gap-2">
          <button 
            onClick={fetchDashboardData}
            disabled={loading}
            className="btn-secondary"
            title="Refresh dashboard data"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="btn-primary" style={{ backgroundColor: "#006bb8" }}>Download Report</button>
          <button className="btn-secondary">Share</button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="admin-card p-4">
            <div className="text-xs font-medium text-gray-600">{k.label}</div>
            <div className="mt-2 text-2xl font-semibold" style={{ color: "#006bb8" }}>{k.value}</div>
            <div className="mt-1 text-xs admin-chip">{k.sub}</div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 admin-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Bookings (Last 7 days)</h2>
            <span className="text-xs text-gray-600">Mock data</span>
          </div>
          <div className="mt-6 grid grid-cols-7 gap-2 text-center">
            {["M","T","W","T","F","S","S"].map((d, i) => (
              <div key={d+i} className="space-y-2">
                <div className="h-24 rounded-md"
                  style={{ background: `linear-gradient(0deg, #2fa0df ${(i+2)*10}%, #fee3b3 0%)` }}
                />
                <div className="text-xs text-gray-600">{d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card p-5">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#ffc973" }} />
              {loading ? 'Loading leave requests...' : 
               error ? 'Unable to load leave data' :
               pendingLeavesCount > 0 ? `${pendingLeavesCount} leave requests pending approval` : 'No pending leave requests'}
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#2fa0df" }} />
              Staff attendance tracking updated
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#006bb8" }} />
              {loading ? 'Loading staff data...' :
               error ? 'Unable to load staff data' :
               activeStaffCount > 0 ? `${activeStaffCount} staff members currently active` : 'No active staff members'}
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}


