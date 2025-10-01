'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Clock, Calendar, Percent, X } from 'lucide-react';

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
  usageCount?: number;
  maxUsage?: number;
}

export default function PromotionBanner() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedPromotions, setDismissedPromotions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchActivePromotions();
  }, []);

  const fetchActivePromotions = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/promotions/active');
      const data = await response.json();
      if (data.success) {
        setPromotions(data.data);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissPromotion = (promotionId: string) => {
    setDismissedPromotions(prev => new Set([...prev, promotionId]));
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
      case 'time-based': return 'bg-blue-500';
      case 'seasonal': return 'bg-green-500';
      case 'category': return 'bg-purple-500';
      default: return 'bg-orange-500';
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTimeBasedDescription = (promotion: Promotion) => {
    if (promotion.type === 'time-based' && promotion.timeRanges && promotion.timeRanges.length > 0) {
      const range = promotion.timeRanges[0];
      const days = range.days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ');
      return `${days} ${formatTime(range.startTime)} - ${formatTime(range.endTime)}`;
    }
    return '';
  };

  const getSeasonalDescription = (promotion: Promotion) => {
    if (promotion.type === 'seasonal' && promotion.seasonalDates) {
      const startDate = new Date(promotion.seasonalDates.startDate);
      const endDate = new Date(promotion.seasonalDates.endDate);
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    }
    return '';
  };

  const getCategoryDescription = (promotion: Promotion) => {
    if (promotion.type === 'category' && promotion.categories.length > 0) {
      return promotion.categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)).join(', ');
    }
    return '';
  };

  if (loading) return null;

  const visiblePromotions = promotions.filter(promo => !dismissedPromotions.has(promo._id));

  if (visiblePromotions.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg shadow-lg mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          🎉 Special Offers Available!
        </h3>
      </div>
      
      <div className="space-y-3">
        {visiblePromotions.map((promotion) => (
          <div key={promotion._id} className="bg-white bg-opacity-20 rounded-lg p-3 relative">
            <button
              onClick={() => dismissPromotion(promotion._id)}
              className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${getTypeColor(promotion.type)}`}>
                {getTypeIcon(promotion.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{promotion.name}</h4>
                  <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                    {promotion.discountPercentage}% OFF
                  </span>
                </div>
                
                <p className="text-sm opacity-90 mb-2">{promotion.description}</p>
                
                <div className="text-xs opacity-80 space-y-1">
                  {promotion.type === 'time-based' && (
                    <p>⏰ {getTimeBasedDescription(promotion)}</p>
                  )}
                  {promotion.type === 'seasonal' && (
                    <p>📅 {getSeasonalDescription(promotion)}</p>
                  )}
                  {promotion.type === 'category' && (
                    <p>🏷️ {getCategoryDescription(promotion)}</p>
                  )}
                  {promotion.minOrderAmount > 0 && (
                    <p>💰 Min order: ${promotion.minOrderAmount}</p>
                  )}
                  {promotion.maxDiscountAmount && (
                    <p>💎 Max discount: ${promotion.maxDiscountAmount}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-sm opacity-80 mt-3">
        💡 Discounts are automatically applied at checkout!
      </p>
    </div>
  );
}
