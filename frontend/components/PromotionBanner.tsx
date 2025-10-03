'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  validUntil: string;
  isActive: boolean;
  backgroundColor: string;
  textColor: string;
}

// Sample promotion data - in a real app, this would come from an API
const promotions: Promotion[] = [
  {
    id: '1',
    title: 'Weekend Special',
    description: '20% off on all breakfast items this weekend',
    discount: 20,
    validUntil: '2024-12-31',
    isActive: true,
    backgroundColor: 'bg-gradient-to-r from-orange-500 to-red-500',
    textColor: 'text-white'
  },
  {
    id: '2',
    title: 'Happy Hour',
    description: '50% off on beverages from 5 PM to 7 PM',
    discount: 50,
    validUntil: '2024-12-31',
    isActive: true,
    backgroundColor: 'bg-gradient-to-r from-blue-500 to-purple-500',
    textColor: 'text-white'
  },
  {
    id: '3',
    title: 'New Customer',
    description: 'Get 15% off on your first order',
    discount: 15,
    validUntil: '2024-12-31',
    isActive: true,
    backgroundColor: 'bg-gradient-to-r from-green-500 to-teal-500',
    textColor: 'text-white'
  }
];

export default function PromotionBanner() {
  const [currentPromotion, setCurrentPromotion] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [dismissedPromotions, setDismissedPromotions] = useState<string[]>([]);

  // Filter active promotions that haven't been dismissed
  const activePromotions = promotions.filter(
    promo => promo.isActive && !dismissedPromotions.includes(promo.id)
  );

  // Auto-advance promotions
  useEffect(() => {
    if (activePromotions.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentPromotion((prev) => 
        prev === activePromotions.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [activePromotions.length]);

  const handleDismiss = (promotionId: string) => {
    setDismissedPromotions(prev => [...prev, promotionId]);
    if (currentPromotion >= activePromotions.length - 1) {
      setCurrentPromotion(0);
    }
  };

  const goToPrevious = () => {
    setCurrentPromotion(prev => 
      prev === 0 ? activePromotions.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentPromotion(prev => 
      prev === activePromotions.length - 1 ? 0 : prev + 1
    );
  };

  if (!isVisible || activePromotions.length === 0) {
    return null;
  }

  const currentPromo = activePromotions[currentPromotion];

  return (
    <div className="relative mb-6">
      <div className={`${currentPromo.backgroundColor} ${currentPromo.textColor} rounded-lg p-4 relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-full p-2">
                <span className="text-2xl">🎉</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">{currentPromo.title}</h3>
                <p className="text-sm opacity-90">{currentPromo.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Discount Badge */}
            <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
              <span className="font-bold text-lg">{currentPromo.discount}% OFF</span>
            </div>

            {/* Navigation Arrows */}
            {activePromotions.length > 1 && (
              <div className="flex space-x-1">
                <button
                  onClick={goToPrevious}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                  aria-label="Previous promotion"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={goToNext}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                  aria-label="Next promotion"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Dismiss Button */}
            <button
              onClick={() => handleDismiss(currentPromo.id)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              aria-label="Dismiss promotion"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Dots */}
        {activePromotions.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {activePromotions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPromotion(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentPromotion 
                    ? 'bg-white' 
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
                aria-label={`Go to promotion ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
