'use client';

import { useState, useEffect } from 'react';
import { Staff } from '@/types/staff';
import { staffAPI } from '@/lib/staffApi';

interface AttendanceScannerProps {
  qrId?: string;
}

interface AttendanceRecord {
  _id: string;
  staffName: string;
  staffEmail: string;
  department: string;
  checkInTime: string;
  checkOutTime?: string;
  status: string;
  workingHours: number;
}

export default function AttendanceScanner({ qrId }: AttendanceScannerProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [action, setAction] = useState<'checkin' | 'checkout'>('checkin');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [attendanceRecord, setAttendanceRecord] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const staffData = await staffAPI.getActiveStaff();
      setStaff(staffData.filter((s: Staff) => s.isActive));
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      setMessage('Failed to load staff list');
      setMessageType('error');
    }
  };

  const handleAttendanceMark = async () => {
    if (!selectedStaff) {
      setMessage('Please select a staff member');
      setMessageType('error');
      return;
    }

    if (!qrId) {
      setMessage('QR code ID not found. Please scan a valid QR code.');
      setMessageType('error');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const response = await fetch(`http://localhost:5000/api/attendance/scan/${qrId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staffId: selectedStaff,
          action: action
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setMessageType('success');
        setAttendanceRecord(data.attendance);
        
        // Clear selection after successful submission
        setTimeout(() => {
          setSelectedStaff('');
          setMessage('');
          setAttendanceRecord(null);
        }, 5000);
      } else {
        setMessage(data.message || 'Failed to mark attendance');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Attendance marking error:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2 text-blue-600">
          Mark Attendance
        </h2>
        <p className="text-sm text-gray-600">
          Current time: {getCurrentTime()}
        </p>
      </div>

      <div className="space-y-4">
        {/* Staff Selection */}
        <div>
          <label htmlFor="staff" className="block text-sm font-medium text-gray-700 mb-2">
            Select Staff Member
          </label>
          <select
            id="staff"
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="">Choose your name...</option>
            {staff.map((member) => (
              <option key={member._id} value={member._id}>
                {member.fullName} - {member.department}
              </option>
            ))}
          </select>
        </div>

        {/* Action Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Action
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="action"
                value="checkin"
                checked={action === 'checkin'}
                onChange={(e) => setAction(e.target.value as 'checkin')}
                className="mr-2"
                disabled={loading}
              />
              <span className="text-sm">Check In</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="action"
                value="checkout"
                checked={action === 'checkout'}
                onChange={(e) => setAction(e.target.value as 'checkout')}
                className="mr-2"
                disabled={loading}
              />
              <span className="text-sm">Check Out</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleAttendanceMark}
          disabled={loading || !selectedStaff}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Marking Attendance...
            </div>
          ) : (
            `Mark ${action === 'checkin' ? 'Check In' : 'Check Out'}`
          )}
        </button>

        {/* Message Display */}
        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              messageType === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : messageType === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            {message}
          </div>
        )}

        {/* Attendance Record Display */}
        {attendanceRecord && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Attendance Recorded</h3>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Name:</strong> {attendanceRecord.staffName}</p>
              <p><strong>Department:</strong> {attendanceRecord.department}</p>
              <p><strong>Check In:</strong> {formatTime(attendanceRecord.checkInTime)}</p>
              {attendanceRecord.checkOutTime && (
                <>
                  <p><strong>Check Out:</strong> {formatTime(attendanceRecord.checkOutTime)}</p>
                  <p><strong>Working Hours:</strong> {attendanceRecord.workingHours.toFixed(1)} hours</p>
                </>
              )}
              <p><strong>Status:</strong> 
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  attendanceRecord.status === 'present' ? 'bg-green-100 text-green-800' :
                  attendanceRecord.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {attendanceRecord.status.toUpperCase()}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {qrId && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          QR Session: {qrId.substring(0, 8)}...
        </div>
      )}
    </div>
  );
}