import { Leave, LeaveFormData, ApiResponse } from '@/types/leave';
import { safeJsonParse, getErrorMessage } from './safeJsonParse';

const API_BASE_URL = 'http://localhost:5000/api/leaves';

class LeaveAPI {
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
    
    // Determine timeout based on the operation
    const isDeleteOperation = options.method === 'DELETE';
    const timeoutMs = isDeleteOperation ? 30000 : 10000; // 30 seconds for deletes, 10 for others
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(timeoutMs),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await safeJsonParse(response);
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

  // Get all leave requests (admin only)
  async getAllLeaves(): Promise<ApiResponse<Leave[]>> {
    return this.request<ApiResponse<Leave[]>>('');
  }

  // Get my leave requests (staff)
  async getMyLeaves(): Promise<ApiResponse<Leave[]>> {
    // Get current staff ID from localStorage
    if (typeof window !== 'undefined') {
      const staffData = localStorage.getItem('staffData');
      if (staffData) {
        try {
          const parsedStaffData = JSON.parse(staffData);
          const staffId = parsedStaffData.id || parsedStaffData._id;
          if (staffId) {
            return this.request<ApiResponse<Leave[]>>(`/my-requests?staffId=${staffId}`);
          }
        } catch (error) {
          console.error('Error parsing staff data:', error);
        }
      }
    }
    // Fallback to original behavior if no staff ID found
    return this.request<ApiResponse<Leave[]>>('/my-requests');
  }

  // Get leave requests by staff ID
  async getLeavesByStaffId(staffId: string): Promise<ApiResponse<Leave[]>> {
    return this.request<ApiResponse<Leave[]>>(`?staffId=${staffId}`);
  }

  // Get single leave request by ID
  async getLeaveById(id: string): Promise<ApiResponse<Leave>> {
    return this.request<ApiResponse<Leave>>(`/${id}`);
  }

  // Create new leave request
  async createLeave(leaveData: LeaveFormData): Promise<ApiResponse<Leave>> {
    return this.request<ApiResponse<Leave>>('', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
  }

  // Update leave request
  async updateLeave(id: string, leaveData: Partial<LeaveFormData>): Promise<ApiResponse<Leave>> {
    return this.request<ApiResponse<Leave>>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leaveData),
    });
  }

  // Update leave status (for HR approval/rejection)
  async updateLeaveStatus(id: string, status: 'approved' | 'rejected', adminComments?: string): Promise<ApiResponse<Leave>> {
    return this.request<ApiResponse<Leave>>(`/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminComments }),
    });
  }

  // Cancel leave request (staff can cancel their own pending requests)
  async cancelLeave(id: string): Promise<ApiResponse<Leave>> {
    return this.request<ApiResponse<Leave>>(`/${id}/cancel`, {
      method: 'PUT',
    });
  }

  // Get leave statistics (admin only)
  async getLeaveStatistics(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/statistics');
  }

  // Delete leave request
  async deleteLeave(id: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/${id}`, {
      method: 'DELETE',
    });
  }
}

export const leaveAPI = new LeaveAPI();