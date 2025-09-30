import React from 'react';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
const StatsCard = ({
  title,
  value,
  change,
  trend,
  icon
}) => {
  return <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-full">{icon}</div>
      </div>
      <div className="mt-4 flex items-center">
        {trend === 'up' ? <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" /> : <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />}
        <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
        <span className="text-sm text-gray-500 ml-1">since last month</span>
      </div>
    </div>;
};
export default StatsCard;