import API from './api';

const dashboardService = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      const response = await API.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get productivity data
  getProductivityData: async (timeframe = 'week') => {
    try {
      const response = await API.get(`/dashboard/productivity?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching productivity data:', error);
      throw error;
    }
  },

  // Get activity timeline
  getActivityTimeline: async (days = 7) => {
    try {
      const response = await API.get(`/dashboard/activity?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activity timeline:', error);
      throw error;
    }
  },

  // Get department wise stats
  getDepartmentStats: async () => {
    try {
      const response = await API.get('/dashboard/departments');
      return response.data;
    } catch (error) {
      console.error('Error fetching department stats:', error);
      throw error;
    }
  },

  // Get AI insights
  getAIInsights: async () => {
    try {
      const response = await API.get('/dashboard/insights');
      return response.data;
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      throw error;
    }
  }
};

export default dashboardService;