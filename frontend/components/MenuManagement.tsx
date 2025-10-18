'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  ingredients: string[];
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spiceLevel: string;
  preparationTime: number;
  calories?: number;
  isPopular: boolean;
  discount: number;
  tags: string[];
}

const MenuManagement: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'breakfast',
    mealType: 'anytime',
    availableHoursStart: '00:00',
    availableHoursEnd: '23:59',
    image: '',
    isAvailable: true,
    ingredients: '',
    allergens: '',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: 'none',
    preparationTime: '',
    calories: '',
    isPopular: false,
    discount: 0,
    tags: '',
    // Portion pricing
    portionPricingSmall: '',
    portionPricingRegular: '0',
    portionPricingLarge: ''
  });

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadMenuItems();
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  const loadMenuItems = async () => {
    try {
      setIsLoading(true);
      setError(''); // Clear previous errors
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/menu', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Menu items response:', data);
      
      // Ensure we always have valid menu items array
      const items = Array.isArray(data.data) ? data.data : [];
      setMenuItems(items);
      
    } catch (error: any) {
      console.error('Error loading menu items:', error);
      setError('Failed to load menu items. ' + (error.message || 'Please try again.'));
      setMenuItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.imagePath }));
      } else {
        setError('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'breakfast',
      mealType: 'anytime',
      availableHoursStart: '00:00',
      availableHoursEnd: '23:59',
      image: '',
      isAvailable: true,
      ingredients: '',
      allergens: '',
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      spiceLevel: 'none',
      preparationTime: '',
      calories: '',
      isPopular: false,
      discount: 0,
      tags: '',
      // Portion pricing
      portionPricingSmall: '',
      portionPricingRegular: '0',
      portionPricingLarge: ''
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        preparationTime: parseInt(formData.preparationTime) || 0,
        calories: formData.calories ? parseInt(formData.calories) : undefined,
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i),
        allergens: formData.allergens.split(',').map(a => a.trim()).filter(a => a),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        availableHours: {
          start: formData.availableHoursStart,
          end: formData.availableHoursEnd
        },
        portionPricing: {
          small: parseFloat(formData.portionPricingSmall) || 0,
          regular: parseFloat(formData.portionPricingRegular) || 0,
          large: parseFloat(formData.portionPricingLarge) || 0
        }
      };

      const url = editingItem 
        ? `http://localhost:5000/api/menu/${editingItem._id}`
        : 'http://localhost:5000/api/menu';
      
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(editingItem ? 'Menu item updated successfully!' : 'Menu item created successfully!');
        await loadMenuItems();
        resetForm();
      } else {
        setError(data.message || 'Failed to save menu item');
      }
    } catch (error: any) {
      console.error('Error saving menu item:', error);
      setError(error.message || 'Failed to save menu item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    // If already editing this item, cancel edit
    if (editingItem && editingItem._id === item._id) {
      setEditingItem(null);
      setShowAddForm(false);
      resetForm();
      return;
    }
    
    // Start editing this item
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      mealType: (item as any).mealType || 'anytime',
      availableHoursStart: (item as any).availableHours?.start || '00:00',
      availableHoursEnd: (item as any).availableHours?.end || '23:59',
      image: item.image || '',
      isAvailable: item.isAvailable,
      ingredients: item.ingredients?.join(', ') || '',
      allergens: item.allergens?.join(', ') || '',
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      isGlutenFree: item.isGlutenFree,
      spiceLevel: item.spiceLevel,
      preparationTime: item.preparationTime?.toString() || '',
      calories: item.calories?.toString() || '',
      isPopular: item.isPopular,
      discount: item.discount,
      tags: item.tags?.join(', ') || '',
      // Portion pricing
      portionPricingSmall: (item as any).portionPricing?.small?.toString() || '',
      portionPricingRegular: (item as any).portionPricing?.regular?.toString() || '0',
      portionPricingLarge: (item as any).portionPricing?.large?.toString() || ''
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/menu/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Menu item deleted successfully!');
        await loadMenuItems();
      } else {
        setError(data.message || 'Failed to delete menu item');
      }
    } catch (error: any) {
      console.error('Error deleting menu item:', error);
      setError('Failed to delete menu item');
    }
  };

  const handleToggleAvailability = async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const item = menuItems.find(item => item._id === id);
      if (!item) return;

      const response = await fetch(`http://localhost:5000/api/menu/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: !item.isAvailable })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Availability updated successfully!');
        await loadMenuItems();
      } else {
        setError(data.message || 'Failed to update availability');
      }
    } catch (error: any) {
      console.error('Error toggling availability:', error);
      setError('Failed to update item availability');
    }
  };

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          <div className="flex items-center justify-between">
            <span>✅ {success}</span>
            <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700">×</button>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex items-center justify-between">
            <span>❌ {error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">×</button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Menu Items ({menuItems.length})</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200 font-semibold"
        >
          + Add New Item
        </button>
      </div>

      {/* Add New Item Form - Only for new items */}
      {showAddForm && !editingItem && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Add New Menu Item</h3>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="beverages">Beverages</option>
                  <option value="desserts">Desserts</option>
                  <option value="snacks">Snacks</option>
                  <option value="appetizers">Appetizers</option>
                  <option value="specials">Chef's Specials</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preparation Time (minutes) *</label>
                <input
                  type="number"
                  name="preparationTime"
                  value={formData.preparationTime}
                  onChange={handleInputChange}
                  required
                  min="1"
                  placeholder="e.g., 15"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image Upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {uploadingImage && (
                <p className="text-sm text-blue-600 mt-2">Uploading image...</p>
              )}
              {formData.image && (
                <div className="mt-3">
                  <img 
                    src={formData.image.startsWith('data:') ? formData.image : `http://localhost:5000${formData.image}`}
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-md border-2 border-gray-200"
                  />
                </div>
              )}
            </div>

            {/* Portion Pricing */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Portion Size Pricing</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Small Portion (Rs)</label>
                  <input
                    type="number"
                    name="portionPricingSmall"
                    value={formData.portionPricingSmall}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="e.g., -50 (discount)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Negative value = discount from base price</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Regular Portion (Rs)</label>
                  <input
                    type="number"
                    name="portionPricingRegular"
                    value={formData.portionPricingRegular}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0 (base price)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Base price (usually 0)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Large Portion (Rs)</label>
                  <input
                    type="number"
                    name="portionPricingLarge"
                    value={formData.portionPricingLarge}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="e.g., 100 (extra charge)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Positive value = extra charge</p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Example:</strong> If base price is Rs 500, Small (-50) = Rs 450, Regular (0) = Rs 500, Large (+100) = Rs 600
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Available
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isPopular"
                  checked={formData.isPopular}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Popular
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
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
                {isSubmitting ? 'Saving...' : 'Create Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Item Form - Only for editing existing items */}
      {showAddForm && editingItem && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Edit Menu Item</h3>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="beverages">Beverages</option>
                  <option value="desserts">Desserts</option>
                  <option value="snacks">Snacks</option>
                  <option value="appetizers">Appetizers</option>
                  <option value="specials">Chef's Specials</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preparation Time (minutes) *</label>
                <input
                  type="number"
                  name="preparationTime"
                  value={formData.preparationTime}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image Upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {uploadingImage && (
                <p className="text-sm text-blue-600 mt-2">Uploading image...</p>
              )}
              {formData.image && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                  <img 
                    src={formData.image.startsWith('data:') ? formData.image : `http://localhost:5000${formData.image}`}
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-md border-2 border-gray-200"
                  />
                </div>
              )}
              {!formData.image && (
                <p className="text-sm text-gray-500 mt-2">No image uploaded yet. Add one to make this item more appealing!</p>
              )}
            </div>

            {/* Portion Pricing */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Portion Size Pricing</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Small Portion (Rs)</label>
                  <input
                    type="number"
                    name="portionPricingSmall"
                    value={formData.portionPricingSmall}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="e.g., -50 (discount)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Negative value = discount from base price</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Regular Portion (Rs)</label>
                  <input
                    type="number"
                    name="portionPricingRegular"
                    value={formData.portionPricingRegular}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0 (base price)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Base price (usually 0)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Large Portion (Rs)</label>
                  <input
                    type="number"
                    name="portionPricingLarge"
                    value={formData.portionPricingLarge}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="e.g., 100 (extra charge)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Positive value = extra charge</p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Example:</strong> If base price is Rs 500, Small (-50) = Rs 450, Regular (0) = Rs 500, Large (+100) = Rs 600
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Available
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isPopular"
                  checked={formData.isPopular}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Popular
              </label>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Dietary Preferences</h4>
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isVegetarian"
                    checked={formData.isVegetarian}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  🥬 Vegetarian
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isVegan"
                    checked={formData.isVegan}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  🌱 Vegan
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isGlutenFree"
                    checked={formData.isGlutenFree}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  🌾 Gluten-Free
                </label>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200 font-semibold disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setShowAddForm(false);
                  resetForm();
                }}
                className="bg-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-400 transition duration-200 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Items List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu items...</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {menuItems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.image && (
                          <img 
                            src={`http://localhost:5000${item.image}`} 
                            alt={item.name || 'Menu item'}
                            className="w-12 h-12 object-cover rounded-md mr-4"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name || 'Unnamed Item'}</div>
                          <div className="text-sm text-gray-500">{item.description || 'No description'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {item.category || 'uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Rs. {item.price || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleAvailability(item._id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Toggle
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {menuItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items found</h3>
              <p className="text-gray-500">Add your first menu item to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
