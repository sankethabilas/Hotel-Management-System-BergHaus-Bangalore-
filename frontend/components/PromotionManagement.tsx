'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Clock, Tag, Calendar, Percent } from 'lucide-react';

interface Promotion {
  _id: string;
  name: string;
  description: string;
  discountPercentage: number;
  type: 'percentage' | 'seasonal' | 'category' | 'time-based';
  categories: string[];
  timeRanges?: Array<{
    startTime: string;
    endTime: string;
    days: string[];
  }>;
  seasonalDates?: {
    startDate: string;
    endDate: string;
  };
  isActive: boolean;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageCount: number;
  maxUsage?: number;
  createdAt: string;
}

export default function PromotionManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountPercentage: 10,
    type: 'percentage' as 'percentage' | 'seasonal' | 'category' | 'time-based',
    categories: [] as string[],
    timeRanges: [{ startTime: '', endTime: '', days: [] as string[] }],
    seasonalDates: { startDate: '', endDate: '' },
    isActive: true,
    minOrderAmount: 0,
    maxDiscountAmount: '',
    maxUsage: ''
  });

  const fetchPromotions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/promotions/admin', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (data.success) {
        setPromotions(data.data);
      } else {
        setError(data.message || 'Failed to fetch promotions');
      }
    } catch (err) {
      console.error('Fetch promotions error:', err);
      setError('Failed to connect to server or fetch promotions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const promotionData = {
        ...formData,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : null,
        timeRanges: formData.type === 'time-based' ? formData.timeRanges : undefined,
        seasonalDates: formData.type === 'seasonal' ? formData.seasonalDates : undefined,
        categories: formData.type === 'category' ? formData.categories : undefined
      };

      const url = editingPromotion 
        ? `http://localhost:5000/api/promotions/${editingPromotion._id}`
        : 'http://localhost:5000/api/promotions';
      
      const method = editingPromotion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promotionData),
      });

      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setEditingPromotion(null);
        resetForm();
        fetchPromotions();
      } else {
        setError(data.message || 'Failed to save promotion');
      }
    } catch (err) {
      console.error('Save promotion error:', err);
      setError('Failed to save promotion due to a server error.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this promotion?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/promotions/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        fetchPromotions();
      } else {
        setError(data.message || 'Failed to delete promotion');
      }
    } catch (err) {
      console.error('Delete promotion error:', err);
      setError('Failed to delete promotion due to a server error.');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/promotions/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        fetchPromotions();
      } else {
        setError(data.message || 'Failed to toggle promotion status');
      }
    } catch (err) {
      console.error('Toggle promotion status error:', err);
      setError('Failed to toggle promotion status due to a server error.');
    }
  };

  const resetForm = () => {
    setFormData({
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
  };

  const openEditModal = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name,
      description: promotion.description,
      discountPercentage: promotion.discountPercentage,
      type: promotion.type,
      categories: promotion.categories || [],
      timeRanges: promotion.timeRanges || [{ startTime: '', endTime: '', days: [] }],
      seasonalDates: promotion.seasonalDates || { startDate: '', endDate: '' },
      isActive: promotion.isActive,
      minOrderAmount: promotion.minOrderAmount,
      maxDiscountAmount: promotion.maxDiscountAmount?.toString() || '',
      maxUsage: promotion.maxUsage?.toString() || ''
    });
    setShowModal(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'time-based': return <Clock className="w-4 h-4" />;
      case 'seasonal': return <Calendar className="w-4 h-4" />;
      case 'category': return <Tag className="w-4 h-4" />;
      default: return <Percent className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'time-based': return 'bg-blue-100 text-blue-800';
      case 'seasonal': return 'bg-green-100 text-green-800';
      case 'category': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center py-8">Loading promotions...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Promotion Management</h2>
        <button
          onClick={() => {
            resetForm();
            setEditingPromotion(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Promotion
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promotion) => (
          <div key={promotion._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{promotion.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{promotion.description}</p>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(promotion.type)}`}>
                  {getTypeIcon(promotion.type)}
                  {promotion.type.replace('-', ' ')}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(promotion)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(promotion._id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Discount:</span>
                <span className="font-semibold text-green-600">{promotion.discountPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Min Order:</span>
                <span className="font-medium">${promotion.minOrderAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Usage:</span>
                <span className="font-medium">{promotion.usageCount}/{promotion.maxUsage || '∞'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${promotion.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {promotion.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {promotion.type === 'time-based' && promotion.timeRanges && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Time Ranges:</p>
                {promotion.timeRanges.map((range, index) => (
                  <p key={index} className="text-xs text-gray-600">
                    {range.startTime} - {range.endTime} ({range.days.join(', ')})
                  </p>
                ))}
              </div>
            )}

            {promotion.type === 'seasonal' && promotion.seasonalDates && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Seasonal Period:</p>
                <p className="text-xs text-gray-600">
                  {new Date(promotion.seasonalDates.startDate).toLocaleDateString()} - {new Date(promotion.seasonalDates.endDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {promotion.type === 'category' && promotion.categories.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Categories:</p>
                <p className="text-xs text-gray-600">{promotion.categories.join(', ')}</p>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={() => handleToggleStatus(promotion._id)}
                className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  promotion.isActive 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {promotion.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {promotions.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Promotions Found</h3>
          <p className="text-gray-600 mb-4">Create your first promotion to start offering discounts to guests.</p>
          <button
            onClick={() => {
              resetForm();
              setEditingPromotion(null);
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Promotion
          </button>
        </div>
      )}

      {/* Promotion Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="percentage">Percentage Discount</option>
                    <option value="seasonal">Seasonal Offer</option>
                    <option value="category">Category-based</option>
                    <option value="time-based">Time-based (Happy Hour)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount Amount</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    placeholder="No limit"
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
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={range.startTime}
                        onChange={(e) => {
                          const newRanges = [...formData.timeRanges];
                          newRanges[index].startTime = e.target.value;
                          setFormData({ ...formData, timeRanges: newRanges });
                        }}
                      />
                      <input
                        type="time"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={range.endTime}
                        onChange={(e) => {
                          const newRanges = [...formData.timeRanges];
                          newRanges[index].endTime = e.target.value;
                          setFormData({ ...formData, timeRanges: newRanges });
                        }}
                      />
                      <select
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={formData.seasonalDates.startDate}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        seasonalDates: { ...formData.seasonalDates, startDate: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={formData.seasonalDates.endDate}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        seasonalDates: { ...formData.seasonalDates, endDate: e.target.value }
                      })}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  className="mr-2"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPromotion(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingPromotion ? 'Update' : 'Create'} Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}