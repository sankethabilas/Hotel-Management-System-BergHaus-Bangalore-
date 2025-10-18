import api from './api';

export const automatedRulesService = {
  // Get all rules
  getAllRules: async (isActive, trigger) => {
    const params = {};
    if (isActive !== undefined) params.isActive = isActive;
    if (trigger) params.trigger = trigger;
    const response = await api.get('/automated-rules', { params });
    return response.data;
  },

  // Get rule by ID
  getRuleById: async (id) => {
    const response = await api.get(`/automated-rules/${id}`);
    return response.data;
  },

  // Create rule
  createRule: async (data) => {
    const response = await api.post('/automated-rules', data);
    return response.data;
  },

  // Update rule
  updateRule: async (id, data) => {
    const response = await api.put(`/automated-rules/${id}`, data);
    return response.data;
  },

  // Delete rule
  deleteRule: async (id) => {
    const response = await api.delete(`/automated-rules/${id}`);
    return response.data;
  },

  // Test rule
  testRule: async (id, testData) => {
    const response = await api.post(`/automated-rules/${id}/test`, testData);
    return response.data;
  },

  // Execute rule manually
  executeRuleManually: async (id, data) => {
    const response = await api.post(`/automated-rules/${id}/execute`, data);
    return response.data;
  },

  // Get rule executions
  getRuleExecutions: async (filters) => {
    const response = await api.get('/automated-rules/executions/history', { params: filters });
    return response.data;
  },

  // Get rule statistics
  getRuleStats: async () => {
    const response = await api.get('/automated-rules/stats');
    return response.data;
  }
};
