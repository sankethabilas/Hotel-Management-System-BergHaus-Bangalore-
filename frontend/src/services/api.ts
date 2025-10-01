import { Staff, StaffFormData, ApiResponse } from '@/types/staff';

const API_BASE_URL = 'http://localhost:5000/staff';

class StaffAPI {
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

  // Get all staff
  async getAllStaff(): Promise<Staff[]> {
    const response = await this.request<ApiResponse<Staff[]>>('/');
    return response.staff || [];
  }

  // Get staff by ID
  async getStaffById(id: string): Promise<Staff> {
    const response = await this.request<ApiResponse<Staff>>(`/${id}`);
    return response.staff!;
  }

  // Create new staff
  async createStaff(staffData: StaffFormData): Promise<Staff> {
    const response = await this.request<ApiResponse<Staff>>('/', {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
    return response.staff!;
  }

  // Update staff
  async updateStaff(id: string, staffData: StaffFormData): Promise<Staff> {
    const response = await this.request<ApiResponse<Staff>>(`/${id}`, {
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
    return response.staff!;
  }

  // Get staff by employee ID (for employee login)
  async getStaffByEmployeeId(employeeId: string): Promise<Staff> {
    const response = await this.request<ApiResponse<Staff>>(`/employee/${employeeId}`);
    return response.staff!;
  }
}

export const staffAPI = new StaffAPI();
