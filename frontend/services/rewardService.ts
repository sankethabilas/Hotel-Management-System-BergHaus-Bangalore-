import api from './api';

// Get all rewards (admin)
export const getAllRewards = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.status) params.append('status', filters.status);
  if (filters.minTier) params.append('minTier', filters.minTier);

  const response = await api.get(`/rewards?${params.toString()}`);
  return response.data;
};

// Get single reward by ID
export const getRewardById = async (id) => {
  const response = await api.get(`/rewards/${id}`);
  return response.data;
};

// Create new reward (admin)
export const createReward = async (rewardData) => {
  const response = await api.post('/rewards', rewardData);
  return response.data;
};

// Update reward (admin)
export const updateReward = async (id, rewardData) => {
  const response = await api.put(`/rewards/${id}`, rewardData);
  return response.data;
};

// Delete reward (admin)
export const deleteReward = async (id) => {
  const response = await api.delete(`/rewards/${id}`);
  return response.data;
};

// Get rewards catalog (guest-facing)
export const getRewardsCatalog = async (category = null) => {
  const params = category ? `?category=${category}` : '';
  const response = await api.get(`/rewards/catalog${params}`);
  return response.data;
};

// Get reward statistics (admin)
export const getRewardStats = async () => {
  const response = await api.get('/rewards/stats');
  return response.data;
};

const rewardService = {
  getAllRewards,
  getRewardById,
  createReward,
  updateReward,
  deleteReward,
  getRewardsCatalog,
  getRewardStats
};

export default rewardService;
