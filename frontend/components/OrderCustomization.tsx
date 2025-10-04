'use client';

import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { MenuItem } from '@/services/api';
import { formatCurrency } from '@/utils/currency';

interface OrderCustomizationProps {
  menuItem: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customization: any, finalPrice: number) => void;
}

export default function OrderCustomization({
  menuItem,
  isOpen,
  onClose,
  onConfirm
}: OrderCustomizationProps) {
  const [portionSize, setPortionSize] = useState<'small' | 'regular' | 'large'>('regular');
  const [modifications, setModifications] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [cookingPreferences, setCookingPreferences] = useState<string[]>([]);

  if (!isOpen) return null;

  const calculatePrice = () => {
    let basePrice = menuItem.price;
    
    // Apply portion size pricing
    if (portionSize === 'small') {
      basePrice += menuItem.portionPricing.small;
    } else if (portionSize === 'large') {
      basePrice += menuItem.portionPricing.large;
    }
    
    // Apply discount
    const discountedPrice = basePrice * (1 - (menuItem.discount || 0) / 100);
    
    return discountedPrice;
  };

  const handleModificationToggle = (modification: string) => {
    setModifications(prev => 
      prev.includes(modification)
        ? prev.filter(m => m !== modification)
        : [...prev, modification]
    );
  };

  const handleDietaryToggle = (restriction: string) => {
    setDietaryRestrictions(prev => 
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const handleCookingToggle = (preference: string) => {
    setCookingPreferences(prev => 
      prev.includes(preference)
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  const handleConfirm = () => {
    const customization = {
      dietaryRestrictions,
      portionSize,
      modifications,
      specialInstructions,
      cookingPreferences
    };
    
    onConfirm(customization, calculatePrice());
  };

  const finalPrice = calculatePrice();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Customize Your Order</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Menu Item Info */}
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
              {menuItem.image ? (
                <img
                  src={`http://localhost:5000${menuItem.image}`}
                  alt={menuItem.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-2xl">🍽️</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{menuItem.name}</h3>
              <p className="text-sm text-gray-600">{menuItem.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(finalPrice)}
                </span>
                {menuItem.discount > 0 && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatCurrency(menuItem.price)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Portion Size */}
          {menuItem.customizationOptions.allowPortionSize && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Portion Size
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'small', label: 'Small', price: menuItem.portionPricing.small },
                  { value: 'regular', label: 'Regular', price: 0 },
                  { value: 'large', label: 'Large', price: menuItem.portionPricing.large }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPortionSize(option.value as any)}
                    className={`p-3 rounded-lg border text-center ${
                      portionSize === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    {option.price !== 0 && (
                      <div className="text-sm text-gray-500">
                        {option.price > 0 ? '+' : ''}{formatCurrency(option.price)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Modifications */}
          {menuItem.customizationOptions.allowModifications && menuItem.customizationOptions.commonModifications.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Modifications
              </label>
              <div className="space-y-2">
                {menuItem.customizationOptions.commonModifications.map((modification) => (
                  <label key={modification} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={modifications.includes(modification)}
                      onChange={() => handleModificationToggle(modification)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">{modification}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Dietary Restrictions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dietary Restrictions
            </label>
            <div className="space-y-2">
              {[
                'Vegetarian',
                'Vegan',
                'Gluten-Free',
                'Nut-Free',
                'Dairy-Free',
                'Halal',
                'Kosher'
              ].map((restriction) => (
                <label key={restriction} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={dietaryRestrictions.includes(restriction)}
                    onChange={() => handleDietaryToggle(restriction)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">{restriction}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cooking Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Cooking Preferences
            </label>
            <div className="space-y-2">
              {[
                'Well Done',
                'Medium',
                'Rare',
                'Extra Spicy',
                'Mild',
                'No Salt',
                'Extra Salt'
              ].map((preference) => (
                <label key={preference} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={cookingPreferences.includes(preference)}
                    onChange={() => handleCookingToggle(preference)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">{preference}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          {menuItem.customizationOptions.allowSpecialInstructions && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests or instructions..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-lg font-semibold text-gray-900">
            Total: {formatCurrency(finalPrice)}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
