'use client';

import React from 'react';

interface QuickActionItem {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  color: string;
}

interface QuickActionsProps {
  actions: QuickActionItem[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.action}
          className="group relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className={`p-4 rounded-full ${action.color} text-white group-hover:scale-110 transition-transform duration-200`}>
              <action.icon className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {action.description}
              </p>
            </div>
          </div>
          
          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        </button>
      ))}
    </div>
  );
}