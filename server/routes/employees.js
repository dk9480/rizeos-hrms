const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Notification = require('../models/Notification'); // ADD THIS
const auth = require('../middleware/auth');

// Get all employees
router.get('/', auth, async (req, res) => {
  try {
    const employees = await Employee.find({ companyId: req.companyId })
      .sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add employee - WITH NOTIFICATION
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, role, department, skills, walletAddress, phone } = req.body;

    const employee = new Employee({
      companyId: req.companyId,
      name,
      email,
      role,
      department,
      skills: skills || [],
      walletAddress: walletAddress || '',
      phone
    });

    await employee.save();
    
    // CREATE NOTIFICATION FOR NEW EMPLOYEE
    try {
      const notification = new Notification({
        companyId: req.companyId,
        message: `New employee ${name} joined as ${role || 'team member'}`,
        type: 'employee_added',
        relatedId: employee._id,
        onModel: 'Employee'
      });
      await notification.save();
      console.log('✅ Notification created for new employee:', name);
    } catch (notifError) {
      console.error('⚠️ Error creating notification:', notifError.message);
      // Don't fail the request if notification fails
    }
    
    res.status(201).json(employee);
  } catch (error) {
    console.error('❌ Error adding employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update employee - WITH NOTIFICATION (optional)
router.put('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      req.body,
      { new: true }
    );
    
    // OPTIONAL: Create notification for employee update
    try {
      const notification = new Notification({
        companyId: req.companyId,
        message: `Employee ${employee.name}'s information was updated`,
        type: 'employee_added', // You can add a new type 'employee_updated' later
        relatedId: employee._id,
        onModel: 'Employee'
      });
      await notification.save();
    } catch (notifError) {
      console.error('⚠️ Error creating notification:', notifError.message);
    }
    
    res.json(employee);
  } catch (error) {
    console.error('❌ Error updating employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete employee
router.delete('/:id', auth, async (req, res) => {
  try {
    await Employee.findOneAndDelete({ 
      _id: req.params.id, 
      companyId: req.companyId 
    });
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    console.error('❌ Error deleting employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;