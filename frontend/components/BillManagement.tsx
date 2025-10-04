'use client';

import React, { useState, useEffect } from 'react';

interface Bill {
  _id: string;
  billNumber: string;
  orderNumber: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    roomNumber?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  pricing: {
    subtotal: number;
    serviceCharge: number;
    vat: number;
    discount: number;
    total: number;
  };
  paymentMethod: string;
  status: 'generated' | 'paid' | 'refunded' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

interface BillManagementProps {
  onClose?: () => void;
}

const BillManagement: React.FC<BillManagementProps> = ({ onClose }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/bills');
      const data = await response.json();
      
      if (data.success && data.data) {
        setBills(data.data.bills || data.data);
      } else {
        setError('Failed to load bills');
      }
    } catch (error: any) {
      console.error('Error loading bills:', error);
      setError('Failed to load bills');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBill = async (billId: string, billNumber: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bills/pdf/${billId}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bill-${billNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        setSuccess('Bill downloaded successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to download bill');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error: any) {
      console.error('Error downloading bill:', error);
      setError('Failed to download bill');
      setTimeout(() => setError(''), 3000);
    }
  };

  const updateBillStatus = async (billId: string, status: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bills/${billId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Bill status updated successfully!');
        await loadBills();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update bill status');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error: any) {
      console.error('Error updating bill status:', error);
      setError('Failed to update bill status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'refunded': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generated': return '📄';
      case 'paid': return '✅';
      case 'refunded': return '🔄';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toFixed(2)}`;
  };

  const filteredBills = bills.filter(bill => {
    const matchesStatus = filterStatus === 'all' || bill.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bill Management</h2>
          <p className="text-gray-600">Manage and track customer bills</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200"
          >
            Close
          </button>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <span className="mr-2">✅</span>
            {success}
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <span className="mr-2">❌</span>
            {error}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search bills by number, order, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="generated">Generated</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bills...</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <span className="mr-2">📄</span>
                        {bill.billNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bill.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{bill.customerInfo.name}</div>
                        <div className="text-gray-500">{bill.customerInfo.email}</div>
                        <div className="text-gray-500">📞 {bill.customerInfo.phone}</div>
                        {bill.customerInfo.roomNumber && (
                          <div className="text-gray-500">🏠 Room: {bill.customerInfo.roomNumber}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="text-right">
                        <div className="text-lg font-bold">{formatCurrency(bill.pricing.total)}</div>
                        <div className="text-xs text-gray-500">
                          {formatCurrency(bill.pricing.subtotal)} + {formatCurrency(bill.pricing.serviceCharge)} + {formatCurrency(bill.pricing.vat)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                        <span className="mr-1">{getStatusIcon(bill.status)}</span>
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>{new Date(bill.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs">{new Date(bill.createdAt).toLocaleTimeString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => downloadBill(bill._id, bill.billNumber)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        title="Download PDF"
                      >
                        📥 Download
                      </button>
                      <select
                        value={bill.status}
                        onChange={(e) => updateBillStatus(bill._id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="generated">📄 Generated</option>
                        <option value="paid">✅ Paid</option>
                        <option value="refunded">🔄 Refunded</option>
                        <option value="cancelled">❌ Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredBills.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'No bills match your search criteria.'
                  : 'Bills will appear here when generated.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Statistics */}
      {bills.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📄</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{bills.length}</div>
                <div className="text-sm text-gray-500">Total Bills</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="text-2xl mr-3">✅</div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {bills.filter(b => b.status === 'paid').length}
                </div>
                <div className="text-sm text-gray-500">Paid</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📄</div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {bills.filter(b => b.status === 'generated').length}
                </div>
                <div className="text-sm text-gray-500">Generated</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="text-2xl mr-3">💰</div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(bills.reduce((sum, bill) => sum + bill.pricing.total, 0))}
                </div>
                <div className="text-sm text-gray-500">Total Revenue</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillManagement;
