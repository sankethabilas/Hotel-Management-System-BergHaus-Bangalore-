import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CalendarIcon, DownloadIcon } from 'lucide-react';
const monthlyData = [{
  month: 'Jan',
  average: 4.2,
  count: 45
}, {
  month: 'Feb',
  average: 4.0,
  count: 38
}, {
  month: 'Mar',
  average: 4.5,
  count: 52
}, {
  month: 'Apr',
  average: 4.3,
  count: 48
}, {
  month: 'May',
  average: 4.7,
  count: 56
}, {
  month: 'Jun',
  average: 4.8,
  count: 62
}, {
  month: 'Jul',
  average: 4.6,
  count: 58
}, {
  month: 'Aug',
  average: 4.4,
  count: 50
}, {
  month: 'Sep',
  average: 4.5,
  count: 55
}];
const ratingDistribution = [{
  name: '5 Stars',
  value: 125
}, {
  name: '4 Stars',
  value: 84
}, {
  name: '3 Stars',
  value: 42
}, {
  name: '2 Stars',
  value: 18
}, {
  name: '1 Star',
  value: 9
}];
const topPositiveKeywords = [{
  keyword: 'Staff',
  count: 87
}, {
  keyword: 'Clean',
  count: 76
}, {
  keyword: 'Service',
  count: 65
}, {
  keyword: 'Comfortable',
  count: 58
}, {
  keyword: 'Friendly',
  count: 52
}, {
  keyword: 'Breakfast',
  count: 45
}, {
  keyword: 'Location',
  count: 43
}, {
  keyword: 'Spacious',
  count: 38
}];
const topNegativeKeywords = [{
  keyword: 'Noise',
  count: 24
}, {
  keyword: 'Expensive',
  count: 19
}, {
  keyword: 'Bathroom',
  count: 17
}, {
  keyword: 'Small',
  count: 15
}, {
  keyword: 'Slow',
  count: 12
}, {
  keyword: 'Parking',
  count: 10
}, {
  keyword: 'Outdated',
  count: 8
}, {
  keyword: 'Crowded',
  count: 6
}];
const categoryRatings = [{
  category: 'Room Cleanliness',
  rating: 4.7
}, {
  category: 'Staff Service',
  rating: 4.8
}, {
  category: 'Food Quality',
  rating: 4.2
}, {
  category: 'Value for Money',
  rating: 4.0
}, {
  category: 'Location',
  rating: 4.5
}, {
  category: 'Facilities',
  rating: 4.3
}];
const COLORS = ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];
const RATING_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981'];
const FeedbackAnalytics = () => {
  const [timeframe, setTimeframe] = useState('6m'); // 1m, 3m, 6m, 1y, all
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Feedback Analytics</h1>
        <div className="flex space-x-3">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
            <select className="border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-gold focus:border-gold" value={timeframe} onChange={e => setTimeframe(e.target.value)}>
              <option value="1m">Last Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Overall Rating</p>
          <div className="flex items-center mt-1">
            <p className="text-3xl font-bold text-gray-900">4.5</p>
            <div className="ml-2 flex">
              {[...Array(5)].map((_, i) => <svg key={i} className={`h-5 w-5 ${i < 4 ? 'text-yellow-400' : i < 4.5 ? 'text-yellow-200' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>)}
            </div>
          </div>
          <p className="mt-2 flex items-center text-sm text-green-600">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            <span>+0.3 since last period</span>
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Total Feedback</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">278</p>
          <p className="mt-2 flex items-center text-sm text-green-600">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            <span>+12% since last period</span>
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">Response Rate</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">92%</p>
          <p className="mt-2 flex items-center text-sm text-green-600">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            <span>+5% since last period</span>
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500">
            Avg. Response Time
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-1">8.2h</p>
          <p className="mt-2 flex items-center text-sm text-red-600">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
            </svg>
            <span>+1.5h since last period</span>
          </p>
        </div>
      </div>
      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Satisfaction Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="average" stroke="#1e3a8a" strokeWidth={2} dot={{
                r: 4
              }} activeDot={{
                r: 6
              }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Rating Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ratingDistribution} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={({
                name,
                percent
              }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {ratingDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={RATING_COLORS[index]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Category Ratings */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Category Ratings</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryRatings} layout="vertical" margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 5]} />
              <YAxis dataKey="category" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="rating" fill="#d4af37" radius={[0, 4, 4, 0]}>
                {categoryRatings.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Keyword Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Top Positive Keywords</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPositiveKeywords} layout="vertical" margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="keyword" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Top Negative Keywords</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topNegativeKeywords} layout="vertical" margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="keyword" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Feedback Volume */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Feedback Volume</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>;
};
export default FeedbackAnalytics;
