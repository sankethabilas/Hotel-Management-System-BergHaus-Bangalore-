'use client';

import { useState, useEffect } from 'react';
import { paymentAPI, Payment, CreatePaymentData } from '@/lib/paymentApi';
import { staffAPI } from '@/lib/staffApi';
import { Staff } from '@/types/staff';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear, selectedStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch payments with filters
      const paymentsData = await paymentAPI.getAllPayments({
        month: selectedMonth || undefined,
        year: selectedYear,
        status: selectedStatus || undefined,
        limit: 100
      });
      setPayments(paymentsData.payments);

      // Fetch staff list
      const staffData = await staffAPI.getAllStaff();
      setStaff(staffData.filter((s: Staff) => s.isActive));

      // Fetch stats
      const statsData = await paymentAPI.getPaymentStats(selectedYear);
      setStats(statsData);

    } catch (error) {
      console.error('Failed to fetch payment data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (paymentId: string, status: string) => {
    try {
      await paymentAPI.updatePaymentStatus(paymentId, status);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to update payment status:', error);
      alert('Failed to update payment status');
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

  const monthOptions = [
    { value: '', label: 'All Months' },
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= currentYear - 5; year--) {
    yearOptions.push(year);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Staff Payments Management</h1>
          <p className="text-sm text-gray-600">Process and manage staff salary payments</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            style={{ backgroundColor: '#006bb8' }}
          >
            Create Payment
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="admin-card p-4">
            <div className="text-xs font-medium text-gray-600">Total Payments</div>
            <div className="mt-1 text-2xl font-semibold" style={{ color: '#006bb8' }}>
              {stats.overallStats.totalPayments || 0}
            </div>
            <div className="text-xs text-gray-500">{selectedYear}</div>
          </div>
          
          <div className="admin-card p-4">
            <div className="text-xs font-medium text-gray-600">Total Amount</div>
            <div className="mt-1 text-2xl font-semibold text-green-600">
              {paymentAPI.formatCurrency(stats.overallStats.totalAmount || 0)}
            </div>
            <div className="text-xs text-gray-500">Paid out</div>
          </div>
          
          <div className="admin-card p-4">
            <div className="text-xs font-medium text-gray-600">Average Payment</div>
            <div className="mt-1 text-2xl font-semibold" style={{ color: '#2fa0df' }}>
              {paymentAPI.formatCurrency(stats.overallStats.avgPayment || 0)}
            </div>
            <div className="text-xs text-gray-500">Per employee</div>
          </div>
          
          <div className="admin-card p-4">
            <div className="text-xs font-medium text-gray-600">Pending</div>
            <div className="mt-1 text-2xl font-semibold text-yellow-600">
              {payments.filter(p => p.status === 'pending').length}
            </div>
            <div className="text-xs text-gray-500">Awaiting payment</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="admin-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Month:</label>
            <select
              value={selectedMonth || ''}
              onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : 0)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              {monthOptions.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Payments Table */}
      <div className="admin-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Payment Records</h3>
        </div>

        {payments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">💰</div>
            <p className="text-gray-500">No payment records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{payment.staffName}</div>
                        <div className="text-xs text-gray-500">{payment.employeeId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {paymentAPI.formatPaymentPeriod(payment.paymentPeriod.month, payment.paymentPeriod.year)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {paymentAPI.formatCurrency(payment.grossPay)}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      {payment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(payment._id, 'processing')}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Process
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(payment._id, 'paid')}
                            className="text-green-600 hover:text-green-800"
                          >
                            Mark Paid
                          </button>
                        </>
                      )}
                      {payment.status === 'processing' && (
                        <button
                          onClick={() => handleStatusUpdate(payment._id, 'paid')}
                          className="text-green-600 hover:text-green-800"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button className="text-blue-600 hover:text-blue-800">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Payment Modal */}
      {showCreateModal && (
        <CreatePaymentModal
          staff={staff}
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchData}
        />
      )}
    </div>
  );
}

// Create Payment Modal Component
interface CreatePaymentModalProps {
  staff: Staff[];
  onClose: () => void;
  onCreated: () => void;
}

function CreatePaymentModal({ staff, onClose, onCreated }: CreatePaymentModalProps) {
  const [formData, setFormData] = useState<CreatePaymentData>({
    staffId: '',
    paymentPeriod: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    },
    overtimeHours: 0,
    bonuses: 0,
    deductions: {
      epf: 0,
      etf: 0,
      tax: 0,
      advances: 0,
      other: 0
    },
    paymentMethod: 'bank_transfer',
    processedBy: 'Admin'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await paymentAPI.createPayment(formData);
      onCreated();
      onClose();
    } catch (error) {
      console.error('Failed to create payment:', error);
      alert('Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Create New Payment</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Staff Member
              </label>
              <select
                value={formData.staffId}
                onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Staff</option>
                {staff.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.fullName} ({member.employeeId})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Period
              </label>
              <div className="flex space-x-2">
                <select
                  value={formData.paymentPeriod.month}
                  onChange={(e) => setFormData({
                    ...formData,
                    paymentPeriod: {...formData.paymentPeriod, month: parseInt(e.target.value)}
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={i+1}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select
                  value={formData.paymentPeriod.year}
                  onChange={(e) => setFormData({
                    ...formData,
                    paymentPeriod: {...formData.paymentPeriod, year: parseInt(e.target.value)}
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                >
                  {[...Array(5)].map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overtime Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.overtimeHours}
                onChange={(e) => setFormData({...formData, overtimeHours: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bonuses (Rs.)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.bonuses}
                onChange={(e) => setFormData({...formData, bonuses: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deductions
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">EPF (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.deductions?.epf || 0}
                  onChange={(e) => setFormData({
                    ...formData,
                    deductions: {...formData.deductions, epf: parseFloat(e.target.value) || 0}
                  })}
                  className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">ETF (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.deductions?.etf || 0}
                  onChange={(e) => setFormData({
                    ...formData,
                    deductions: {...formData.deductions, etf: parseFloat(e.target.value) || 0}
                  })}
                  className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Tax (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.deductions?.tax || 0}
                  onChange={(e) => setFormData({
                    ...formData,
                    deductions: {...formData.deductions, tax: parseFloat(e.target.value) || 0}
                  })}
                  className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Other (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.deductions?.other || 0}
                  onChange={(e) => setFormData({
                    ...formData,
                    deductions: {...formData.deductions, other: parseFloat(e.target.value) || 0}
                  })}
                  className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              style={{ backgroundColor: loading ? '#9CA3AF' : '#006bb8' }}
            >
              {loading ? 'Creating...' : 'Create Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


