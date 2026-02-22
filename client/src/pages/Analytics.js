import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';
import { calculateProductivityScore, detectSkillGaps, predictPerformanceTrend } from '../utils/aiAlgorithms';

const Analytics = () => {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState({});
  const [expandedSkills, setExpandedSkills] = useState(null); // Track which employee's skills are expanded

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesRes, tasksRes] = await Promise.all([
        axios.get('http://localhost:5000/api/employees'),
        axios.get('http://localhost:5000/api/tasks')
      ]);
      
      console.log('Employees fetched:', employeesRes.data);
      console.log('Tasks fetched:', tasksRes.data);
      
      setEmployees(employeesRes.data);
      setTasks(tasksRes.data);
      
      // Calculate AI insights for all employees
      const insights = {};
      employeesRes.data.forEach(emp => {
        insights[emp._id] = {
          productivity: calculateProductivityScore(emp._id, tasksRes.data),
          skillGap: detectSkillGaps(emp.skills || [], emp.role),
          trend: predictPerformanceTrend(emp._id, tasksRes.data)
        };
      });
      
      console.log('AI Insights:', insights);
      setAiInsights(insights);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Department wise data
  const departmentData = employees.reduce((acc, emp) => {
    const dept = emp.department || 'Other';
    if (!acc[dept]) acc[dept] = 0;
    acc[dept]++;
    return acc;
  }, {});

  const departmentChartData = Object.entries(departmentData).map(([name, value]) => ({
    name,
    value
  }));

  // Task status data
  const taskStatusData = [
    { name: 'Assigned', value: tasks.filter(t => t.status === 'assigned').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length }
  ];

  // Productivity distribution
  const productivityRanges = {
    'Expert (80-100)': 0,
    'Advanced (60-79)': 0,
    'Intermediate (40-59)': 0,
    'Beginner (0-39)': 0,
    'No Tasks': 0
  };

  employees.forEach(emp => {
    const insight = aiInsights[emp._id];
    if (!insight) return;
    
    const score = insight.productivity?.score || 0;
    if (insight.productivity?.level === 'No Tasks') {
      productivityRanges['No Tasks']++;
    } else if (score >= 80) productivityRanges['Expert (80-100)']++;
    else if (score >= 60) productivityRanges['Advanced (60-79)']++;
    else if (score >= 40) productivityRanges['Intermediate (40-59)']++;
    else productivityRanges['Beginner (0-39)']++;
  });

  const productivityChartData = Object.entries(productivityRanges)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#94a3b8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">AI Analytics Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Productivity</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(employees.reduce((acc, emp) => 
                  acc + (aiInsights[emp._id]?.productivity?.score || 0), 0
                ) / (employees.length || 1))}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Tasks</p>
              <p className="text-2xl font-bold text-gray-900">
                {tasks.filter(t => t.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {tasks.filter(t => t.status === 'in-progress').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {departmentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  allowDecimals={false}
                  domain={[0, 'auto']}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Productivity Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Distribution</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis 
                  allowDecimals={false}
                  domain={[0, 'auto']}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights - UPDATED with clickable skills */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {employees.length > 0 ? (
              employees.slice(0, 5).map(emp => {
                const insight = aiInsights[emp._id];
                if (!insight) return null;
                
                return (
                  <div key={emp._id} className="p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{emp.name}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        insight.productivity?.score >= 70 ? 'bg-green-100 text-green-700' :
                        insight.productivity?.score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                        insight.productivity?.score > 0 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        Score: {insight.productivity?.score || 0}%
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2">
                      <span className="font-medium">Role:</span> {emp.role || 'Not specified'} | 
                      <span className="font-medium ml-1">Trend:</span> {insight.trend?.trend || 'No data'}
                    </p>
                    
                    {insight.skillGap?.missingCount > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-yellow-600 mb-1">
                          Missing {insight.skillGap.missingCount} skills:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {/* Show first 3 skills */}
                          {insight.skillGap.missingSkills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                          
                          {/* If more than 3 skills, show clickable "+N more" */}
                          {insight.skillGap.missingSkills.length > 3 && (
                            <>
                              <button
                                onClick={() => setExpandedSkills(expandedSkills === emp._id ? null : emp._id)}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 transition-colors cursor-pointer"
                              >
                                {expandedSkills === emp._id ? '▼ Show less' : `+${insight.skillGap.missingSkills.length - 3} more`}
                              </button>
                              
                              {/* Show all skills when expanded */}
                              {expandedSkills === emp._id && (
                                <div className="w-full mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                                  <p className="text-xs font-medium text-gray-700 mb-1">All missing skills:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {insight.skillGap.missingSkills.map((skill, idx) => (
                                      <span key={idx} className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {insight.productivity?.totalTasks > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Completed {insight.productivity.completedTasks} of {insight.productivity.totalTasks} tasks
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">No employees found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;