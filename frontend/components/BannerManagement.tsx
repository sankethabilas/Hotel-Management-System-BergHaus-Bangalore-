'use client';

import React, { useState, useEffect } from 'react';

interface Banner {
  _id: string;
  title: string;
  description: string;
  image: string;
  type: 'deal' | 'promotion' | 'announcement' | 'feature';
  isActive: boolean;
  priority: number;
  buttonText: string;
  buttonLink: string;
  startDate: Date;
  endDate?: Date;
  createdBy: {
    username: string;
    fullName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BannerManagement: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    type: 'deal' as const,
    isActive: true,
    priority: 0,
    buttonText: 'Learn More',
    buttonLink: '/guest/menu',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/banners/admin', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        setBanners(data.data);
      } else {
        setError('Failed to load banners');
      }
    } catch (error: any) {
      console.error('Error loading banners:', error);
      setError('Failed to load banners');
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
    setError('');
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
        setSuccess('Image uploaded successfully!');
      } else {
        setError(data.message || 'Failed to upload image');
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
      title: '',
      description: '',
      image: '',
      type: 'deal',
      isActive: true,
      priority: 0,
      buttonText: 'Learn More',
      buttonLink: '/guest/menu',
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    });
    setEditingBanner(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    // Validate required fields
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.image) {
      setError('Please upload a banner image');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        priority: parseInt(formData.priority.toString()) || 0,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : null
      };

      const url = editingBanner 
        ? `http://localhost:5000/api/banners/${editingBanner._id}`
        : 'http://localhost:5000/api/banners';
      
      const method = editingBanner ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(editingBanner ? 'Banner updated successfully!' : 'Banner created successfully!');
        await loadBanners();
        resetForm();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to save banner');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error: any) {
      console.error('Error saving banner:', error);
      setError(error.message || 'Failed to save banner');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (banner: Banner) => {
    setFormData({
      title: banner.title,
      description: banner.description,
      image: banner.image,
      type: banner.type,
      isActive: banner.isActive,
      priority: banner.priority,
      buttonText: banner.buttonText,
      buttonLink: banner.buttonLink,
      startDate: new Date(banner.startDate).toISOString().split('T')[0],
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : ''
    });
    setEditingBanner(banner);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/banners/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Banner deleted successfully!');
        await loadBanners();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to delete banner');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      setError('Failed to delete banner');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/banners/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Banner status updated successfully!');
        await loadBanners();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update banner status');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error toggling banner status:', error);
      setError('Failed to update banner status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deal': return '🔥';
      case 'promotion': return '🎉';
      case 'announcement': return '📢';
      case 'feature': return '⭐';
      default: return '📋';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deal': return 'bg-red-100 text-red-800';
      case 'promotion': return 'bg-purple-100 text-purple-800';
      case 'announcement': return 'bg-blue-100 text-blue-800';
      case 'feature': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Banner Management</h2>
          <p className="text-gray-600">Create and manage promotional banners for the homepage</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200 flex items-center"
        >
          ✨ Create Banner
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <span className="mr-2">✅</span>
            {success}
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <span className="mr-2">❌</span>
            {error}
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            {editingBanner ? '✏️ Edit Banner' : '✨ Create New Banner'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Hot Deal: 50% Off Today!"
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
                  <option value="deal">🔥 Hot Deal</option>
                  <option value="promotion">🎉 Promotion</option>
                  <option value="announcement">📢 Announcement</option>
                  <option value="feature">⭐ Featured Item</option>
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
                placeholder="Describe your banner content..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100"
              />
              {uploadingImage && (
                <div className="mt-2 flex items-center text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <p className="text-sm">Uploading image...</p>
                </div>
              )}
              {formData.image && !uploadingImage && (
                <div className="mt-2">
                  <p className="text-sm text-green-600 mb-1">✅ Image uploaded successfully</p>
                  <img 
                    src={`http://localhost:5000${formData.image}`} 
                    alt="Banner preview" 
                    className="w-full max-w-md h-32 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                <input
                  type="text"
                  name="buttonText"
                  value={formData.buttonText}
                  onChange={handleInputChange}
                  placeholder="e.g., Shop Now, Learn More"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                <input
                  type="text"
                  name="buttonLink"
                  value={formData.buttonLink}
                  onChange={handleInputChange}
                  placeholder="/guest/menu"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <input
                  type="number"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="0 = lowest, higher = more priority"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Active (visible on homepage)
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
                disabled={uploadingImage || isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {(uploadingImage || isSubmitting) && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {uploadingImage ? 'Uploading...' : isSubmitting ? 'Saving...' : (editingBanner ? 'Update Banner' : 'Create Banner')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Banners List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading banners...</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Banner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {banners.map((banner) => (
                  <tr key={banner._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {banner.image && (
                          <img 
                            src={`http://localhost:5000${banner.image}`} 
                            alt={banner.title}
                            className="w-16 h-12 object-cover rounded-md mr-4"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{banner.title}</div>
                          <div className="text-sm text-gray-500">{banner.description.substring(0, 60)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(banner.type)}`}>
                        <span className="mr-1">{getTypeIcon(banner.type)}</span>
                        {banner.type.charAt(0).toUpperCase() + banner.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        banner.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {banner.isActive ? '✅ Active' : '❌ Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-medium">{banner.priority}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>Start: {new Date(banner.startDate).toLocaleDateString()}</div>
                        {banner.endDate && (
                          <div>End: {new Date(banner.endDate).toLocaleDateString()}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(banner._id)}
                        className={`${banner.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {banner.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(banner._id)}
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
          {banners.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No banners found</h3>
              <p className="text-gray-500">Create your first banner to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BannerManagement;