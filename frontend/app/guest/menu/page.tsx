'use client'

import { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import { formatCurrency } from '@/utils/currency'
import { Search, Filter, ShoppingCart, Star, Clock, IndianRupee } from 'lucide-react'
import api, { MenuItem } from '@/services/api'
import { useCart } from '@/contexts/CartContext'
import OrderCustomization from '@/components/OrderCustomization'
import PromotionBanner from '@/components/PromotionBanner'

// Categories mapping from backend to frontend
const categories = ["All", "breakfast", "lunch", "dinner", "beverages", "desserts", "snacks", "appetizers", "specials"]
const categoryLabels = {
  "All": "All Items",
  "breakfast": "Breakfast", 
  "lunch": "Lunch",
  "dinner": "Dinner",
  "beverages": "Beverages",
  "desserts": "Desserts",
  "snacks": "Snacks",
  "appetizers": "Appetizers",
  "specials": "Chef's Specials"
}

// Time-based meal suggestions
const getCurrentMealSuggestion = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 22) return 'dinner';
  return 'anytime';
}

const dietaryFilters = ["Vegetarian", "Vegan", "Gluten-Free"]

export default function MenuPage() {
  const { cartItems, addToCart, getTotalItems } = useCart()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDietary, setSelectedDietary] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('name')
  const [showFilters, setShowFilters] = useState(false)
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null)

  // Load menu items from API
  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await api.getMenuItems()
        
        if (response.success && response.data) {
          setMenuItems(response.data)
        } else {
          setError('Failed to load menu items')
        }
      } catch (err) {
        console.error('Error loading menu:', err)
        setError('Failed to load menu. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadMenuItems()
  }, [])

  // Filter menu items based on search, category, and dietary preferences
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    const matchesDietary = selectedDietary.length === 0 || 
                          selectedDietary.some(diet => {
                            if (diet === 'Vegetarian') return item.isVegetarian || false
                            if (diet === 'Vegan') return item.isVegan || false
                            if (diet === 'Gluten-Free') return item.isGlutenFree || false
                            return false
                          })
    
    return matchesSearch && matchesCategory && matchesDietary
  })

  // Sort filtered items
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'popular':
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || a.name.localeCompare(b.name)
      case 'name':
      default:
        return a.name.localeCompare(b.name)
    }
  })

  const handleAddToCart = (item: MenuItem) => {
    addToCart({
      _id: item._id,
      name: item.name,
      price: item.price * (1 - (item.discount || 0) / 100),
      image: item.image,
      preparationTime: item.preparationTime
    })
  }

  const handleCustomizeAndAdd = (item: MenuItem, customization: any, finalPrice: number) => {
    addToCart({
      _id: item._id,
      name: item.name,
      price: finalPrice,
      image: item.image,
      preparationTime: item.preparationTime,
      customization: customization
    })
    setCustomizingItem(null)
  }

  const toggleDietaryFilter = (filter: string) => {
    setSelectedDietary(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    )
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading menu...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Menu</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Our Menu</h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {/* Promotions Banner */}
          <PromotionBanner />
          
          {/* Meal Time Suggestion */}
          {selectedCategory !== 'All' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 text-white rounded-full p-2">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">
                      Perfect Time for {categoryLabels[selectedCategory as keyof typeof categoryLabels]}!
                    </h4>
                    <p className="text-sm text-blue-700">
                      We've filtered the menu to show the best options for this time of day.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All Items
                </button>
              </div>
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    <Filter className="w-5 h-5" />
                  </button>
                </div>

                <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Menu
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search dishes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {categoryLabels[category as keyof typeof categoryLabels] || category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dietary Filters */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dietary Preferences
                    </label>
                    <div className="space-y-2">
                      {dietaryFilters.map(filter => (
                        <label key={filter} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedDietary.includes(filter)}
                            onChange={() => toggleDietaryFilter(filter)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">{filter}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="name">Name (A-Z)</option>
                      <option value="price-low">Price (Low to High)</option>
                      <option value="price-high">Price (High to Low)</option>
                      <option value="popular">Most Popular</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="lg:w-3/4">
              <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600">
                  Showing {sortedItems.length} of {menuItems.length} items
                </p>
              </div>

              {sortedItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search terms</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sortedItems.map((item) => (
                    <div key={item._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      {/* Item Image */}
                      <div className="aspect-video relative bg-gray-200">
                        {item.image ? (
                          <Image
                            src={`http://localhost:5000${item.image}`}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <span className="text-4xl">🍽️</span>
                          </div>
                        )}
                        {item.isPopular && (
                          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                            Popular
                          </div>
                        )}
                        {(item.discount ?? 0) > 0 && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                            {item.discount}% OFF
                          </div>
                        )}
                      </div>

                      {/* Item Info */}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                            {item.name}
                          </h3>
                          <div className="text-right ml-2">
                            {(item.discount ?? 0) > 0 ? (
                              <>
                                <div className="text-sm text-gray-500 line-through">
                                  {formatCurrency(item.price)}
                                </div>
                                <div className="font-bold text-green-600">
                                  {formatCurrency(item.price * (1 - (item.discount ?? 0) / 100))}
                                </div>
                              </>
                            ) : (
                              <div className="font-bold text-gray-900">
                                {formatCurrency(item.price)}
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {item.description}
                        </p>

                        {/* Dietary badges */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.isVegetarian && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Vegetarian
                            </span>
                          )}
                          {item.isVegan && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Vegan
                            </span>
                          )}
                          {item.isGlutenFree && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Gluten-Free
                            </span>
                          )}
                          {item.spiceLevel !== 'none' && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              {item.spiceLevel}
                            </span>
                          )}
                        </div>

                        {/* Preparation time and calories */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {item.preparationTime} min
                          </div>
                          {item.calories && (
                            <div>
                              {item.calories} cal
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex space-x-2">
                          <Link
                            href={`/guest/menu/${item._id}`}
                            className="flex-1 bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => setCustomizingItem(item)}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Customize & Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customization Modal */}
        {customizingItem && (
          <OrderCustomization
            menuItem={customizingItem}
            isOpen={!!customizingItem}
            onClose={() => setCustomizingItem(null)}
            onConfirm={(customization, finalPrice) => handleCustomizeAndAdd(customizingItem, customization, finalPrice)}
          />
        )}
      </div>
    </Layout>
  )
}
