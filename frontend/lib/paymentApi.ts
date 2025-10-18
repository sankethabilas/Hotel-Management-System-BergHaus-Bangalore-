const API_BASE_URL = 'http://localhost:5000/api/payments';

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
  private getAuthHeaders(): Record<string, string> {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return {};
    }
    
    // Try both token storage keys (staff and regular user)
    const token = localStorage.getItem('token') || localStorage.getItem('staffToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request(url: string, options: RequestInit = {}): Promise<any> {
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 second timeout
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, config);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP error! status: ${response.status}` };
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle empty responses
      const text = await response.text();
      if (!text) {
        return {};
      }
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response text:', text);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - server took too long to respond');
      }
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

    const url = `${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(url);
  }

  // Get payment by ID
  async getPaymentById(id: string): Promise<{
    success: boolean;
    payment: Payment;
  }> {
    return this.request(`/${id}`);
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

    const url = `/staff/${staffId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(url);
  }

  // Create new payment
  async createPayment(paymentData: CreatePaymentData): Promise<{
    success: boolean;
    message: string;
    payment: Payment;
  }> {
    return this.request('', {
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
    return this.request(`/${id}`, {
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
    return this.request(`/${id}/status`, {
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
    const url = `/stats${year ? `?year=${year}` : ''}`;
    return this.request(url);
  }

  // Delete payment
  async deletePayment(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/${id}`, {
      method: 'DELETE',
    });
  }

  // Generate payment report
  async generatePaymentReport(format: 'pdf' | 'excel' = 'pdf', filters?: {
    year?: number;
    month?: number;
    status?: string;
  }): Promise<void> {
    const params = new URLSearchParams();
    params.append('format', format);
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.status) params.append('status', filters.status);
    
    const url = `${API_BASE_URL}/report?${params.toString()}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `payment-report-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;

      // Create blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Report generation failed:', error);
      throw error;
    }
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