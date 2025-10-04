'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  Mail,
  Calendar,
  RefreshCw,
  Loader2,
  Download,
  Filter
} from 'lucide-react';

interface AnalyticsData {
  totalMessages: number;
  unreadMessages: number;
  resolvedMessages: number;
  urgentMessages: number;
  averageResponseTime: number;
  messagesByStatus: Array<{ status: string; count: number }>;
  messagesByPriority: Array<{ priority: string; count: number }>;
  messagesByReason: Array<{ reason: string; count: number }>;
  messagesByDay: Array<{ date: string; count: number }>;
  responseTimeTrend: Array<{ date: string; avgTime: number }>;
}

const CRMAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7'); // days
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Load analytics data
  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/contact/analytics?days=${dateRange}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Export analytics as PDF
  const exportAnalyticsPDF = async () => {
    try {
      setIsExporting(true);
      
      const response = await fetch(`http://localhost:5000/api/contact/export/analytics/pdf?days=${dateRange}`);
      
      if (response.ok) {
        const html = await response.text();
        
        // Create a blob and download it
        const blob = new Blob([html], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crm-analytics-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Export Successful",
          description: "CRM analytics report has been downloaded",
          variant: "default"
        });
      } else {
        throw new Error('Failed to export PDF');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export analytics PDF",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Load analytics on component mount and when date range changes
  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  // Color schemes for charts
  const statusColors = {
    'new': '#3B82F6',
    'in-progress': '#F59E0B',
    'resolved': '#10B981',
    'closed': '#6B7280'
  };

  const priorityColors = {
    'urgent': '#EF4444',
    'high': '#F97316',
    'medium': '#F59E0B',
    'low': '#10B981'
  };

  const reasonColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Export analytics data
  const exportData = () => {
    if (!analytics) return;
    
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Messages', analytics.totalMessages],
      ['Unread Messages', analytics.unreadMessages],
      ['Resolved Messages', analytics.resolvedMessages],
      ['Urgent Messages', analytics.urgentMessages],
      ['Average Response Time (hours)', analytics.averageResponseTime],
      ['', ''],
      ['Status Breakdown', ''],
      ...analytics.messagesByStatus.map(item => [item.status, item.count]),
      ['', ''],
      ['Priority Breakdown', ''],
      ...analytics.messagesByPriority.map(item => [item.priority, item.count]),
      ['', ''],
      ['Reason Breakdown', ''],
      ...analytics.messagesByReason.map(item => [item.reason, item.count])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No analytics data available</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📊 CRM Analytics
              </h1>
              <p className="text-gray-600">
                Insights into customer relationship management performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <Button onClick={loadAnalytics} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              
              <Button 
                onClick={exportAnalyticsPDF} 
                disabled={isExporting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.unreadMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolved Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.resolvedMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Urgent Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.urgentMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Response Time Metric */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Average Response Time</h3>
                <p className="text-3xl font-bold text-blue-600">{analytics.averageResponseTime.toFixed(1)} hours</p>
                <p className="text-sm text-gray-600">Time to respond to guest inquiries</p>
              </div>
              <div className="p-4 bg-blue-100 rounded-full">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Messages by Status */}
          <Card>
            <CardHeader>
              <CardTitle>Messages by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.messagesByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Messages by Priority */}
          <Card>
            <CardHeader>
              <CardTitle>Messages by Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.messagesByPriority}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ priority, count }) => `${priority}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.messagesByPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={priorityColors[entry.priority as keyof typeof priorityColors] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Messages by Reason and Daily Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Messages by Reason */}
          <Card>
            <CardHeader>
              <CardTitle>Messages by Reason</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.messagesByReason.map((item, index) => (
                  <div key={item.reason} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: reasonColors[index % reasonColors.length] }}
                      />
                      <span className="capitalize">{item.reason}</span>
                    </div>
                    <Badge variant="outline">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Messages Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Messages Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.messagesByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Response Time Trend */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Response Time Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.responseTimeTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avgTime" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Summary Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Response Rate</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {((analytics.resolvedMessages / analytics.totalMessages) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-blue-700">Messages resolved</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Efficiency</h4>
                <p className="text-2xl font-bold text-green-600">
                  {analytics.averageResponseTime < 24 ? 'Excellent' : 
                   analytics.averageResponseTime < 48 ? 'Good' : 'Needs Improvement'}
                </p>
                <p className="text-sm text-green-700">Response time rating</p>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Urgency Level</h4>
                <p className="text-2xl font-bold text-yellow-600">
                  {((analytics.urgentMessages / analytics.totalMessages) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-yellow-700">Urgent messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CRMAnalyticsPage;
