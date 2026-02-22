import API from './api';
import toast from 'react-hot-toast';

const employeeService = {
  // Get all employees
  getAll: async () => {
    try {
      const response = await API.get('/employees');
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch employees');
      throw error;
    }
  },

  // Get single employee
  getById: async (id) => {
    try {
      const response = await API.get(`/employees/${id}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch employee');
      throw error;
    }
  },

  // Create employee
  create: async (employeeData) => {
    try {
      const response = await API.post('/employees', employeeData);
      toast.success('Employee added successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to add employee');
      throw error;
    }
  },

  // Update employee
  update: async (id, employeeData) => {
    try {
      const response = await API.put(`/employees/${id}`, employeeData);
      toast.success('Employee updated successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to update employee');
      throw error;
    }
  },

  // Delete employee
  delete: async (id) => {
    try {
      await API.delete(`/employees/${id}`);
      toast.success('Employee deleted successfully');
      return true;
    } catch (error) {
      toast.error('Failed to delete employee');
      throw error;
    }
  },

  // Get employee statistics
  getStats: async () => {
    try {
      const response = await API.get('/employees/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching employee stats:', error);
      throw error;
    }
  },

  // Bulk import employees
  bulkImport: async (employees) => {
    try {
      const response = await API.post('/employees/bulk', { employees });
      toast.success(`${response.data.count} employees imported`);
      return response.data;
    } catch (error) {
      toast.error('Failed to import employees');
      throw error;
    }
  }
};

export default employeeService;