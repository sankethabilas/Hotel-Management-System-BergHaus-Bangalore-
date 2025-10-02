'use client';

import { useState, useEffect } from 'react';
import { paymentAPI, Payment } from '@/lib/paymentApi';

interface StaffPaymentHistoryProps {
  staffId: string;
}

export default function StaffPaymentHistory({ staffId }: StaffPaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    if (staffId) {
      fetchPaymentHistory();
    }
  }, [staffId, selectedYear]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await paymentAPI.getPaymentsByStaff(staffId, {
        year: selectedYear,
        limit: 12
      });

      setPayments(data.payments);
      setStaff(data.staff);
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      setError(error instanceof Error ? error.message : 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = paymentAPI.getStatusColor(status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const calculateYTD = () => {
    return payments.reduce((total, payment) => total + payment.netPay, 0);
  };

  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= currentYear - 5; year--) {
    yearOptions.push(year);
  }

  if (loading) {
    return (
      <div className="admin-card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-card p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchPaymentHistory}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Payment History</h2>
          <p className="text-sm text-gray-600">
            {staff ? `${staff.fullName} (${staff.employeeId})` : 'Your salary and payment records'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            onClick={fetchPaymentHistory}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            style={{ backgroundColor: loading ? '#9CA3AF' : '#006bb8' }}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* YTD Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card p-4">
          <div className="text-xs font-medium text-gray-600">Year to Date</div>
          <div className="mt-1 text-xl font-semibold" style={{ color: '#006bb8' }}>
            {paymentAPI.formatCurrency(calculateYTD())}
          </div>
          <div className="text-xs text-gray-500">{selectedYear} Total</div>
        </div>
        
        <div className="admin-card p-4">
          <div className="text-xs font-medium text-gray-600">Payments</div>
          <div className="mt-1 text-xl font-semibold text-green-600">
            {payments.filter(p => p.status === 'paid').length}
          </div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
        
        <div className="admin-card p-4">
          <div className="text-xs font-medium text-gray-600">Pending</div>
          <div className="mt-1 text-xl font-semibold text-yellow-600">
            {payments.filter(p => p.status === 'pending').length}
          </div>
          <div className="text-xs text-gray-500">Awaiting payment</div>
        </div>
        
        <div className="admin-card p-4">
          <div className="text-xs font-medium text-gray-600">Average</div>
          <div className="mt-1 text-xl font-semibold" style={{ color: '#2fa0df' }}>
            {payments.length > 0 ? paymentAPI.formatCurrency(calculateYTD() / payments.length) : 'Rs. 0.00'}
          </div>
          <div className="text-xs text-gray-500">Per month</div>
        </div>
      </div>

      {/* Payment Records */}
      <div className="admin-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Payment Records - {selectedYear}</h3>
        </div>

        {payments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">📋</div>
            <p className="text-gray-500">No payment records found for {selectedYear}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overtime
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
                    Payment Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {paymentAPI.formatPaymentPeriod(payment.paymentPeriod.month, payment.paymentPeriod.year)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {paymentAPI.formatCurrency(payment.baseSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {paymentAPI.formatCurrency(payment.overtimePay)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {payment.overtimeHours}h × {paymentAPI.formatCurrency(payment.overtimeRate)}/h
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {paymentAPI.formatCurrency(payment.totalDeductions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {paymentAPI.formatCurrency(payment.netPay)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}