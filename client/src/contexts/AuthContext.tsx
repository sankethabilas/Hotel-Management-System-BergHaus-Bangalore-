'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import apiService, { AdminUser } from '../services/api'

interface AuthContextType {
  user: AdminUser | null
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
  setupAdmin: (adminData: {
    username: string
    password: string
    email: string
    fullName: string
  }) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (token) {
          apiService.setToken(token)
          const response = await apiService.getProfile()
          
          if (response.success) {
            setUser(response.data)
          } else {
            // Token is invalid, clear it
            apiService.clearToken()
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        apiService.clearToken()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Starting login process for:', username);
      setIsLoading(true)
      
      const response = await apiService.login({ username, password })
      console.log('🔐 AuthContext: Login response:', response);
      
      if (response.success) {
        console.log('✅ AuthContext: Login successful, setting user:', response.data?.admin);
        setUser(response.data?.admin || response.admin)
        return { success: true }
      } else {
        console.log('❌ AuthContext: Login failed:', response.message);
        return { success: false, message: response.message || 'Login failed' }
      }
    } catch (error) {
      console.error('🔥 AuthContext: Login error:', error);
      const message = error instanceof Error ? error.message : 'Login failed'
      return { success: false, message }
    } finally {
      setIsLoading(false)
    }
  }

  const setupAdmin = async (adminData: {
    username: string
    password: string
    email: string
    fullName: string
  }) => {
    try {
      console.log('🛠️ AuthContext: Starting admin setup for:', adminData.email);
      setIsLoading(true)
      
      const response = await apiService.setupAdmin(adminData)
      console.log('🛠️ AuthContext: Setup response:', response);
      
      if (response.success) {
        console.log('✅ AuthContext: Setup successful, setting user:', response.data?.admin);
        setUser(response.data?.admin || response.admin)
        return { success: true }
      } else {
        console.log('❌ AuthContext: Setup failed:', response.message);
        return { success: false, message: response.message || 'Setup failed' }
      }
    } catch (error) {
      console.error('🔥 AuthContext: Setup error:', error);
      const message = error instanceof Error ? error.message : 'Setup failed'
      return { success: false, message }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    apiService.logout()
    setUser(null)
  }

  const refreshProfile = async () => {
    try {
      if (user) {
        const response = await apiService.getProfile()
        if (response.success) {
          setUser(response.data)
        }
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error)
      logout()
    }
  }

  const value: AuthContextType = {
    user,
    login,
    setupAdmin,
    logout,
    isLoading,
    isAuthenticated: !!user,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
