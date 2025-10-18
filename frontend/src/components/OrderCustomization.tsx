import React, { useState } from 'react';

interface OrderCustomization {
  dietaryRestrictions: string[];
  portionSize: 'small' | 'regular' | 'large';
  modifications: string[];
  specialInstructions: string;
  cookingPreferences: string[];
}

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  // Optional customization fields (will use defaults if not present)
  dietaryInfo?: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    nutFree: boolean;
    dairyFree: boolean;
    halal: boolean;
    kosher: boolean;
  };
  customizationOptions?: {
    allowPortionSize: boolean;
    allowModifications: boolean;
    allowSpecialInstructions: boolean;
    commonModifications: string[];
  };
  portionPricing?: {
    small: number;
    regular: number;
    large: number;
  };
}

interface Props {
  menuItem: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customization: OrderCustomization, finalPrice: number) => void;
}

export default function OrderCustomization({ menuItem, isOpen, onClose, onConfirm }: Props) {
  const [customization, setCustomization] = useState<OrderCustomization>({
    dietaryRestrictions: [],
    portionSize: 'regular',
    modifications: [],
    specialInstructions: '',
    cookingPreferences: []
  });

  // Get default values for customization options
  const getDietaryInfo = () => {
    return menuItem.dietaryInfo || {
      vegetarian: menuItem.isVegetarian || false,
      vegan: menuItem.isVegan || false,
      glutenFree: menuItem.isGlutenFree || false,
      nutFree: false,
      dairyFree: false,
      halal: false,
      kosher: false
    };
  };

  const getCustomizationOptions = () => {
    return menuItem.customizationOptions || {
      allowPortionSize: true,
      allowModifications: true,
      allowSpecialInstructions: true,
      commonModifications: ['Extra cheese', 'Hold onions', 'Extra spicy', 'Less spicy', 'No sauce']
    };
  };

  const getPortionPricing = () => {
    return menuItem.portionPricing || {
      small: -2, // $2 discount for small
      regular: 0, // Base price
      large: 3 // $3 extra for large
    };
  };

  // Calculate final price based on portion size
  const getFinalPrice = () => {
    const basePrice = menuItem.price;
    const portionAdjustment = getPortionPricing()[customization.portionSize] || 0;
    return basePrice + portionAdjustment;
  };

  // Handle dietary restriction toggle
  const toggleDietaryRestriction = (restriction: string) => {
    setCustomization(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(r => r !== restriction)
        : [...prev.dietaryRestrictions, restriction]
    }));
  };

  // Handle modification toggle
  const toggleModification = (modification: string) => {
    setCustomization(prev => ({
      ...prev,
      modifications: prev.modifications.includes(modification)
        ? prev.modifications.filter(m => m !== modification)
        : [...prev.modifications, modification]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Customize Your Order</h2>
        
        {/* Menu Item Info */}
        <div className="border-b pb-4 mb-4">
          <h3 className="text-xl font-semibold">{menuItem.name}</h3>
          <p className="text-gray-600">Base Price: ${menuItem.price.toFixed(2)}</p>
        </div>

        {/* Dietary Restrictions */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Dietary Restrictions</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(getDietaryInfo()).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={customization.dietaryRestrictions.includes(key)}
                  onChange={() => toggleDietaryRestriction(key)}
                  className="rounded"
                />
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Portion Size */}
        {getCustomizationOptions().allowPortionSize && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Portion Size</h4>
            <div className="space-y-2">
              {(['small', 'regular', 'large'] as const).map(size => (
                <label key={size} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="portionSize"
                      value={size}
                      checked={customization.portionSize === size}
                      onChange={(e) => setCustomization(prev => ({ ...prev, portionSize: e.target.value as any }))}
                      className="text-blue-600"
                    />
                    <span className="capitalize font-medium">{size}</span>
                  </div>
                  <span className="text-gray-600">
                    ${(menuItem.price + (getPortionPricing()[size] || 0)).toFixed(2)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Common Modifications */}
        {getCustomizationOptions().allowModifications && getCustomizationOptions().commonModifications.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Modifications</h4>
            <div className="grid grid-cols-2 gap-2">
              {getCustomizationOptions().commonModifications.map(modification => (
                <label key={modification} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={customization.modifications.includes(modification)}
                    onChange={() => toggleModification(modification)}
                    className="rounded"
                  />
                  <span>{modification}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Special Instructions */}
        {getCustomizationOptions().allowSpecialInstructions && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Special Instructions</h4>
            <textarea
              value={customization.specialInstructions}
              onChange={(e) => setCustomization(prev => ({ ...prev, specialInstructions: e.target.value }))}
              placeholder="Any special requests or notes..."
              className="w-full p-3 border rounded-lg resize-none"
              rows={3}
            />
          </div>
        )}

        {/* Final Price */}
        <div className="border-t pt-4 mb-6">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Price:</span>
            <span className="text-green-600">${getFinalPrice().toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(customization, getFinalPrice())}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
