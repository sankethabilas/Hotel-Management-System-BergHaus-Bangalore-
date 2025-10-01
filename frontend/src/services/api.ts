// API Configuration - Express.js Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

// API Service Class
class ApiService {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = API_BASE_URL
    // Try to get token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  // Clear authentication token
  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  // Generic fetch wrapper with error handling
  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    console.log(`🌐 API: Making request to ${url}`);
    console.log(`🌐 API: Request body:`, options.body);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    // Add authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()
      console.log(`🌐 API: Response from ${endpoint}:`, {
        status: response.status,
        ok: response.ok,
        data
      });

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`🔥 API Error - ${endpoint}:`, error)
      throw error
    }
  }

  // Auth API methods
  async login(credentials: { username: string; password: string }) {
    const response = await this.fetchWithAuth('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    if (response.success && response.data?.token) {
      this.setToken(response.data.token)
    }

    return response
  }

  async setupAdmin(adminData: {
    username: string
    password: string
    email: string
    fullName: string
  }) {
    const response = await this.fetchWithAuth('/admin/register', {
      method: 'POST',
      body: JSON.stringify(adminData),
    })

    if (response.success && response.data?.token) {
      this.setToken(response.data.token)
    }

    return response
  }

  async getProfile() {
    return this.fetchWithAuth('/admin/profile')
  }

  async logout() {
    this.clearToken()
    // Note: Server doesn't need logout call since JWT is stateless
    return { success: true }
  }

  // Menu API methods
  async getMenuItems(params?: {
    category?: string
    isAvailable?: boolean
    search?: string
    sort?: string
  }) {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
    }

    const queryString = searchParams.toString()
    const endpoint = `/menu${queryString ? `?${queryString}` : ''}`
    
    return this.fetchWithAuth(endpoint)
  }

  async getMenuItemById(id: string) {
    return this.fetchWithAuth(`/menu/${id}`)
  }

  async createMenuItem(menuItem: {
    name: string
    description: string
    price: number
    category: string
    preparationTime: number
    isVegetarian?: boolean
    isVegan?: boolean
    isGlutenFree?: boolean
    spiceLevel?: string
    ingredients?: string[]
    allergens?: string[]
    tags?: string[]
    calories?: number
    isPopular?: boolean
    discount?: number
  }) {
    return this.fetchWithAuth('/menu', {
      method: 'POST',
      body: JSON.stringify(menuItem),
    })
  }

  async updateMenuItem(id: string, menuItem: Partial<any>) {
    return this.fetchWithAuth(`/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(menuItem),
    })
  }

  async deleteMenuItem(id: string) {
    return this.fetchWithAuth(`/menu/${id}`, {
      method: 'DELETE',
    })
  }

  async toggleMenuItemAvailability(id: string) {
    return this.fetchWithAuth(`/menu/${id}/toggle-availability`, {
      method: 'PATCH',
    })
  }
}

// Create and export singleton instance
const apiService = new ApiService()
export default apiService

// Export types for TypeScript
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  count?: number
  token?: string
  admin?: any
}

export interface MenuItem {
  _id: string
  name: string
  description: string
  price: number
  category: 'starters' | 'mains' | 'desserts' | 'beverages' | 'specials'
  isAvailable: boolean
  image?: string
  ingredients: string[]
  allergens: string[]
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  spiceLevel: 'none' | 'mild' | 'medium' | 'hot' | 'very-hot'
  preparationTime: number
  calories?: number
  isPopular: boolean
  discount?: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface AdminUser {
  _id: string
  username: string
  email: string
  fullName: string
  role: 'admin' | 'manager' | 'kitchen'
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}
