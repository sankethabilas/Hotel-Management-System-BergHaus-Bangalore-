'use client';

import { useState, useEffect } from 'react';
import { shiftAPI, DailyCoverageData } from '@/lib/shiftApi';

export default function StaffShiftsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coverageData, setCoverageData] = useState<DailyCoverageData | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchCoverageData();
  }, [selectedDate]);

  const fetchCoverageData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await shiftAPI.getDailyCoverage(selectedDate);
      setCoverageData(response.data);
    } catch (err) {
      console.error('Failed to fetch coverage data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch coverage data');
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading shift data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Staff Shift Management</h1>
          <p className="mt-2 text-gray-600">Monitor daily staff attendance and leave status</p>
        </div>

        {/* Date Selector */}
        <div className="admin-card p-6 mb-6">
          <div className="flex items-end space-x-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
            >
              Today
            </button>
            <button
              onClick={fetchCoverageData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {error && (
          <div className="admin-card p-4 mb-6 bg-red-50 border border-red-200">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {coverageData && (
          <>
            {/* Department Cards */}
            <div className="admin-card p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Department Status - {new Date(selectedDate).toLocaleDateString()}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {coverageData.departments.map((dept) => (
                  <div key={dept.department} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{dept.department}</h3>
                      <div className={`w-3 h-3 rounded-full ${
                        dept.isCovered ? 'bg-green-500' : dept.shortage > 2 ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Present Staff:</span>
                        <span className="font-medium text-gray-900">{dept.availableStaff}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Required:</span>
                        <span className="font-medium text-gray-900">{dept.requiredStaff}</span>
                      </div>
                      
                      {!dept.isCovered && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                          <p className="text-red-700 text-sm font-medium">
                            {dept.shortage} staff shortage
                          </p>
                        </div>
                      )}
                      
                      {dept.isCovered && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                          <p className="text-green-700 text-sm font-medium">
                            ✓ Fully staffed
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Staff Status Today */}
            <div className="admin-card p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Staff Status Today
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {coverageData.departments.map((dept) => (
                  <div key={dept.department} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">{dept.department}</h3>
                    <div className="space-y-3">
                      {dept.staffDetails && dept.staffDetails.length > 0 ? (
                        <div className="space-y-2">
                          {dept.staffDetails.map((staff, index) => (
                            <div key={index} className={`rounded-lg p-3 border ${
                              staff.isOnLeave 
                                ? 'bg-orange-50 border-orange-200' 
                                : 'bg-green-50 border-green-200'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-gray-900 text-sm">{staff.fullName}</div>
                                  <div className="text-xs text-gray-600">{staff.employeeId}</div>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${
                                  staff.isOnLeave ? 'bg-orange-500' : 'bg-green-500'
                                }`}></div>
                              </div>
                              {staff.isOnLeave && (
                                <div className="mt-2 text-xs text-orange-700">
                                  On Leave: {staff.leaveReason}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-red-600 font-medium bg-red-50 border border-red-200 rounded-lg p-3">
                          No staff in this department
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
}
