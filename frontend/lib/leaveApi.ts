import { Leave, LeaveFormData, ApiResponse } from '@/types/leave';

const API_BASE_URL = 'http://localhost:5000/api/leaves';

class LeaveAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
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
        } catch {
          errorData = { message: `HTTP error! status: ${response.status}` };
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle empty responses
      const text = await response.text();
      if (!text) {
        return {} as T;
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

  // Get all leave requests
  async getAllLeaves(): Promise<ApiResponse<Leave[]>> {
    return this.request<ApiResponse<Leave[]>>('');
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
  async updateLeaveStatus(id: string, status: 'approved' | 'rejected'): Promise<ApiResponse<Leave>> {
    return this.request<ApiResponse<Leave>>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Delete leave request
  async deleteLeave(id: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/${id}`, {
      method: 'DELETE',
    });
  }
}

export const leaveAPI = new LeaveAPI();