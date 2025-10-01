import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UsersIcon, StarIcon, TrendingUpIcon, CreditCardIcon } from 'lucide-react';
import StatsCard from './StatsCard';
import RecentFeedbackTable from './RecentFeedbackTable';
import TopGuestsTable from './TopGuestsTable';
const data = [{
  month: 'Jan',
  satisfaction: 4.2
}, {
  month: 'Feb',
  satisfaction: 4.0
}, {
  month: 'Mar',
  satisfaction: 4.5
}, {
  month: 'Apr',
  satisfaction: 4.3
}, {
  month: 'May',
  satisfaction: 4.7
}, {
  month: 'Jun',
  satisfaction: 4.8
}];
const ManagerDashboard = () => {
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        <div className="flex space-x-3">
          <select className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
          <button className="bg-navy-blue hover:bg-navy-blue-dark text-white py-2 px-4 rounded-md text-sm">
            Generate Report
          </button>
        </div>
      </div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Guests" value="1,248" change="+12.5%" trend="up" icon={<UsersIcon className="h-6 w-6 text-blue-500" />} />
        <StatsCard title="Average Rating" value="4.7/5" change="+0.3" trend="up" icon={<StarIcon className="h-6 w-6 text-yellow-500" />} />
        <StatsCard title="Loyalty Members" value="426" change="+18.2%" trend="up" icon={<TrendingUpIcon className="h-6 w-6 text-green-500" />} />
        <StatsCard title="Active Offers" value="8" change="+2" trend="up" icon={<CreditCardIcon className="h-6 w-6 text-purple-500" />} />
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            Guest Satisfaction Trend
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="satisfaction" fill="#1e3a8a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            Loyalty Program Enrollment
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{
              tier: 'Bronze',
              count: 245
            }, {
              tier: 'Silver',
              count: 120
            }, {
              tier: 'Gold',
              count: 48
            }, {
              tier: 'Platinum',
              count: 13
            }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tier" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#d4af37" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentFeedbackTable />
        <TopGuestsTable />
      </div>
    </div>;
};
export default ManagerDashboard;
