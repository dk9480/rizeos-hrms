const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Get dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    const companyId = req.companyId;

    // Get counts
    const totalEmployees = await Employee.countDocuments({ companyId });
    const totalTasks = await Task.countDocuments({ companyId });
    
    const assignedTasks = await Task.countDocuments({ 
      companyId, 
      status: 'assigned' 
    });
    
    const inProgressTasks = await Task.countDocuments({ 
      companyId, 
      status: 'in-progress' 
    });
    
    const completedTasks = await Task.countDocuments({ 
      companyId, 
      status: 'completed' 
    });

    // Get active employees (with in-progress tasks)
    const employeesWithTasks = await Task.distinct('assignedTo', {
      companyId,
      status: 'in-progress'
    });
    const activeEmployees = employeesWithTasks.length;

    // Get recent tasks
    const recentTasks = await Task.find({ companyId })
      .populate('assignedTo', 'name role')
      .sort({ createdAt: -1 })
      .limit(5);

    // Task completion rate
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;

    res.json({
      totalEmployees,
      totalTasks,
      assignedTasks,
      inProgressTasks,
      completedTasks,
      activeEmployees,
      completionRate,
      recentTasks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// FIXED: Get weekly activity data (returns integers, not decimals)
router.get('/weekly-activity', auth, async (req, res) => {
  try {
    const companyId = req.companyId;
    
    // Get today's date
    const today = new Date();
    const weeklyData = [];
    
    // Day names
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Loop through last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      
      // Count tasks created on this day - returns INTEGER count
      const taskCount = await Task.countDocuments({
        companyId,
        createdAt: {
          $gte: date,
          $lt: nextDate
        }
      });
      
      weeklyData.push({
        day: days[date.getDay()],
        tasks: taskCount, // This is now an integer, not decimal
        fullDate: date.toISOString().split('T')[0]
      });
    }
    
    console.log('Weekly activity data:', weeklyData); // Debug log
    res.json(weeklyData);
  } catch (error) {
    console.error('Error fetching weekly activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;