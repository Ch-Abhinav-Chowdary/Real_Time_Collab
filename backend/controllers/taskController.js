const Task = require('../models/Task');
const User = require('../models/User');
const workflowEngine = require('../services/workflowEngine');
const Activity = require('../models/Activity');

// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.assignedTo) {
      filter.assignedTo = req.query.assignedTo;
    }
    const tasks = await Task.find(filter).populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, dependency, files } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    
    const task = await Task.create({ title, description, assignedTo, dueDate, dependency, files });
    const populated = await task.populate('assignedTo', 'name email');

    // Track activity
    await trackTaskActivity('task_created', task, req.user);

    // Trigger workflow for task creation
    workflowEngine.trigger('task.created', { task: populated });

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: 'Task creation failed' });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('assignedTo', 'name email');
    
    if (!updated) return res.status(404).json({ error: 'Task not found' });

    // Track task completion activity
    if (req.body.status === 'Done' && updated.assignedTo) {
      await trackTaskActivity('task_completed', updated, req.user);
      
      // Gamification: If status changed to Done, award points, badges, level
      const user = await User.findById(updated.assignedTo._id);
      if (user && user.role !== 'viewer') {
        let pointsAwarded = 10;
        user.points += pointsAwarded;
        // Level up logic
        if (user.points >= user.level * 100) {
          user.level += 1;
        }
        // Badges
        const completedTasks = await Task.countDocuments({ assignedTo: user._id, status: 'Done' });
        if (!user.badges.includes('task-novice') && completedTasks >= 1) {
          user.badges.push('task-novice');
        }
        if (!user.badges.includes('task-master') && completedTasks >= 25) {
          user.badges.push('task-master');
        }
        await user.save();
      }
    }

    // Trigger workflow for task completion
    if (req.body.status === 'Done') {
      workflowEngine.trigger('task.completed', { task: updated });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Update failed' });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Delete failed' });
  }
};

// Get task analytics
exports.getTaskAnalytics = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const tasksByStatus = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const overdueTasks = await Task.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $ne: 'Done' }
    });

    res.json({
      totalTasks,
      tasksByStatus,
      overdueTasks,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task analytics' });
  }
};

// Add this function to track task activities
const trackTaskActivity = async (type, task, user, additionalData = {}) => {
  try {
    const activityMessages = {
      'task_created': `${user.name} created a new task`,
      'task_completed': `${user.name} completed a task`,
      'task_assigned': `${user.name} assigned a task`,
      'task_updated': `${user.name} updated a task`
    };

    await Activity.create({
      type,
      user: user._id,
      message: activityMessages[type],
      data: {
        taskId: task._id,
        taskTitle: task.title,
        ...additionalData
      }
    });
  } catch (error) {
    console.error('Error tracking task activity:', error);
  }
};
