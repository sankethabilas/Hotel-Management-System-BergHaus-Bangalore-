const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface AttendanceRecord {
  _id: string;
  staffId: string;
  staffName: string;
  staffEmail: string;
  department: string;
  checkInTime: string;
  checkOutTime?: string;
  date: string;
  status: 'present' | 'late' | 'absent' | 'half-day';
  workingHours: number;
  location: string;
  qrCodeId: string;
  notes?: string;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  late: number;
  checkedOut: number;
  stillWorking: number;
}

export interface TodayAttendanceResponse {
  success: boolean;
  date: string;
  summary: AttendanceSummary;
  attendance: AttendanceRecord[];
}

export interface AttendanceStatsResponse {
  success: boolean;
  stats: Array<{
    _id: string;
    totalDays: number;
    presentDays: number;
    lateDays: number;
    totalHours: number;
    avgHours: number;
    staff: Array<{
      name: string;
      email: string;
      department: string;
    }>;
  }>;
}

class AttendanceAPI {
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

  // Generate QR Code for attendance
  async generateQRCode(): Promise<{
    success: boolean;
    qrCode: string;
    qrId: string;
    message: string;
    expiresIn: string;
  }> {
    return this.request('/api/attendance/qr/generate');
  }

  // Mark attendance via QR code scan
  async markAttendance(qrId: string, staffId: string, action: 'checkin' | 'checkout'): Promise<{
    success: boolean;
    message: string;
    attendance: AttendanceRecord;
    status?: string;
    workingHours?: number;
  }> {
    return this.request(`/api/attendance/scan/${qrId}`, {
      method: 'POST',
      body: JSON.stringify({ staffId, action }),
    });
  }

  // Get all attendance records
  async getAllAttendance(params?: {
    date?: string;
    staffId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    attendance: AttendanceRecord[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    if (params?.staffId) queryParams.append('staffId', params.staffId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/api/attendance/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(url);
  }

  // Get today's attendance
  async getTodayAttendance(): Promise<TodayAttendanceResponse> {
    return this.request('/api/attendance/today');
  }

  // Get attendance statistics
  async getAttendanceStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<AttendanceStatsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const url = `/api/attendance/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(url);
  }

  // Get attendance by staff ID
  async getStaffAttendance(staffId: string, params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    success: boolean;
    attendance: AttendanceRecord[];
  }> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const url = `/api/attendance/staff/${staffId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(url);
  }

  // Helper method to format working hours
  formatWorkingHours(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  }

  // Helper method to get status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100';
      case 'late': return 'text-yellow-600 bg-yellow-100';
      case 'absent': return 'text-red-600 bg-red-100';
      case 'half-day': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  // Helper method to calculate attendance percentage
  calculateAttendancePercentage(present: number, total: number): number {
    return total > 0 ? Math.round((present / total) * 100) : 0;
  }
}

export const attendanceAPI = new AttendanceAPI();