'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PromotionFormData {
  name: string;
  description: string;
  discountPercentage: number;
  type: 'percentage' | 'seasonal' | 'category' | 'time-based';
  categories: string[];
  timeRanges: Array<{ startTime: string; endTime: string; days: string[] }>;
  seasonalDates: { startDate: string; endDate: string };
  isActive: boolean;
  minOrderAmount: number;
  maxDiscountAmount: string;
  maxUsage: string;
}

export default function CreatePromotionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<PromotionFormData>({
    name: '',
    description: '',
    discountPercentage: 10,
    type: 'percentage',
    categories: [],
    timeRanges: [{ startTime: '', endTime: '', days: [] }],
    seasonalDates: { startDate: '', endDate: '' },
    isActive: true,
    minOrderAmount: 0,
    maxDiscountAmount: '',
    maxUsage: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (isSubmitting) return;
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const promotionData = {
        ...formData,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : null,
        timeRanges: formData.type === 'time-based' ? formData.timeRanges : undefined,
        seasonalDates: formData.type === 'seasonal' ? formData.seasonalDates : undefined,
        categories: formData.type === 'category' ? formData.categories : undefined
      };

      const response = await fetch('http://localhost:5000/api/promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promotionData),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Promotion created successfully!');
        setTimeout(() => {
          router.push('/admin/promotions');
        }, 2000);
      } else {
        setError(data.message || 'Failed to create promotion');
      }
    } catch (error: any) {
      console.error('Error creating promotion:', error);
      setError(error.message || 'Failed to create promotion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create New Promotion</h1>
            <p className="text-gray-600">Add a new discount promotion for your guests</p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              <div className="flex items-center">
                <span className="mr-2">✅</span>
                {success}
              </div>
            </div>
          )}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <div className="flex items-center">
                <span className="mr-2">❌</span>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Happy Hour Special"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="percentage">Percentage Discount</option>
                  <option value="seasonal">Seasonal Offer</option>
                  <option value="category">Category-based</option>
                  <option value="time-based">Time-based (Happy Hour)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                placeholder="Describe your promotion..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount % *</label>
                <input
                  type="number"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount</label>
                <input
                  type="number"
                  name="minOrderAmount"
                  value={formData.minOrderAmount}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount Amount</label>
                <input
                  type="number"
                  name="maxDiscountAmount"
                  value={formData.maxDiscountAmount}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="No limit"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {formData.type === 'category' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['starters', 'mains', 'desserts', 'beverages', 'specials', 'breakfast', 'lunch', 'dinner'].map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={formData.categories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, categories: [...formData.categories, category] });
                          } else {
                            setFormData({ ...formData, categories: formData.categories.filter(c => c !== category) });
                          }
                        }}
                      />
                      <span className="text-sm capitalize">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {formData.type === 'time-based' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Ranges</label>
                {formData.timeRanges.map((range, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <input
                      type="time"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={range.startTime}
                      onChange={(e) => {
                        const newRanges = [...formData.timeRanges];
                        newRanges[index].startTime = e.target.value;
                        setFormData({ ...formData, timeRanges: newRanges });
                      }}
                    />
                    <input
                      type="time"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={range.endTime}
                      onChange={(e) => {
                        const newRanges = [...formData.timeRanges];
                        newRanges[index].endTime = e.target.value;
                        setFormData({ ...formData, timeRanges: newRanges });
                      }}
                    />
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={range.days[0] || ''}
                      onChange={(e) => {
                        const newRanges = [...formData.timeRanges];
                        newRanges[index].days = [e.target.value];
                        setFormData({ ...formData, timeRanges: newRanges });
                      }}
                    >
                      <option value="">Select day</option>
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                        <option key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {formData.type === 'seasonal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.seasonalDates.startDate}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      seasonalDates: { ...formData.seasonalDates, startDate: e.target.value }
                    })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.seasonalDates.endDate}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      seasonalDates: { ...formData.seasonalDates, endDate: e.target.value }
                    })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">
                Active (promotion is currently running)
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/admin/promotions')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {isSubmitting ? 'Creating...' : 'Create Promotion'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
