'use client';

import { useState, useEffect } from 'react';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { attendanceAPI, AttendanceRecord, TodayAttendanceResponse } from '@/services/attendanceApi';

export default function AdminAttendancePage() {
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendanceResponse | null>(null);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch today's attendance for summary
      const todayData = await attendanceAPI.getTodayAttendance();
      setTodayAttendance(todayData);

      // Fetch attendance for selected date
      const allData = await attendanceAPI.getAllAttendance({
        date: selectedDate,
        limit: 100
      });
      setAllAttendance(allData.attendance);

    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = attendanceAPI.getStatusColor(status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Staff Attendance Management</h1>
          <p className="text-sm text-gray-600">QR Code-based attendance tracking system</p>
        </div>
        <button
          onClick={fetchAttendanceData}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          style={{ backgroundColor: loading ? '#9CA3AF' : '#006bb8' }}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Today's Summary Cards */}
      {todayAttendance && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="admin-card p-4">
            <div className="text-xs font-medium text-gray-600">Total Staff</div>
            <div className="mt-1 text-2xl font-semibold" style={{ color: '#006bb8' }}>
              {todayAttendance.summary.total}
            </div>
            <div className="text-xs text-gray-500">Marked attendance today</div>
          </div>
          
          <div className="admin-card p-4">
            <div className="text-xs font-medium text-gray-600">Present</div>
            <div className="mt-1 text-2xl font-semibold text-green-600">
              {todayAttendance.summary.present}
            </div>
            <div className="text-xs text-gray-500">On time arrivals</div>
          </div>
          
          <div className="admin-card p-4">
            <div className="text-xs font-medium text-gray-600">Late</div>
            <div className="mt-1 text-2xl font-semibold text-yellow-600">
              {todayAttendance.summary.late}
            </div>
            <div className="text-xs text-gray-500">Late arrivals</div>
          </div>
          
          <div className="admin-card p-4">
            <div className="text-xs font-medium text-gray-600">Checked Out</div>
            <div className="mt-1 text-2xl font-semibold text-blue-600">
              {todayAttendance.summary.checkedOut}
            </div>
            <div className="text-xs text-gray-500">Completed shifts</div>
          </div>
          
          <div className="admin-card p-4">
            <div className="text-xs font-medium text-gray-600">Still Working</div>
            <div className="mt-1 text-2xl font-semibold" style={{ color: '#2fa0df' }}>
              {todayAttendance.summary.stillWorking}
            </div>
            <div className="text-xs text-gray-500">Currently active</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Code Display */}
        <div className="lg:col-span-1">
          <QRCodeDisplay onQRGenerated={(qrId) => console.log('QR Generated:', qrId)} />
        </div>

        {/* Attendance Records */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Attendance Records</h2>
            <div className="flex items-center space-x-2">
              <label htmlFor="date" className="text-sm font-medium text-gray-700">
                Date:
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="admin-card overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading attendance records...</p>
              </div>
            ) : allAttendance.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No attendance records found for {selectedDate}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Staff
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check In
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check Out
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hours
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allAttendance.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{record.staffName}</div>
                            <div className="text-xs text-gray-500">{record.staffEmail}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{record.department}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatTime(record.checkInTime)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {record.checkOutTime ? formatTime(record.checkOutTime) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {record.workingHours > 0 ? attendanceAPI.formatWorkingHours(record.workingHours) : '-'}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(record.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


