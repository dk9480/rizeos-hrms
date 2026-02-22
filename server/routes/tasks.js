const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Notification = require('../models/Notification'); // ADD THIS
const auth = require('../middleware/auth');

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ companyId: req.companyId })
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get employee tasks
router.get('/employee/:employeeId', auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      companyId: req.companyId,
      assignedTo: req.params.employeeId
    }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching employee tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task - WITH NOTIFICATION
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;

    const task = new Task({
      companyId: req.companyId,
      title,
      description,
      assignedTo,
      assignedBy: req.userId,
      priority,
      dueDate
    });

    await task.save();
    
    // CREATE NOTIFICATION FOR NEW TASK
    try {
      // Get employee name for better message
      const employee = await require('../models/Employee').findById(assignedTo);
      const employeeName = employee ? employee.name : 'team member';
      
      const notification = new Notification({
        companyId: req.companyId,
        message: `New task "${title}" assigned to ${employeeName}`,
        type: 'task_assigned',
        relatedId: task._id,
        onModel: 'Task'
      });
      await notification.save();
      console.log('✅ Notification created for new task');
    } catch (notifError) {
      console.error('⚠️ Error creating notification:', notifError.message);
      // Don't fail the request if notification fails
    }
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role');
    
    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task status - WITH NOTIFICATION
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    console.log('Updating task:', req.params.id, 'to status:', status);
    
    const updateData = { 
      status,
      ...(status === 'completed' && { completedAt: new Date() })
    };

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      updateData,
      { new: true }
    ).populate('assignedTo', 'name email role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // CREATE NOTIFICATION FOR TASK STATUS CHANGE
    try {
      let message = '';
      if (status === 'completed') {
        message = `Task "${task.title}" was completed by ${task.assignedTo?.name || 'team member'}`;
      } else if (status === 'in-progress') {
        message = `Task "${task.title}" is now in progress by ${task.assignedTo?.name || 'team member'}`;
      }
      
      if (message) {
        const notification = new Notification({
          companyId: req.companyId,
          message,
          type: status === 'completed' ? 'task_completed' : 'task_started',
          relatedId: task._id,
          onModel: 'Task'
        });
        await notification.save();
        console.log(`✅ Notification created for task ${status}`);
      }
    } catch (notifError) {
      console.error('⚠️ Error creating notification:', notifError.message);
    }

    console.log('Task updated successfully:', task);
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      req.body,
      { new: true }
    ).populate('assignedTo', 'name email role');
    
    // OPTIONAL: Notification for task update
    try {
      const notification = new Notification({
        companyId: req.companyId,
        message: `Task "${task.title}" was updated`,
        type: 'task_assigned',
        relatedId: task._id,
        onModel: 'Task'
      });
      await notification.save();
    } catch (notifError) {
      console.error('⚠️ Error creating notification:', notifError.message);
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    await Task.findOneAndDelete({ 
      _id: req.params.id, 
      companyId: req.companyId 
    });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;