'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/utils/currency';
import { ArrowLeft, Clock, Star, Utensils, Plus, Minus } from 'lucide-react';
import { MenuItem } from '@/services/api';

export default function MenuItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadMenuItem();
  }, [params.id]);

  const loadMenuItem = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would fetch from the API
      // For now, we'll use mock data
      const mockItem: MenuItem = {
        _id: params.id as string,
        name: 'Grilled Chicken with Herbs',
        description: 'Tender grilled chicken breast marinated with fresh herbs and spices, served with seasonal vegetables and your choice of side.',
        price: 18.99,
        category: 'dinner',
        mealType: 'dinner',
        availableHours: {
          start: '17:00',
          end: '22:00'
        },
        image: '/menu/chicken.jpg',
        isAvailable: true,
        ingredients: ['Chicken breast', 'Fresh herbs', 'Olive oil', 'Garlic', 'Lemon'],
        allergens: ['None'],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: true,
        spiceLevel: 'mild',
        preparationTime: 25,
        calories: 350,
        isPopular: true,
        discount: 0,
        tags: ['healthy', 'protein', 'grilled'],
        createdBy: 'admin',
        dietaryInfo: {
          vegetarian: false,
          vegan: false,
          glutenFree: true,
          nutFree: true,
          dairyFree: true,
          halal: false,
          kosher: false
        },
        customizationOptions: {
          allowPortionSize: true,
          allowModifications: true,
          allowSpecialInstructions: true,
          commonModifications: ['Extra spicy', 'No salt', 'Well done', 'Medium rare']
        },
        portionPricing: {
          small: -3,
          regular: 0,
          large: 4
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setMenuItem(mockItem);
    } catch (err) {
      console.error('Error loading menu item:', err);
      setError('Failed to load menu item. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!menuItem) return;
    
    addToCart({
      _id: menuItem._id,
      name: menuItem.name,
      price: menuItem.price * (1 - (menuItem.discount || 0) / 100),
      image: menuItem.image,
      preparationTime: menuItem.preparationTime
    });
    
    // Show success message (in a real app, you'd use a toast)
    alert('Item added to cart!');
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading menu item...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !menuItem) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Menu Item Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'The requested menu item could not be found.'}</p>
            <Link
              href="/guest/menu"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Menu
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{menuItem.name}</h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image */}
            <div className="aspect-video lg:aspect-square relative bg-gray-200 rounded-lg overflow-hidden">
              {menuItem.image ? (
                <Image
                  src={`http://localhost:5000${menuItem.image}`}
                  alt={menuItem.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <span className="text-6xl">🍽️</span>
                </div>
              )}
              {menuItem.isPopular && (
                <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Popular
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold text-gray-900">{menuItem.name}</h2>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(menuItem.price * (1 - (menuItem.discount || 0) / 100))}
                  </div>
                </div>
                <p className="text-lg text-gray-600">{menuItem.description}</p>
              </div>

              {/* Dietary Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Dietary Information</h3>
                <div className="flex flex-wrap gap-2">
                  {menuItem.isVegetarian && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      Vegetarian
                    </span>
                  )}
                  {menuItem.isVegan && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      Vegan
                    </span>
                  )}
                  {menuItem.isGlutenFree && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      Gluten-Free
                    </span>
                  )}
                  {menuItem.spiceLevel !== 'none' && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                      {menuItem.spiceLevel}
                    </span>
                  )}
                </div>
              </div>

              {/* Nutrition & Prep Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">{menuItem.preparationTime} min</span>
                </div>
                {menuItem.calories && (
                  <div className="flex items-center space-x-2">
                    <Utensils className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">{menuItem.calories} cal</span>
                  </div>
                )}
              </div>

              {/* Ingredients */}
              {menuItem.ingredients.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h3>
                  <p className="text-gray-600">{menuItem.ingredients.join(', ')}</p>
                </div>
              )}

              {/* Allergens */}
              {menuItem.allergens.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Allergens</h3>
                  <p className="text-gray-600">{menuItem.allergens.join(', ')}</p>
                </div>
              )}

              {/* Order Section */}
              <div className="border-t pt-6">
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-lg font-medium text-gray-900">Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Add to Cart - {formatCurrency(menuItem.price * (1 - (menuItem.discount || 0) / 100) * quantity)}
                  </button>
                  <Link
                    href="/guest/cart"
                    className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
