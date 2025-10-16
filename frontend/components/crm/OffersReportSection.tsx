'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Filter, TrendingUp, Gift, Tag } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

interface OffersFilters {
  startDate: string;
  endDate: string;
  offerStatus: string;
  discountType: string;
  minDiscount: string;
  maxDiscount: string;
  roomType: string;
  sortBy: string;
  sortOrder: string;
}

export default function OffersReportSection() {
  const [filters, setFilters] = useState<OffersFilters>({
    startDate: '',
    endDate: '',
    offerStatus: '',
    discountType: '',
    minDiscount: '',
    maxDiscount: '',
    roomType: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
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
        `http://localhost:5000/api/crm-reports/offers?${queryParams.toString()}`
        // TEMPORARILY REMOVED AUTH - RE-ENABLE IN PRODUCTION
        // {
        //   headers: {
        //     Authorization: `Bearer ${localStorage.getItem('token')}`
        //   }
        // }
      );

      setReportData(response.data.data);
    } catch (error) {
      console.error('Error fetching offers report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof OffersFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axios.get(
        `http://localhost:5000/api/crm-reports/offers/export?${queryParams.toString()}`,
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
      link.setAttribute('download', `offers-report-${Date.now()}.xlsx`);
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
      offerStatus: '',
      discountType: '',
      minDiscount: '',
      maxDiscount: '',
      roomType: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  if (isLoading && !reportData) {
    return <div className="text-center py-8">Loading report...</div>;
  }

  // Prepare chart data
  const discountTypeData = reportData?.statistics?.discountTypeDistribution
    ? Object.entries(reportData.statistics.discountTypeDistribution).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }))
    : [];

  const offerStatusData = reportData?.statistics
    ? [
        { name: 'Active', value: reportData.statistics.activeOffers, color: '#10B981' },
        { name: 'Expired', value: reportData.statistics.expiredOffers, color: '#EF4444' },
        { name: 'Upcoming', value: reportData.statistics.upcomingOffers, color: '#3B82F6' }
      ]
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
                <Label htmlFor="offerStatus">Offer Status</Label>
                <Select value={filters.offerStatus || 'all'} onValueChange={(value) => handleFilterChange('offerStatus', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="discountType">Discount Type</Label>
                <Select value={filters.discountType || 'all'} onValueChange={(value) => handleFilterChange('discountType', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="minDiscount">Min Discount</Label>
                <Input
                  id="minDiscount"
                  type="number"
                  placeholder="Min value"
                  value={filters.minDiscount}
                  onChange={(e) => handleFilterChange('minDiscount', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="maxDiscount">Max Discount</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  placeholder="Max value"
                  value={filters.maxDiscount}
                  onChange={(e) => handleFilterChange('maxDiscount', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="sortBy">Sort By</Label>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="validFrom">Start Date</SelectItem>
                    <SelectItem value="validUntil">End Date</SelectItem>
                    <SelectItem value="discountValue">Discount Value</SelectItem>
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
                    <p className="text-sm text-gray-600">Total Offers</p>
                    <h3 className="text-2xl font-bold mt-1">{reportData.statistics.totalOffers}</h3>
                  </div>
                  <Gift className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Offers</p>
                    <h3 className="text-2xl font-bold mt-1 text-green-600">
                      {reportData.statistics.activeOffers}
                    </h3>
                  </div>
                  <Tag className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Expired Offers</p>
                    <h3 className="text-2xl font-bold mt-1 text-red-600">
                      {reportData.statistics.expiredOffers}
                    </h3>
                  </div>
                  <Tag className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Upcoming Offers</p>
                    <h3 className="text-2xl font-bold mt-1 text-blue-600">
                      {reportData.statistics.upcomingOffers}
                    </h3>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Discount Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Discount Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={discountTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Offer Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Offer Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={offerStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.name} (${entry.value})`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {offerStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Offers Trend */}
            {reportData.offersTrend && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Offers Trend (Last 12 Months)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData.offersTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="created" stroke="#8884d8" strokeWidth={2} name="Created" />
                      <Line type="monotone" dataKey="active" stroke="#82ca9d" strokeWidth={2} name="Active" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Top Performing Offers */}
          {reportData.usageStats && reportData.usageStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Rank</th>
                        <th className="text-left p-3">Offer Title</th>
                        <th className="text-left p-3">Times Used</th>
                        <th className="text-left p-3">Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.usageStats.map((offer: any, index: number) => (
                        <tr key={offer.offerId} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-semibold">{index + 1}</td>
                          <td className="p-3">{offer.title}</td>
                          <td className="p-3 font-bold text-blue-600">{offer.timesUsed}</td>
                          <td className="p-3 font-bold text-green-600">
                            ${offer.totalRevenue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Offers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Offers Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Title</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Discount</th>
                      <th className="text-left p-3">Valid From</th>
                      <th className="text-left p-3">Valid Until</th>
                      <th className="text-left p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.offers?.map((offer: any) => {
                      const currentDate = new Date();
                      let offerStatus = 'Active';
                      let statusClass = 'bg-green-100 text-green-800';
                      
                      if (new Date(offer.validUntil) < currentDate || offer.status === 'inactive') {
                        offerStatus = 'Expired';
                        statusClass = 'bg-red-100 text-red-800';
                      } else if (new Date(offer.validFrom) > currentDate) {
                        offerStatus = 'Upcoming';
                        statusClass = 'bg-blue-100 text-blue-800';
                      }

                      return (
                        <tr key={offer._id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{offer.title}</td>
                          <td className="p-3">
                            <span className="px-2 py-1 rounded text-sm bg-gray-100">
                              {offer.discountType}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-purple-600">
                            {offer.discountType === 'percentage' ? `${offer.discountValue}%` :
                             offer.discountType === 'fixed' ? `$${offer.discountValue}` : 'Special'}
                          </td>
                          <td className="p-3">{new Date(offer.validFrom).toLocaleDateString()}</td>
                          <td className="p-3">{new Date(offer.validUntil).toLocaleDateString()}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-sm ${statusClass}`}>
                              {offerStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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
