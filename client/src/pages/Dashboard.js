import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Briefcase,
  Activity,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalTasks: 0,
    assignedTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    activeEmployees: 0,
    completionRate: 0,
    recentTasks: []
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [aiInsights, setAiInsights] = useState({});

  useEffect(() => {
    fetchDashboardData();
    fetchWeeklyActivity();
    fetchEmployees();
    fetchTasks();
  }, []);

  // Calculate AI insights when tasks and employees are loaded
  useEffect(() => {
    if (tasks.length > 0 && employees.length > 0) {
      console.log('Calculating AI insights for', employees.length, 'employees');
      const insights = {};
      employees.forEach(emp => {
        insights[emp._id] = {
          productivity: calculateProductivityScore(emp._id, tasks)
        };
      });
      setAiInsights(insights);
      console.log('AI Insights calculated:', insights);
    }
  }, [employees, tasks]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyActivity = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/dashboard/weekly-activity');
      setWeeklyData(response.data);
    } catch (error) {
      console.error('Error fetching weekly activity:', error);
      // Fallback to empty data if API fails
      setWeeklyData([
        { day: 'Sun', tasks: 0 },
        { day: 'Mon', tasks: 0 },
        { day: 'Tue', tasks: 0 },
        { day: 'Wed', tasks: 0 },
        { day: 'Thu', tasks: 0 },
        { day: 'Fri', tasks: 0 },
        { day: 'Sat', tasks: 0 }
      ]);
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

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Calculate productivity score for each employee - FIXED VERSION
  const calculateProductivityScore = (employeeId, tasksList) => {
    // Use the passed tasksList instead of the state tasks
    const employeeTasks = tasksList.filter(t => {
      // Handle both object and string IDs
      if (typeof t.assignedTo === 'object' && t.assignedTo !== null) {
        return t.assignedTo._id === employeeId || t.assignedTo === employeeId;
      } else {
        return t.assignedTo === employeeId;
      }
    });
    
    if (employeeTasks.length === 0) {
      return {
        score: 0,
        level: 'No Tasks',
        completedTasks: 0,
        totalTasks: 0
      };
    }
    
    const totalTasks = employeeTasks.length;
    const completedTasks = employeeTasks.filter(t => t.status === 'completed').length;
    
    // Calculate percentage correctly
    const score = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    let level = 'Beginner';
    if (score >= 80) level = 'Expert';
    else if (score >= 60) level = 'Advanced';
    else if (score >= 40) level = 'Intermediate';
    else if (score > 0) level = 'Beginner';
    
    return {
      score,
      level,
      completedTasks,
      totalTasks
    };
  };

  // Get top performers (uses the aiInsights for accurate scores)
  const topPerformers = employees
    .map(emp => {
      const insight = aiInsights[emp._id];
      return {
        ...emp,
        productivity: insight?.productivity?.score || 0,
        completedTasks: insight?.productivity?.completedTasks || 0,
        totalTasks: insight?.productivity?.totalTasks || 0
      };
    })
    .sort((a, b) => b.productivity - a.productivity)
    .slice(0, 5);

  // Chart data for task distribution
  const taskDistributionData = [
    { name: 'Assigned', value: stats.assignedTasks || 0, color: '#f59e0b' },
    { name: 'In Progress', value: stats.inProgressTasks || 0, color: '#3b82f6' },
    { name: 'Completed', value: stats.completedTasks || 0, color: '#10b981' }
  ];

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981'];

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      change: stats.totalEmployees > 0 ? '+12%' : '0%',
      trend: 'up',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Active Employees',
      value: stats.activeEmployees,
      icon: Activity,
      change: stats.activeEmployees > 0 ? `${Math.round((stats.activeEmployees/stats.totalEmployees)*100)}%` : '0%',
      trend: stats.activeEmployees > 0 ? 'up' : 'down',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Completed Tasks',
      value: stats.completedTasks,
      icon: CheckCircle,
      change: `${stats.completionRate || 0}%`,
      trend: stats.completionRate > 50 ? 'up' : 'down',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100'
    },
    {
      title: 'In Progress',
      value: stats.inProgressTasks,
      icon: Clock,
      change: stats.inProgressTasks > 0 ? `${Math.round((stats.inProgressTasks/stats.totalTasks)*100)}%` : '0%',
      trend: 'neutral',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="card hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${card.iconBg} rounded-lg`}>
                <card.icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
              <span className={`flex items-center text-sm font-medium ${
                card.trend === 'up' ? 'text-green-600' : 
                card.trend === 'down' ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {card.trend === 'up' && <ArrowUp className="w-3 h-3 mr-1" />}
                {card.trend === 'down' && <ArrowDown className="w-3 h-3 mr-1" />}
                {card.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
            <p className="text-sm text-gray-600 mt-1">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Distribution Pie Chart */}
        <div className="card lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Distribution</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {taskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            {taskDistributionData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity Bar Chart - FIXED */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity (Tasks Created)</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData.length > 0 ? weeklyData : [
                { day: 'Sun', tasks: 0 },
                { day: 'Mon', tasks: 0 },
                { day: 'Tue', tasks: 0 },
                { day: 'Wed', tasks: 0 },
                { day: 'Thu', tasks: 0 },
                { day: 'Fri', tasks: 0 },
                { day: 'Sat', tasks: 0 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis 
                  stroke="#6b7280" 
                  domain={[0, 'auto']} 
                  allowDecimals={false}
                />
                <Tooltip 
                  formatter={(value) => [Math.round(value), 'Tasks']}
                />
                <Bar dataKey="tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {weeklyData.length > 0 && weeklyData.every(d => d.tasks === 0) && (
            <p className="text-center text-sm text-gray-500 mt-2">
              No tasks created this week. Create tasks to see data!
            </p>
          )}
        </div>
      </div>

      {/* Recent Activity & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h3>
          <div className="space-y-3">
            {stats.recentTasks && stats.recentTasks.length > 0 ? (
              stats.recentTasks.map((task) => (
                <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === 'completed' ? 'bg-green-500' :
                      task.status === 'in-progress' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">Assigned to {task.assignedTo?.name || 'Unknown'}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.status === 'completed' ? 'bg-green-100 text-green-700' :
                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent tasks</p>
            )}
          </div>
        </div>

        {/* Top Performers - FIXED */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
          <div className="space-y-3">
            {topPerformers.length > 0 ? (
              topPerformers.map((employee, index) => {
                return (
                  <div key={employee._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' : 'bg-primary-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                        <p className="text-xs text-gray-500">{employee.role || 'No role'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        employee.productivity >= 70 ? 'text-green-600' :
                        employee.productivity >= 40 ? 'text-yellow-600' :
                        employee.productivity > 0 ? 'text-orange-600' :
                        'text-gray-500'
                      }`}>
                        {employee.productivity}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {employee.completedTasks || 0}/{employee.totalTasks || 0} tasks
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => window.location.href = '/employees'}
          className="p-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white hover:from-primary-600 hover:to-primary-700 transition-all duration-200"
        >
          <Briefcase className="w-6 h-6 mb-2 mx-auto" />
          <p className="font-semibold text-center">Add New Employee</p>
          <p className="text-xs opacity-90 mt-1 text-center">Onboard team members</p>
        </button>
        
        <button 
          onClick={() => window.location.href = '/tasks'}
          className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white hover:from-green-600 hover:to-green-700 transition-all duration-200"
        >
          <CheckCircle className="w-6 h-6 mb-2 mx-auto" />
          <p className="font-semibold text-center">Create New Task</p>
          <p className="text-xs opacity-90 mt-1 text-center">Assign work to employees</p>
        </button>
        
        <button 
          onClick={() => window.location.href = '/analytics'}
          className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
        >
          <TrendingUp className="w-6 h-6 mb-2 mx-auto" />
          <p className="font-semibold text-center">View Analytics</p>
          <p className="text-xs opacity-90 mt-1 text-center">Check performance insights</p>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;