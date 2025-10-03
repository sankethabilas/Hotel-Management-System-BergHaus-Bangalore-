'use client';

import React, { useState, useEffect } from 'react';

interface PromotionAnalytics {
  totalPromotions: number;
  activePromotions: number;
  totalDiscounts: number;
  averageDiscount: number;
  mostUsedPromotion: string;
  revenueSaved: number;
}

interface Promotion {
  _id: string;
  name: string;
  usageCount: number;
  discountPercentage: number;
  isActive: boolean;
}

export default function PromotionAnalyticsPage() {
  const [analytics, setAnalytics] = useState<PromotionAnalytics | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Fetch promotions data
      const response = await fetch('http://localhost:5000/api/promotions/admin', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (data.success) {
        const promotionsData = data.data;
        setPromotions(promotionsData);
        
        // Calculate analytics
        const totalPromotions = promotionsData.length;
        const activePromotions = promotionsData.filter(p => p.isActive).length;
        const totalDiscounts = promotionsData.reduce((sum, p) => sum + p.usageCount, 0);
        const averageDiscount = promotionsData.length > 0 
          ? promotionsData.reduce((sum, p) => sum + p.discountPercentage, 0) / promotionsData.length 
          : 0;
        
        const mostUsedPromotion = promotionsData.length > 0 
          ? promotionsData.reduce((max, p) => p.usageCount > max.usageCount ? p : max).name
          : 'None';
        
        const revenueSaved = promotionsData.reduce((sum, p) => {
          // Estimate revenue saved based on usage count and average order value
          const estimatedOrderValue = 50; // Average order value
          const discountAmount = (estimatedOrderValue * p.discountPercentage) / 100;
          return sum + (discountAmount * p.usageCount);
        }, 0);
        
        setAnalytics({
          totalPromotions,
          activePromotions,
          totalDiscounts,
          averageDiscount: Math.round(averageDiscount * 100) / 100,
          mostUsedPromotion,
          revenueSaved: Math.round(revenueSaved * 100) / 100
        });
      } else {
        setError('Failed to load analytics data');
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Promotion Analytics</h1>
          <p className="text-gray-600">Track the performance of your discount promotions</p>
        </div>

        {analytics && (
          <>
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Promotions</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalPromotions}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Promotions</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.activePromotions}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Discounts Used</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalDiscounts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Revenue Saved</p>
                    <p className="text-2xl font-bold text-gray-900">${analytics.revenueSaved}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Discount</h3>
                <div className="text-3xl font-bold text-blue-600">{analytics.averageDiscount}%</div>
                <p className="text-sm text-gray-600 mt-2">Average discount percentage across all promotions</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Promotion</h3>
                <div className="text-xl font-semibold text-green-600">{analytics.mostUsedPromotion}</div>
                <p className="text-sm text-gray-600 mt-2">Based on usage count</p>
              </div>
            </div>

            {/* Promotion Performance Table */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Promotion Performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promotion</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount %</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage Count</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {promotions.map((promotion) => (
                      <tr key={promotion._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{promotion.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{promotion.discountPercentage}%</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{promotion.usageCount}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            promotion.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {promotion.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${Math.min((promotion.usageCount / 10) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">
                              {promotion.usageCount > 10 ? 'High' : promotion.usageCount > 5 ? 'Medium' : 'Low'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
