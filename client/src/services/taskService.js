import API from './api';
import toast from 'react-hot-toast';

const taskService = {
  // Get all tasks
  getAll: async () => {
    try {
      const response = await API.get('/tasks');
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch tasks');
      throw error;
    }
  },

  // Get tasks by employee
  getByEmployee: async (employeeId) => {
    try {
      const response = await API.get(`/tasks/employee/${employeeId}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch employee tasks');
      throw error;
    }
  },

  // Create task
  create: async (taskData) => {
    try {
      const response = await API.post('/tasks', taskData);
      toast.success('Task created successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to create task');
      throw error;
    }
  },

  // Update task status
  updateStatus: async (id, status, employeeId) => {
    try {
      const response = await API.put(`/tasks/${id}/status`, { status, employeeId });
      toast.success(`Task marked as ${status}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to update task status');
      throw error;
    }
  },

  // Update task
  update: async (id, taskData) => {
    try {
      const response = await API.put(`/tasks/${id}`, taskData);
      toast.success('Task updated successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to update task');
      throw error;
    }
  },

  // Delete task
  delete: async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      toast.success('Task deleted successfully');
      return true;
    } catch (error) {
      toast.error('Failed to delete task');
      throw error;
    }
  },

  // Get task statistics
  getStats: async () => {
    try {
      const response = await API.get('/tasks/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching task stats:', error);
      throw error;
    }
  },

  // Get overdue tasks
  getOverdue: async () => {
    try {
      const response = await API.get('/tasks/overdue');
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch overdue tasks');
      throw error;
    }
  }
};

export default taskService;