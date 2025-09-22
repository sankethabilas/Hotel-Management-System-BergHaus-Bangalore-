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
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
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
}

export const staffAPI = new StaffAPI();
