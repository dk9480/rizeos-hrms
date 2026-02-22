import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Clock, CheckCircle, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tasks');
      console.log('Tasks fetched:', response.data);
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tasks', formData);
      toast.success('Task created successfully');
      setShowModal(false);
      setFormData({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });
      fetchTasks();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      console.log('Updating task:', taskId, 'to status:', status);
      const response = await axios.put(`http://localhost:5000/api/tasks/${taskId}/status`, { status });
      console.log('Update response:', response.data);
      toast.success(`Task marked as ${status}`);
      fetchTasks(); // Refresh the list
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      case 'high': return 'bg-yellow-100 text-yellow-700';
      case 'urgent': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
          <p className="text-gray-500 mb-4">Create your first task to get started</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map((task) => (
            <div key={task._id} className="card hover:shadow-lg transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2 flex-wrap gap-2">
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                      {task.status === 'in-progress' ? 'In Progress' : task.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 flex-wrap gap-2">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {task.assignedTo?.name || 'Unassigned'} ({task.assignedTo?.role || 'No role'})
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    {task.completedAt && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Completed: {new Date(task.completedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                
                {task.status !== 'completed' && (
                  <div className="flex space-x-2 ml-4">
                    {task.status === 'assigned' && (
                      <button
                        onClick={() => updateTaskStatus(task._id, 'in-progress')}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        Start
                      </button>
                    )}
                    {task.status === 'in-progress' && (
                      <button
                        onClick={() => updateTaskStatus(task._id, 'completed')}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  placeholder="Enter task title"
                  required
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows="3"
                  placeholder="Describe the task"
                  required
                />
              </div>
              <div>
                <label className="label">Assign To</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name} - {emp.role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="label">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button type="submit" className="btn-primary flex-1">Create Task</button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;