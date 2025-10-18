'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Loader2 } from 'lucide-react';
import analyticsService from '@/services/analyticsService';

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];
const RATING_COLORS = ['#10b981', '#84cc16', '#f59e0b', '#f97316', '#ef4444'];

interface MonthlyData {
  month: string;
  average: number;
}

interface RatingDistribution {
  name: string;
  value: number;
  [key: string]: any;
}

interface CategoryRating {
  category: string;
  rating: number;
}

interface Charts {
  monthlyData: MonthlyData[];
  ratingDistribution: RatingDistribution[];
  categoryRatings: CategoryRating[];
}

interface Summary {
  overallRating: number;
  totalFeedback: number;
  responseRate: number;
  avgResponseTime: number;
}

interface Trends {
  ratingChange: number;
  feedbackChange: number;
}

interface AnalyticsData {
  summary: Summary;
  trends: Trends;
  charts: Charts;
}

type Timeframe = '1m' | '3m' | '6m' | '1y' | 'all';

const FeedbackAnalytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1m');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsService.getFeedbackAnalytics(timeframe);
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
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading analytics: {error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-2 text-red-600 underline hover:text-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  const { summary, trends, charts } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Feedback Analytics</h1>
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-gray-400 mr-2" />
          <select
            className="border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as Timeframe)}
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Overall Rating</p>
          <div className="flex items-center mt-1">
            <p className="text-3xl font-bold text-gray-900">{summary.overallRating.toFixed(1)}</p>
            <div className="ml-2 flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(summary.overallRating)
                      ? 'text-yellow-400'
                      : i < summary.overallRating
                      ? 'text-yellow-200'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
          {trends.ratingChange !== 0 && (
            <p className={`mt-2 flex items-center text-sm ${trends.ratingChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                {trends.ratingChange > 0 ? (
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
              <span>
                {trends.ratingChange > 0 ? '+' : ''}
                {trends.ratingChange.toFixed(1)} since last period
              </span>
            </p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Total Feedback</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{summary.totalFeedback}</p>
          {trends.feedbackChange !== 0 && (
            <p className={`mt-2 flex items-center text-sm ${trends.feedbackChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                {trends.feedbackChange > 0 ? (
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
              <span>
                {trends.feedbackChange > 0 ? '+' : ''}
                {Math.abs(trends.feedbackChange).toFixed(0)}% since last period
              </span>
            </p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Response Rate</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{summary.responseRate}%</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Avg. Response Time</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{summary.avgResponseTime.toFixed(1)}h</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Satisfaction Trend</h2>
          {charts.monthlyData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <p>No data available for this period</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Rating Distribution</h2>
          {charts.ratingDistribution.some((item) => item.value > 0) ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.ratingDistribution.filter((item) => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {charts.ratingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={RATING_COLORS[index % RATING_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <p>No data available for this period</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Ratings */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Category Ratings</h2>
        {charts.categoryRatings.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.categoryRatings}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 5]} />
                <YAxis dataKey="category" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="rating" fill="#2563eb" radius={[0, 4, 4, 0]}>
                  {charts.categoryRatings.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>No category data available for this period</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackAnalytics;
