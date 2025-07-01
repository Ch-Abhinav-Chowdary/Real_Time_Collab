const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { adminOnly } = require('../middleware/authMiddleware');

// Get all tasks
router.get('/', taskController.getAllTasks);

// Get task analytics (Admin Only)
router.get('/analytics', adminOnly, taskController.getTaskAnalytics);

// Create a new task (Admin Only)
router.post('/', adminOnly, taskController.createTask);

// Update a task
router.put('/:id', taskController.updateTask);

// Delete a task (Admin Only)
router.delete('/:id', adminOnly, taskController.deleteTask);

module.exports = router;
