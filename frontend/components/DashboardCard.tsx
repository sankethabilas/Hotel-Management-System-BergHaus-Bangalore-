'use client';

import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ComponentType<any>;
  color: string;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  change,
  changeType,
  icon: Icon,
  color
}: DashboardCardProps) {
  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      red: 'bg-red-50 text-red-600 border-red-200',
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const getChangeColorClasses = (changeType: 'increase' | 'decrease') => {
    return changeType === 'increase' 
      ? 'text-green-600' 
      : 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${getChangeColorClasses(changeType!)}`}>
                {changeType === 'increase' ? '↗️' : '↘️'} {change}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl border-2 ${getColorClasses(color)}`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}