'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import { formatCurrency } from '@/utils/currency'
import { ArrowLeft, Clock, Star, Users, ShoppingCart } from 'lucide-react'
import api, { MenuItem } from '@/services/api'

export default function MenuItemDetail() {
  const params = useParams()
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const loadMenuItem = async () => {
      try {
        if (!params.id) return
        
        setLoading(true)
        setError(null)
        
        const response = await api.getMenuItemById(params.id as string)
        
        if (response.success && response.data) {
          setMenuItem(response.data)
        } else {
          setError('Menu item not found')
        }
      } catch (err) {
        console.error('Error loading menu item:', err)
        setError('Failed to load menu item. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadMenuItem()
  }, [params.id])

  const addToCart = () => {
    if (menuItem) {
      // Add to cart logic here
      console.log('Added to cart:', menuItem.name, 'Quantity:', quantity)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading menu item...</p>
          </div>
        </div>
      </Layout>
    )
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
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/guest/menu" className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Link>
            <nav className="text-sm text-gray-600">
              <span className="text-gray-600">{menuItem.category}</span>
              <span className="mx-2">›</span>
              <span className="text-gray-900">{menuItem.name}</span>
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image */}
            <div className="space-y-4">
              <div className="aspect-square relative bg-gray-200 rounded-lg overflow-hidden">
                {menuItem.image ? (
                  <Image
                    src={menuItem.image}
                    alt={menuItem.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <span className="text-8xl">🍽️</span>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {menuItem.isPopular && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full font-medium">
                    ⭐ Popular
                  </span>
                )}
                {menuItem.isVegetarian && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    🌱 Vegetarian
                  </span>
                )}
                {menuItem.isVegan && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    🌿 Vegan
                  </span>
                )}
                {menuItem.isGlutenFree && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    🌾 Gluten-Free
                  </span>
                )}
                {menuItem.spiceLevel !== 'none' && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                    🌶️ {menuItem.spiceLevel}
                  </span>
                )}
              </div>

              {/* Title and Price */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{menuItem.name}</h1>
                <div className="flex items-center space-x-4">
                  {(menuItem.discount ?? 0) > 0 ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(menuItem.price * (1 - (menuItem.discount ?? 0) / 100))}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        {formatCurrency(menuItem.price)}
                      </span>
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                        {menuItem.discount}% OFF
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(menuItem.price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{menuItem.description}</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{menuItem.preparationTime} minutes</span>
                </div>
                {menuItem.calories && (
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">🔥</span>
                    <span>{menuItem.calories} calories</span>
                  </div>
                )}
              </div>

              {/* Ingredients */}
              {menuItem.ingredients.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ingredients</h3>
                  <div className="flex flex-wrap gap-2">
                    {menuItem.ingredients.map((ingredient, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Allergens */}
              {menuItem.allergens.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Allergens</h3>
                  <div className="flex flex-wrap gap-2">
                    {menuItem.allergens.map((allergen, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full"
                      >
                        ⚠️ {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add to Order</h3>
                  <div className="flex items-center space-x-3">
                    <label htmlFor="quantity" className="text-sm text-gray-600">Quantity:</label>
                    <select 
                      id="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="border border-gray-300 rounded px-3 py-1 text-sm"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(
                      (menuItem.price * (1 - (menuItem.discount ?? 0) / 100)) * quantity
                    )}
                  </span>
                </div>

                <button
                  onClick={addToCart}
                  disabled={!menuItem.isAvailable}
                  className={`w-full flex items-center justify-center py-3 px-6 rounded-lg font-medium transition-colors ${
                    menuItem.isAvailable
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {menuItem.isAvailable ? 'Add to Cart' : 'Currently Unavailable'}
                </button>

                {!menuItem.isAvailable && (
                  <p className="text-sm text-red-600 mt-2 text-center">
                    This item is currently not available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}