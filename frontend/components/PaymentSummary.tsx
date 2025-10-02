'use client';

import React, { useState, useEffect } from 'react';

interface PaymentData {
  currentMonth: {
    basicSalary: number;
    overtime: number;
    bonus: number;
    deductions: number;
    total: number;
  };
  lastSalaryDate: string;
  nextSalaryDate: string;
  ytdEarnings: number;
  pendingOvertime: number;
}

interface PaymentSummaryProps {
  staffId: string;
}

export default function PaymentSummary({ staffId }: PaymentSummaryProps) {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock payment data - replace with actual API call
    const mockPaymentData: PaymentData = {
      currentMonth: {
        basicSalary: 75000,
        overtime: 5000,
        bonus: 2000,
        deductions: 1500,
        total: 80500
      },
      lastSalaryDate: '2025-09-25T12:00:00Z',
      nextSalaryDate: '2025-10-25T12:00:00Z',
      ytdEarnings: 850000,
      pendingOvertime: 12.5
    };

    // Simulate loading
    setTimeout(() => {
      setPaymentData(mockPaymentData);
      setLoading(false);
    }, 500);
  }, [staffId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysUntilNextSalary = () => {
    const now = new Date();
    const nextSalary = new Date(paymentData?.nextSalaryDate || '');
    const diffTime = nextSalary.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              <div className="h-3 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-400 text-4xl mb-2">💳</div>
        <p className="text-gray-500">Unable to load payment data.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Current Month Summary */}
      <div className="mb-6">
        <div className="text-center mb-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-1">September 2025</h4>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(paymentData.currentMonth.total)}
          </div>
          <p className="text-sm text-gray-500">Total Earnings</p>
        </div>

        {/* Breakdown */}
        <div className="space-y-3 bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Basic Salary</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(paymentData.currentMonth.basicSalary)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Overtime</span>
            <span className="font-medium text-green-600">
              +{formatCurrency(paymentData.currentMonth.overtime)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Bonus</span>
            <span className="font-medium text-green-600">
              +{formatCurrency(paymentData.currentMonth.bonus)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Deductions</span>
            <span className="font-medium text-red-600">
              -{formatCurrency(paymentData.currentMonth.deductions)}
            </span>
          </div>
          <hr className="border-gray-200" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-900">Net Pay</span>
            <span className="font-bold text-gray-900">
              {formatCurrency(paymentData.currentMonth.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div>
            <p className="text-sm font-medium text-blue-900">Last Salary Paid</p>
            <p className="text-xs text-blue-700">
              {formatDate(paymentData.lastSalaryDate)}
            </p>
          </div>
          <div className="text-blue-600 text-2xl">💰</div>
        </div>

        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
          <div>
            <p className="text-sm font-medium text-green-900">Next Salary</p>
            <p className="text-xs text-green-700">
              in {getDaysUntilNextSalary()} days ({formatDate(paymentData.nextSalaryDate)})
            </p>
          </div>
          <div className="text-green-600 text-2xl">📅</div>
        </div>

        {paymentData.pendingOvertime > 0 && (
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div>
              <p className="text-sm font-medium text-yellow-900">Pending Overtime</p>
              <p className="text-xs text-yellow-700">
                {paymentData.pendingOvertime} hours to be paid
              </p>
            </div>
            <div className="text-yellow-600 text-2xl">⏰</div>
          </div>
        )}
      </div>

      {/* YTD Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Year to Date Earnings</p>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(paymentData.ytdEarnings)}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6">
        <button
          onClick={() => window.location.href = `/payment-history/${staffId}`}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
        >
          View Full Payment History
        </button>
      </div>
    </div>
  );
}