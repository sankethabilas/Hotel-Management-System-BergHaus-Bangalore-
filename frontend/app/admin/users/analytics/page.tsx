'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  UserCheck, 
  UserX, 
  Calendar,
  RefreshCw,
  Download
} from 'lucide-react';
import { UserAnalytics } from '@/types';
import { useUserAnalytics } from '@/hooks/useUserManagement';
import LineChartComponent from '@/components/admin/LineChartComponent';

export default function UserAnalyticsPage() {
  const [period, setPeriod] = useState('30d');
  const { analytics, loading, error, refetch } = useUserAnalytics(period);

  const periodOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  const formatChartData = (data: any[]) => {
    return data.map(item => ({
      name: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
      value: item.count
    }));
  };

  const formatTimeSeriesData = (data: any[]) => {
    return data.map(item => ({
      date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
      value: item.count
    }));
  };

  const formatRoleData = (data: any[]) => {
    return data.map(item => ({
      name: item._id,
      value: item.count
    }));
  };

  const exportAnalytics = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/analytics?period=${period}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const csvContent = convertToCSV(data.data);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-analytics-${period}-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
    }
  };

  const convertToCSV = (data: any) => {
    let csv = 'Metric,Value\n';
    
    // User growth data
    if (data.userGrowth) {
      csv += '\nUser Growth by Date\n';
      data.userGrowth.forEach((item: any) => {
        csv += `${item._id.year}-${item._id.month}-${item._id.day},${item.count}\n`;
      });
    }
    
    // Role distribution
    if (data.roleDistribution) {
      csv += '\nRole Distribution\n';
      data.roleDistribution.forEach((item: any) => {
        csv += `${item._id},${item.count}\n`;
      });
    }
    
    // Department distribution
    if (data.departmentDistribution) {
      csv += '\nDepartment Distribution\n';
      data.departmentDistribution.forEach((item: any) => {
        csv += `${item._id},${item.count}\n`;
      });
    }
    
    return csv;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Analytics</h1>
          <p className="text-gray-600">Detailed analytics and insights about users</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Analytics</h1>
          <p className="text-gray-600">Detailed analytics and insights about users</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <BarChart3 className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={refetch} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Analytics</h1>
          <p className="text-gray-600">Detailed analytics and insights about users</p>
        </div>
        <div className="flex space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">{analytics?.activeUsers || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Currently active</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Growth</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.userGrowth?.reduce((sum, item) => sum + item.count, 0) || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">New users in period</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Login Trends</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.loginTrends?.reduce((sum, item) => sum + item.count, 0) || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Login activities</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.departmentDistribution?.length || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Active departments</p>
              </div>
              <div className="p-3 rounded-full bg-orange-50">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Chart */}
      {analytics?.userGrowth && analytics.userGrowth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>User Growth Over Time</CardTitle>
            <CardDescription>New user registrations by date</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChartComponent
              data={formatTimeSeriesData(analytics.userGrowth)}
              title="New Users"
              color="#3b82f6"
              showGradient={true}
              height={300}
            />
          </CardContent>
        </Card>
      )}

      {/* Role Distribution */}
      {analytics?.roleDistribution && analytics.roleDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>User Distribution by Role</CardTitle>
            <CardDescription>Breakdown of users by their assigned roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.roleDistribution.map((role, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="font-medium text-gray-900 capitalize">{role._id}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-semibold text-gray-900">{role.count}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ 
                          width: `${(role.count / Math.max(...analytics.roleDistribution.map(r => r.count))) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Department Distribution */}
      {analytics?.departmentDistribution && analytics.departmentDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Staff Distribution by Department</CardTitle>
            <CardDescription>Breakdown of staff members by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.departmentDistribution.map((dept, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 capitalize">{dept._id}</h3>
                      <p className="text-sm text-gray-600">{dept.count} staff members</p>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{dept.count}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Login Trends */}
      {analytics?.loginTrends && analytics.loginTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Login Activity Trends</CardTitle>
            <CardDescription>User login patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChartComponent
              data={formatTimeSeriesData(analytics.loginTrends)}
              title="Login Activities"
              color="#8b5cf6"
              showGradient={true}
              height={300}
            />
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
          <CardDescription>Key metrics and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Total Active Users</h3>
              <p className="text-2xl font-bold text-blue-600">{analytics?.activeUsers || 0}</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Growth Rate</h3>
              <p className="text-2xl font-bold text-green-600">
                {analytics?.userGrowth?.length ? 
                  `${Math.round((analytics.userGrowth.reduce((sum, item) => sum + item.count, 0) / analytics.userGrowth.length) * 100) / 100}` : 
                  '0'
                } users/day
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Most Active Role</h3>
              <p className="text-lg font-bold text-purple-600">
                {analytics?.roleDistribution?.[0]?._id || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                {analytics?.roleDistribution?.[0]?.count || 0} users
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
