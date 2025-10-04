'use client';

import React, { useState, useEffect } from 'react';

interface BannerSettings {
  maxBanners: number;
  autoRotate: boolean;
  rotationInterval: number;
  showDots: boolean;
  showArrows: boolean;
  animationType: 'fade' | 'slide';
}

export default function BannerSettingsPage() {
  const [settings, setSettings] = useState<BannerSettings>({
    maxBanners: 5,
    autoRotate: true,
    rotationInterval: 5000,
    showDots: true,
    showArrows: true,
    animationType: 'fade'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      // In a real app, you would fetch settings from the backend
      // For now, we'll use the default settings
      setSettings({
        maxBanners: 5,
        autoRotate: true,
        rotationInterval: 5000,
        showDots: true,
        showArrows: true,
        animationType: 'fade'
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      // In a real app, you would save settings to the backend
      // For now, we'll just show a success message
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Banner Settings</h1>
            <p className="text-gray-600">Configure how banners are displayed on your homepage</p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              <div className="flex items-center">
                <span className="mr-2">✅</span>
                {success}
              </div>
            </div>
          )}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <div className="flex items-center">
                <span className="mr-2">❌</span>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Banners</label>
                <input
                  type="number"
                  name="maxBanners"
                  value={settings.maxBanners}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <p className="mt-1 text-sm text-gray-500">Maximum number of banners to display at once</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rotation Interval (ms)</label>
                <input
                  type="number"
                  name="rotationInterval"
                  value={settings.rotationInterval}
                  onChange={handleInputChange}
                  min="1000"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <p className="mt-1 text-sm text-gray-500">Time between banner rotations in milliseconds</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Animation Type</label>
              <select
                name="animationType"
                value={settings.animationType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">Animation effect when switching between banners</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Display Options</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="autoRotate"
                    checked={settings.autoRotate}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Auto-rotate banners
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="showDots"
                    checked={settings.showDots}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Show navigation dots
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="showArrows"
                    checked={settings.showArrows}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Show navigation arrows
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
