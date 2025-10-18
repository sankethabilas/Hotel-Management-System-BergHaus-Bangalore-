const API_BASE_URL = 'http://localhost:5000/api/shifts';

export interface Shift {
  _id: string;
  timeSlot: string;
  startTime: string;
  endTime: string;
  assignedStaff: string[];
  requiredCount: number;
  actualCount: number;
}

export interface DailySchedule {
  _id: string;
  date: string;
  department: string;
  shifts: Shift[];
  status: 'draft' | 'published' | 'completed';
  totalAssigned: number;
  coverageStatus: 'covered' | 'understaffed' | 'overstaffed';
  notes?: string;
  createdBy?: string;
  lastModified: string;
  coveragePercentage: number;
}

export interface DepartmentCoverage {
  department: string;
  date: string;
  availableStaff: number;
  requiredStaff: number;
  isCovered: boolean;
  shortage: number;
  status: 'covered' | 'warning' | 'critical' | 'no-rules';
  staffDetails?: {
    fullName: string;
    employeeId: string;
    isOnLeave: boolean;
    leaveReason?: string;
  }[];
}

export interface StaffOnLeave {
  _id: string;
  staffId: {
    _id: string;
    fullName: string;
    employeeId: string;
    department: string;
  };
  date: string;
  reason: string;
  status: string;
}

export interface DailyCoverageData {
  date: string;
  departments: DepartmentCoverage[];
  staffOnLeave: StaffOnLeave[];
  summary: {
    totalDepartments: number;
    coveredDepartments: number;
    understaffedDepartments: number;
  };
}

class ShiftAPI {
  private getAuthHeaders(): Record<string, string> {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return {};
    }
    
    // Try both token storage keys (staff and regular user)
    const token = localStorage.getItem('token') || localStorage.getItem('staffToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
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
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('API Error Response:', errorData);
        } catch {
          errorData = { message: `HTTP error! status: ${response.status}` };
        }
        
        // Handle validation errors specifically
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const validationErrors = errorData.errors.map((err: any) => err.msg || err.message).join(', ');
          throw new Error(`Validation failed: ${validationErrors}`);
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Get all schedules with filters
  async getAllSchedules(filters?: {
    date?: string;
    department?: string;
    status?: string;
  }): Promise<{
    success: boolean;
    data: DailySchedule[];
  }> {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    return this.request(`/?${queryString}`);
  }

  // Get schedule by ID
  async getScheduleById(id: string): Promise<{
    success: boolean;
    data: DailySchedule;
  }> {
    return this.request(`/${id}`);
  }

  // Generate smart schedule
  async generateSmartSchedule(date: string, department: string): Promise<{
    success: boolean;
    message: string;
    data: DailySchedule;
  }> {
    return this.request('/generate', {
      method: 'POST',
      body: JSON.stringify({ date, department }),
    });
  }

  // Get daily coverage overview
  async getDailyCoverage(date?: string): Promise<{
    success: boolean;
    data: DailyCoverageData;
  }> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    const queryString = params.toString();
    return this.request(`/coverage?${queryString}`);
  }

  // Update schedule assignments
  async updateScheduleAssignments(id: string, shifts: Shift[]): Promise<{
    success: boolean;
    message: string;
    data: DailySchedule;
  }> {
    return this.request(`/${id}/assignments`, {
      method: 'PUT',
      body: JSON.stringify({ shifts }),
    });
  }

  // Publish schedule
  async publishSchedule(id: string): Promise<{
    success: boolean;
    message: string;
    data: DailySchedule;
  }> {
    return this.request(`/${id}/publish`, {
      method: 'PUT',
    });
  }

  // Helper method to format date for API
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Helper method to get status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'covered':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  // Helper method to get coverage icon
  getCoverageIcon(status: string): string {
    switch (status) {
      case 'covered':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'critical':
        return '❌';
      default:
        return '❓';
    }
  }
}

export const shiftAPI = new ShiftAPI();
