const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Payment {
  _id: string;
  staffId: string;
  employeeId: string;
  staffName: string;
  paymentPeriod: {
    month: number;
    year: number;
  };
  baseSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimePay: number;
  bonuses: number;
  deductions: {
    epf: number;
    etf: number;
    tax: number;
    advances: number;
    other: number;
  };
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  paymentDate: string;
  paymentMethod: 'bank_transfer' | 'cash' | 'cheque';
  status: 'pending' | 'processing' | 'paid' | 'failed';
  bankDetails?: {
    accountNumber?: string;
    bankName?: string;
    branchName?: string;
  };
  remarks: string;
  processedBy: string;
  payslipGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSummary {
  totalStaff: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  paidPayments: number;
  pendingPayments: number;
}

export interface CreatePaymentData {
  staffId: string;
  paymentPeriod: {
    month: number;
    year: number;
  };
  overtimeHours?: number;
  bonuses?: number;
  deductions?: {
    epf?: number;
    etf?: number;
    tax?: number;
    advances?: number;
    other?: number;
  };
  paymentMethod?: 'bank_transfer' | 'cash' | 'cheque';
  bankDetails?: {
    accountNumber?: string;
    bankName?: string;
    branchName?: string;
  };
  remarks?: string;
  processedBy: string;
}

class PaymentAPI {
  private async request(url: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Get all payments with filters
  async getAllPayments(params?: {
    month?: number;
    year?: number;
    status?: string;
    staffId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    payments: Payment[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.month) queryParams.append('month', params.month.toString());
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.staffId) queryParams.append('staffId', params.staffId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/api/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(url);
  }

  // Get payment by ID
  async getPaymentById(id: string): Promise<{
    success: boolean;
    payment: Payment;
  }> {
    return this.request(`/api/payments/${id}`);
  }

  // Get payments by staff ID
  async getPaymentsByStaff(staffId: string, params?: {
    year?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    staff: any;
    payments: Payment[];
  }> {
    const queryParams = new URLSearchParams();
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/api/payments/staff/${staffId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(url);
  }

  // Create new payment
  async createPayment(paymentData: CreatePaymentData): Promise<{
    success: boolean;
    message: string;
    payment: Payment;
  }> {
    return this.request('/api/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // Update payment
  async updatePayment(id: string, updateData: Partial<Payment>): Promise<{
    success: boolean;
    message: string;
    payment: Payment;
  }> {
    return this.request(`/api/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Update payment status
  async updatePaymentStatus(id: string, status: string, remarks?: string): Promise<{
    success: boolean;
    message: string;
    payment: Payment;
  }> {
    return this.request(`/api/payments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remarks }),
    });
  }

  // Get payment statistics
  async getPaymentStats(year?: number): Promise<{
    success: boolean;
    year: number;
    monthlyStats: Array<{
      _id: number;
      totalStaff: number;
      totalGrossPay: number;
      totalNetPay: number;
      totalDeductions: number;
      paidCount: number;
      pendingCount: number;
    }>;
    overallStats: {
      totalPayments: number;
      totalAmount: number;
      avgPayment: number;
      maxPayment: number;
      minPayment: number;
    };
  }> {
    const url = `/api/payments/stats${year ? `?year=${year}` : ''}`;
    return this.request(url);
  }

  // Delete payment
  async deletePayment(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/api/payments/${id}`, {
      method: 'DELETE',
    });
  }

  // Helper methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatPaymentPeriod(month: number, year: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[month - 1]} ${year}`;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  getPaymentMethodLabel(method: string): string {
    switch (method) {
      case 'bank_transfer': return 'Bank Transfer';
      case 'cash': return 'Cash';
      case 'cheque': return 'Cheque';
      default: return method;
    }
  }
}

export const paymentAPI = new PaymentAPI();