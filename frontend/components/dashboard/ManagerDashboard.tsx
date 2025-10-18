import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UsersIcon, StarIcon, TrendingUpIcon, CreditCardIcon } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentFeedbackTable from '@/components/dashboard/RecentFeedbackTable';
import TopGuestsTable from '@/components/dashboard/TopGuestsTable';
import dashboardService from '@/services/dashboardService';

interface DashboardStats {
  totalGuests: {
    value: number;
    change: string;
    trend: 'up' | 'down';
  };
  averageRating: {
    value: string;
    change: string;
    trend: 'up' | 'down';
  };
  loyaltyMembers: {
    value: number;
    change: string;
    trend: 'up' | 'down';
  };
  activeOffers: {
    value: number;
    change: string;
    trend: 'up' | 'down';
  };
}

interface ChartData {
  satisfactionTrend: Array<{
    month: string;
    satisfaction: number;
  }>;
  loyaltyEnrollment: Array<{
    tier: string;
    count: number;
  }>;
}

interface FeedbackItem {
  id: string;
  guest: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'responded';
}

interface GuestItem {
  id: string;
  name: string;
  visits: number;
  loyaltyTier: string;
  points: number;
}

interface DashboardData {
  stats: DashboardStats;
  charts: ChartData;
  recentFeedback: FeedbackItem[];
  topGuests: GuestItem[];
}

const ManagerDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<string>('30d');

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardService.getDashboardStats(timeframe);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading dashboard: {error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-2 text-red-600 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-600">No dashboard data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customer Relationship Dashboard</h1>
        <div className="flex space-x-3">
          <select 
            className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold text-sm"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">This year</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Guests" 
          value={data.stats.totalGuests.value.toLocaleString()} 
          change={data.stats.totalGuests.change} 
          trend={data.stats.totalGuests.trend} 
          icon={<UsersIcon className="h-6 w-6 text-blue-500" />} 
        />
        <StatsCard 
          title="Average Rating" 
          value={`${data.stats.averageRating.value}/5`} 
          change={data.stats.averageRating.change} 
          trend={data.stats.averageRating.trend} 
          icon={<StarIcon className="h-6 w-6 text-yellow-500" />} 
        />
        <StatsCard 
          title="Loyalty Members" 
          value={data.stats.loyaltyMembers.value.toLocaleString()} 
          change={data.stats.loyaltyMembers.change} 
          trend={data.stats.loyaltyMembers.trend} 
          icon={<TrendingUpIcon className="h-6 w-6 text-green-500" />} 
        />
        <StatsCard 
          title="Active Offers" 
          value={data.stats.activeOffers.value.toString()} 
          change={data.stats.activeOffers.change} 
          trend={data.stats.activeOffers.trend} 
          icon={<CreditCardIcon className="h-6 w-6 text-purple-500" />} 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            Guest Satisfaction Trend
          </h2>
          {data.charts.satisfactionTrend.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.satisfactionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="satisfaction" fill="#1e3a8a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>No satisfaction data available for this period</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            Loyalty Program Enrollment
          </h2>
          {data.charts.loyaltyEnrollment.some(item => item.count > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.loyaltyEnrollment}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tier" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#d4af37" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>No loyalty enrollment data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentFeedbackTable feedbackData={data.recentFeedback} />
        <TopGuestsTable guestsData={data.topGuests} />
      </div>
    </div>
  );
};

export default ManagerDashboard;
