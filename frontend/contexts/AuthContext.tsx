'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { usersAPI } from '@/lib/api';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: any) => Promise<boolean>;
  uploadProfilePicture: (file: File) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await AuthService.login({ email, password });
      
      if (result.success && result.user) {
        setUser(result.user);
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        router.push('/');
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: result.message || "Invalid credentials",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An error occurred during login",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await AuthService.register(userData);
      
      if (result.success && result.user) {
        setUser(result.user);
        toast({
          title: "Welcome!",
          description: "Your account has been created successfully.",
        });
        router.push('/');
        return true;
      } else {
        toast({
          title: "Registration Failed",
          description: result.message || "Registration failed",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "An error occurred during registration",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push('/');
  };

  const updateUser = async (userData: any): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await AuthService.updateProfile(userData);
      
      if (result.success && result.user) {
        setUser(result.user);
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
        return true;
      } else {
        toast({
          title: "Update Failed",
          description: result.message || "Failed to update profile",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "An error occurred while updating your profile",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadProfilePicture = async (file: File): Promise<boolean> => {
    if (!user) {
      return false;
    }
    
    try {
      setLoading(true);
      const userId = user._id || (user as any).id;
      const result = await usersAPI.uploadProfilePicture(userId, file);
      
      if (result.success && result.data?.user) {
        // Update user with the complete user object from backend
        setUser(result.data.user);
        toast({
          title: "Profile Picture Updated",
          description: "Your profile picture has been updated successfully.",
        });
        return true;
      } else {
        toast({
          title: "Upload Failed",
          description: result.message || "Failed to upload profile picture",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "An error occurred while uploading your profile picture",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    uploadProfilePicture,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
