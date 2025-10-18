'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Gift, Search, Filter } from 'lucide-react';
import rewardService from '../../services/rewardService';

const RewardsCatalog = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'room-upgrade',
    pointsCost: '',
    termsAndConditions: '',
    minTierRequired: '',
    stockAvailable: '',
    maxRedemptionsPerGuest: '',
    validityDays: '90',
    status: 'active'
  });

  useEffect(() => {
    fetchRewards();
    fetchStats();
  }, [filterCategory, filterStatus]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterCategory) filters.category = filterCategory;
      if (filterStatus) filters.status = filterStatus;

      const response = await rewardService.getAllRewards(filters);
      setRewards(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching rewards:', err);
      setError('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await rewardService.getRewardStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'room-upgrade',
      pointsCost: '',
      termsAndConditions: '',
      minTierRequired: '',
      stockAvailable: '',
      maxRedemptionsPerGuest: '',
      validityDays: '90',
      status: 'active'
    });
    setEditingReward(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const rewardData = {
        ...formData,
        pointsCost: parseInt(formData.pointsCost),
        stockAvailable: formData.stockAvailable ? parseInt(formData.stockAvailable) : null,
        maxRedemptionsPerGuest: formData.maxRedemptionsPerGuest ? parseInt(formData.maxRedemptionsPerGuest) : null,
        validityDays: parseInt(formData.validityDays),
        minTierRequired: formData.minTierRequired || null
      };

      if (editingReward) {
        await rewardService.updateReward(editingReward._id, rewardData);
      } else {
        await rewardService.createReward(rewardData);
      }

      setShowModal(false);
      resetForm();
      fetchRewards();
      fetchStats();
    } catch (err) {
      console.error('Error saving reward:', err);
      alert(err.response?.data?.message || 'Failed to save reward');
    }
  };

  const handleEdit = (reward) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description,
      category: reward.category,
      pointsCost: reward.pointsCost.toString(),
      termsAndConditions: reward.termsAndConditions,
      minTierRequired: reward.minTierRequired || '',
      stockAvailable: reward.stockAvailable ? reward.stockAvailable.toString() : '',
      maxRedemptionsPerGuest: reward.maxRedemptionsPerGuest ? reward.maxRedemptionsPerGuest.toString() : '',
      validityDays: reward.validityDays.toString(),
      status: reward.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reward?')) return;

    try {
      await rewardService.deleteReward(id);
      fetchRewards();
      fetchStats();
    } catch (err) {
      console.error('Error deleting reward:', err);
      alert(err.response?.data?.message || 'Failed to delete reward');
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'room-upgrade': 'Room Upgrade',
      'dining-voucher': 'Dining Voucher',
      'discount-voucher': 'Discount Voucher'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'room-upgrade': 'bg-purple-100 text-purple-800',
      'dining-voucher': 'bg-green-100 text-green-800',
      'discount-voucher': 'bg-blue-100 text-blue-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredRewards = rewards.filter(reward =>
    reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reward.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rewards Catalog Management</h2>
          <p className="text-gray-600 mt-1">Create and manage redemption rewards</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add New Reward
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Rewards</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <div className="text-sm text-green-600">Active Rewards</div>
            <div className="text-2xl font-bold text-green-700">{stats.active}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow">
            <div className="text-sm text-red-600">Inactive Rewards</div>
            <div className="text-2xl font-bold text-red-700">{stats.inactive}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg shadow">
            <div className="text-sm text-purple-600">Categories</div>
            <div className="text-2xl font-bold text-purple-700">{stats.byCategory?.length || 0}</div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search rewards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="room-upgrade">Room Upgrade</option>
            <option value="dining-voucher">Dining Voucher</option>
            <option value="discount-voucher">Discount Voucher</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={() => {
              setFilterCategory('');
              setFilterStatus('');
              setSearchTerm('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Rewards List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading rewards...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : filteredRewards.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 text-gray-600 px-4 py-8 rounded-lg text-center">
          <Gift size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">No rewards found</p>
          <p className="text-sm mt-2">Create your first reward to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map(reward => (
            <div key={reward._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(reward.category)}`}>
                      {getCategoryLabel(reward.category)}
                    </span>
                    {reward.status === 'inactive' && (
                      <span className="ml-2 inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(reward)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(reward._id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{reward.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{reward.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Points Cost:</span>
                    <span className="font-semibold text-blue-600">{reward.pointsCost.toLocaleString()} pts</span>
                  </div>
                  
                  {reward.minTierRequired && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Min Tier:</span>
                      <span className="font-medium">{reward.minTierRequired}</span>
                    </div>
                  )}

                  {reward.stockAvailable !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock:</span>
                      <span className={`font-medium ${reward.stockAvailable < 5 ? 'text-red-600' : 'text-green-600'}`}>
                        {reward.stockAvailable} available
                      </span>
                    </div>
                  )}

                  {reward.maxRedemptionsPerGuest && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max/Guest:</span>
                      <span className="font-medium">{reward.maxRedemptionsPerGuest}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Validity:</span>
                    <span className="font-medium">{reward.validityDays} days</span>
                  </div>
                </div>

                {reward.termsAndConditions && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 line-clamp-2">
                      <strong>T&C:</strong> {reward.termsAndConditions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingReward ? 'Edit Reward' : 'Create New Reward'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reward Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Deluxe Room Upgrade"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the reward..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="room-upgrade">Room Upgrade</option>
                    <option value="dining-voucher">Dining Voucher</option>
                    <option value="discount-voucher">Discount Voucher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points Cost *
                  </label>
                  <input
                    type="number"
                    name="pointsCost"
                    value={formData.pointsCost}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Tier Required
                  </label>
                  <select
                    name="minTierRequired"
                    value={formData.minTierRequired}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Tiers</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Available
                  </label>
                  <input
                    type="number"
                    name="stockAvailable"
                    value={formData.stockAvailable}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Redemptions Per Guest
                  </label>
                  <input
                    type="number"
                    name="maxRedemptionsPerGuest"
                    value={formData.maxRedemptionsPerGuest}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Validity (Days) *
                  </label>
                  <input
                    type="number"
                    name="validityDays"
                    value={formData.validityDays}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 90"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terms & Conditions
                  </label>
                  <textarea
                    name="termsAndConditions"
                    value={formData.termsAndConditions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter terms and conditions..."
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingReward ? 'Update Reward' : 'Create Reward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsCatalog;
