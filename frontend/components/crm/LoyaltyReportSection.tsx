'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Filter, TrendingUp, Award, Calendar } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface LoyaltyFilters {
  startDate: string;
  endDate: string;
  tier: string;
  minPoints: string;
  maxPoints: string;
  status: string;
  sortBy: string;
  sortOrder: string;
  limit: string;
}

export default function LoyaltyReportSection() {
  const [filters, setFilters] = useState<LoyaltyFilters>({
    startDate: '',
    endDate: '',
    tier: '',
    minPoints: '',
    maxPoints: '',
    status: '',
    sortBy: 'points',
    sortOrder: 'desc',
    limit: ''
  });

  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axios.get(
        `http://localhost:5000/api/crm-reports/loyalty?${queryParams.toString()}`
        // TEMPORARILY REMOVED AUTH - RE-ENABLE IN PRODUCTION
        // {
        //   headers: {
        //     Authorization: `Bearer ${localStorage.getItem('token')}`
        //   }
        // }
      );

      setReportData(response.data.data);
    } catch (error) {
      console.error('Error fetching loyalty report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof LoyaltyFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axios.get(
        `http://localhost:5000/api/crm-reports/loyalty/export?${queryParams.toString()}`,
        {
          // TEMPORARILY REMOVED AUTH - RE-ENABLE IN PRODUCTION
          // headers: {
          //   Authorization: `Bearer ${localStorage.getItem('token')}`
          // },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `loyalty-report-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      tier: '',
      minPoints: '',
      maxPoints: '',
      status: '',
      sortBy: 'points',
      sortOrder: 'desc',
      limit: ''
    });
  };

  if (isLoading && !reportData) {
    return <div className="text-center py-8">Loading report...</div>;
  }

  // Prepare chart data
  const tierData = reportData?.statistics?.tierDistribution
    ? Object.entries(reportData.statistics.tierDistribution).map(([name, value]) => ({
        name,
        value
      }))
    : [];

  const statusData = reportData?.statistics?.statusDistribution
    ? Object.entries(reportData.statistics.statusDistribution).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
        
        <div className="flex gap-2">
          <Button
            onClick={fetchReport}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            {isLoading ? 'Loading...' : 'Generate Report'}
          </Button>
          <Button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="tier">Tier</Label>
                <Select value={filters.tier || 'all'} onValueChange={(value) => handleFilterChange('tier', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="minPoints">Min Points</Label>
                <Input
                  id="minPoints"
                  type="number"
                  placeholder="Min points"
                  value={filters.minPoints}
                  onChange={(e) => handleFilterChange('minPoints', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="maxPoints">Max Points</Label>
                <Input
                  id="maxPoints"
                  type="number"
                  placeholder="Max points"
                  value={filters.maxPoints}
                  onChange={(e) => handleFilterChange('maxPoints', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sortBy">Sort By</Label>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points">Points</SelectItem>
                    <SelectItem value="createdAt">Join Date</SelectItem>
                    <SelectItem value="guestName">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange('sortOrder', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="limit">Limit Results</Label>
                <Input
                  id="limit"
                  type="number"
                  placeholder="No limit"
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={resetFilters} variant="outline">
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      {reportData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Members</p>
                    <h3 className="text-2xl font-bold mt-1">{reportData.statistics.totalMembers}</h3>
                  </div>
                  <Award className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Points</p>
                    <h3 className="text-2xl font-bold mt-1">{reportData.statistics.totalPoints.toLocaleString()}</h3>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Points</p>
                    <h3 className="text-2xl font-bold mt-1">{reportData.statistics.avgPoints}</h3>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Members</p>
                    <h3 className="text-2xl font-bold mt-1">{reportData.statistics.statusDistribution.active}</h3>
                  </div>
                  <Award className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tier Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Tier Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={tierData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {tierData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Points Trend */}
            {reportData.pointsTrend && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Points Trend (Last 12 Months)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData.pointsTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="earned" stroke="#82ca9d" strokeWidth={2} />
                      <Line type="monotone" dataKey="redeemed" stroke="#ff7300" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Top Members Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Members by Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Rank</th>
                      <th className="text-left p-3">Guest ID</th>
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Email</th>
                      <th className="text-left p-3">Points</th>
                      <th className="text-left p-3">Tier</th>
                      <th className="text-left p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.topMembers?.map((member: any, index: number) => (
                      <tr key={member._id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-semibold">{index + 1}</td>
                        <td className="p-3">{member.guestId}</td>
                        <td className="p-3">{member.guestName}</td>
                        <td className="p-3">{member.email}</td>
                        <td className="p-3 font-bold text-blue-600">{member.points}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-sm ${
                            member.tier === 'Platinum' ? 'bg-gray-200 text-gray-800' :
                            member.tier === 'Gold' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-gray-300 text-gray-700'
                          }`}>
                            {member.tier}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-sm ${
                            member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {member.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
