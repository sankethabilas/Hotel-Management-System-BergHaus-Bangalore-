'use client';

import { useState, useEffect } from 'react';
import { paymentAPI, Payment } from '@/lib/paymentApi';

export default function StaffPaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    fetchPaymentHistory();
  }, [selectedYear]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get staff data from localStorage
      const staffData = localStorage.getItem('staffData');
      if (!staffData) {
        throw new Error('Staff information not found. Please log in again.');
      }

      const staffInfo = JSON.parse(staffData);
      
      const data = await paymentAPI.getPaymentsByStaff(staffInfo._id, {
        year: selectedYear,
        limit: 12
      });

      setPayments(data.payments || []);
      setStaff(data.staff || staffInfo);
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      setError(error instanceof Error ? error.message : 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'paid': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'failed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    
    const colors = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const calculateYTD = () => {
    return payments.reduce((total, payment) => total + (payment.netPay || 0), 0);
  };

  const calculateTotalDeductions = () => {
    return payments.reduce((total, payment) => total + (payment.totalDeductions || 0), 0);
  };

  const calculateGrossPay = () => {
    return payments.reduce((total, payment) => total + (payment.grossPay || 0), 0);
  };

  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= currentYear - 5; year--) {
    yearOptions.push(year);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-gray-600">Loading payment history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Payment History</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={fetchPaymentHistory}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
                  >
                    Try Again
                  </button>
                  <a
                    href="/staff-dashboard"
                    className="bg-gray-100 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Back to Dashboard
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Navigation */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/staff-dashboard" className="hover:text-blue-600 transition-colors">
              Staff Dashboard
            </a>
            <span>→</span>
            <span className="text-gray-900 font-medium">Payment History</span>
          </div>

          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Payment History</h1>
              <p className="mt-2 text-gray-600">
                {staff ? `${staff.fullName} (${staff.employeeId})` : 'Your salary and payment records'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <button
                onClick={fetchPaymentHistory}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              <a
                href="/staff-dashboard"
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back to Dashboard
              </a>
            </div>
          </div>

          {/* YTD Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Net Pay YTD
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(calculateYTD())}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Gross Pay YTD
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(calculateGrossPay())}
                      </dd>
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
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Deductions YTD
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(calculateTotalDeductions())}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pay Periods
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {payments.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Payment Records for {selectedYear}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Complete salary payment history and details
              </p>
            </div>
            
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payment records found</h3>
                <p className="text-gray-500 mb-6">
                  No payment records available for {selectedYear}. Try selecting a different year.
                </p>
                <button
                  onClick={fetchPaymentHistory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pay Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gross Pay
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deductions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net Pay
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pay Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.paymentPeriod?.month}/{payment.paymentPeriod?.year}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(0, (payment.paymentPeriod?.month || 1) - 1).toLocaleString('default', { month: 'long' })} {payment.paymentPeriod?.year}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(payment.grossPay || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(payment.totalDeductions || 0)}
                          </div>
                          {payment.deductions && (
                            <div className="text-xs text-gray-500">
                              {Object.entries(payment.deductions)
                                .filter(([key, value]) => value > 0)
                                .map(([key]) => key.toUpperCase())
                                .join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">
                            {formatCurrency(payment.netPay || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(payment.status || 'pending')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {payment.paymentDate ? formatDate(payment.paymentDate) : 'Pending'}
                          </div>
                        </td>
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
