import { useState, useEffect } from 'react';
import api from '@/services/api';
import { User, UserStatistics, UserManagementFilters, CreateUserData, UpdateUserStatusData, UserAnalytics, ActivityLog } from '@/types';

// Hook for user statistics
export const useUserStats = () => {
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getUserStats();
      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.message || 'Failed to fetch user statistics');
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};

// Hook for managing users list
export const useUsers = (filters: UserManagementFilters = {}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getAllUsers(filters);
      if (response.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  return { users, loading, error, pagination, refetch: fetchUsers };
};

// Hook for creating users
export const useCreateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = async (userData: CreateUserData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.createUser(userData);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to create user');
        throw new Error(response.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createUser, loading, error, clearError: () => setError(null) };
};

// Hook for updating user status
export const useUpdateUserStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (userId: string, statusData: UpdateUserStatusData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.updateUserStatus(userId, statusData);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to update user status');
        throw new Error(response.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { updateStatus, loading, error, clearError: () => setError(null) };
};

// Hook for deleting users
export const useDeleteUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUser = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.deleteUser(userId);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to delete user');
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { deleteUser, loading, error, clearError: () => setError(null) };
};

// Hook for sending notifications
export const useSendNotification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendNotification = async (notificationData: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.sendNotification(notificationData);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to send notification');
        throw new Error(response.message || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { sendNotification, loading, error, clearError: () => setError(null) };
};

// Hook for user analytics
export const useUserAnalytics = (period: string = '30d') => {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getUserAnalytics(period);
      if (response.success) {
        setAnalytics(response.data);
      } else {
        setError(response.message || 'Failed to fetch user analytics');
      }
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  return { analytics, loading, error, refetch: fetchAnalytics };
};

// Hook for activity logs
export const useActivityLogs = (filters: any = {}) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLogs: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getAllActivityLogs(filters);
      if (response.success) {
        setLogs(response.data.logs);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch activity logs');
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  return { logs, loading, error, pagination, refetch: fetchLogs };
};

// Hook for user activity logs
export const useUserActivityLogs = (userId: string, filters: any = {}) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLogs: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getUserActivityLogs(userId, filters);
      if (response.success) {
        setLogs(response.data.logs);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch user activity logs');
      }
    } catch (error) {
      console.error('Error fetching user activity logs:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchLogs();
    }
  }, [userId, filters]);

  return { logs, loading, error, pagination, refetch: fetchLogs };
};

// Hook for activity statistics
export const useActivityStats = (filters: any = {}) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getActivityStats(filters);
      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.message || 'Failed to fetch activity statistics');
      }
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [filters]);

  return { stats, loading, error, refetch: fetchStats };
};
