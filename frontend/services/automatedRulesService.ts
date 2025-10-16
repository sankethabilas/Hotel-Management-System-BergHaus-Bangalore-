import api from './api';

export const automatedRulesService = {
  // Get all rules
  getAllRules: async (isActive?: boolean, trigger?: string) => {
    const params: any = {};
    if (isActive !== undefined) params.isActive = isActive;
    if (trigger) params.trigger = trigger;
    const response = await api.get('/automated-rules', { params });
    return response.data;
  },

  // Get rule by ID
  getRuleById: async (id: string) => {
    const response = await api.get(`/automated-rules/${id}`);
    return response.data;
  },

  // Create rule
  createRule: async (data: any) => {
    const response = await api.post('/automated-rules', data);
    return response.data;
  },

  // Update rule
  updateRule: async (id: string, data: any) => {
    const response = await api.put(`/automated-rules/${id}`, data);
    return response.data;
  },

  // Delete rule
  deleteRule: async (id: string) => {
    const response = await api.delete(`/automated-rules/${id}`);
    return response.data;
  },

  // Test rule
  testRule: async (id: string, testData: any) => {
    const response = await api.post(`/automated-rules/${id}/test`, testData);
    return response.data;
  },

  // Execute rule manually
  executeRuleManually: async (id: string, data: any) => {
    const response = await api.post(`/automated-rules/${id}/execute`, data);
    return response.data;
  },

  // Get rule executions
  getRuleExecutions: async (filters?: any) => {
    const response = await api.get('/automated-rules/executions/history', { params: filters });
    return response.data;
  },

  // Get rule statistics
  getRuleStats: async () => {
    const response = await api.get('/automated-rules/stats');
    return response.data;
  }
};
