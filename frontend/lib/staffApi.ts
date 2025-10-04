import { Staff, StaffFormData, ApiResponse } from '@/types/staff';
import { safeJsonParse, getErrorMessage } from './safeJsonParse';

const API_BASE_URL = 'http://localhost:5000/api/staff';

class StaffAPI {
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
        const errorData = await safeJsonParse(response);
        console.error('API Error Response:', errorData);
        
        // Handle validation errors specifically
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const validationErrors = errorData.errors.map((err: any) => err.msg || err.message).join(', ');
          throw new Error(`Validation failed: ${validationErrors}`);
        }
        
        throw new Error(getErrorMessage(errorData) || `HTTP error! status: ${response.status}`);
      }

      // Parse response safely
      const data = await safeJsonParse(response);
      return data as T;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - server took too long to respond');
      }
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Get all staff (admin only)
  async getAllStaff(): Promise<Staff[]> {
    const response = await this.request<{success: boolean, staff: Staff[]}>('/');
    return response.staff || [];
  }

  // Get active staff (public - for attendance scanner)
  async getActiveStaff(): Promise<Staff[]> {
    const response = await this.request<{success: boolean, staff: Staff[]}>('/active');
    return response.staff || [];
  }

  // Get staff by ID
  async getStaffById(id: string): Promise<Staff> {
    const response = await this.request<{success: boolean, staff: Staff}>(`/${id}`);
    return response.staff!;
  }

  // Create new staff
  async createStaff(staffData: StaffFormData): Promise<Staff> {
    const response = await this.request<{success: boolean, staff: Staff}>('/', {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
    return response.staff!;
  }

  // Update staff
  async updateStaff(id: string, staffData: StaffFormData): Promise<Staff> {
    const response = await this.request<{success: boolean, staff: Staff}>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staffData),
    });
    return response.staff!;
  }

  // Delete staff
  async deleteStaff(id: string): Promise<Staff> {
    const response = await this.request<ApiResponse<Staff>>(`/${id}`, {
      method: 'DELETE',
    });
    return response.data!;
  }

  // Get staff by employee ID (for employee login)
  async getStaffByEmployeeId(employeeId: string): Promise<Staff> {
    const response = await this.request<ApiResponse<Staff>>(`/employee/${employeeId}`);
    return response.data!;
  }
}

export const staffAPI = new StaffAPI();
