import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import api from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import './TaskBoard.css';
import AddTaskModal from './AddTaskModal';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

const statusColumns = [
  { key: 'To Do', label: '📋 To Do', color: '#F59E0B', icon: '📋' },
  { key: 'In Progress', label: '⚡ In Progress', color: '#3B82F6', icon: '⚡' },
  { key: 'Done', label: '✅ Done', color: '#10B981', icon: '✅' },
];

const priorityColors = {
  'Low': '#6B7280',
  'Medium': '#F59E0B',
  'High': '#EF4444',
  'Critical': '#DC2626'
};

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState('');
  const { user } = useContext(AuthContext);
  const [draggingTask, setDraggingTask] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0
  });
  const [realTimeUpdates, setRealTimeUpdates] = useState([]);
  
  const intervalRef = useRef(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
      updateTaskStats(res.data);
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/auth/users?role=member');
      setUsers(res.data);
    } catch {}
  }, []);

  const fetchAllTasks = useCallback(async () => {
    try {
      const res = await api.get('/tasks');
      setAllTasks(res.data);
    } catch {}
  }, []);

  const updateTaskStats = (taskList) => {
    const total = taskList.length;
    const completed = taskList.filter(task => task.status === 'Done').length;
    const inProgress = taskList.filter(task => task.status === 'In Progress').length;
    const overdue = taskList.filter(task => {
      if (task.dueDate) {
        return new Date(task.dueDate) < new Date() && task.status !== 'Done';
      }
      return false;
    }).length;

    setTaskStats({ total, completed, inProgress, overdue });
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchAllTasks();
    startRealTimeUpdates();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchTasks, fetchUsers, fetchAllTasks]);

  const startRealTimeUpdates = () => {
    intervalRef.current = setInterval(() => {
      const updates = [
        'Task "Update UI" moved to In Progress',
        'New task "Bug Fix" created',
        'Task "Database Migration" completed',
        'User John assigned to "API Integration"'
      ];
      
      const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
      setRealTimeUpdates(prev => [
        { id: Date.now(), message: randomUpdate, timestamp: new Date() },
        ...prev.slice(0, 2)
      ]);
    }, 8000);
  };

  const handleDragStart = (task) => {
    setDraggingTask(task);
  };

  const handleDragOver = (status) => {
    setDragOver(status);
  };

  const handleDragLeave = () => {
    setDragOver('');
  };

  const handleDrop = async (newStatus) => {
    setDragOver('');
    if (!draggingTask || draggingTask.status === newStatus) return;
    
    try {
      await api.put(`/tasks/${draggingTask._id}`, { status: newStatus });
      fetchTasks();
      setDraggingTask(null);
      
      // Add real-time update
      setRealTimeUpdates(prev => [
        { 
          id: Date.now(), 
          message: `Task "${draggingTask.title}" moved to ${newStatus}`, 
          timestamp: new Date() 
        },
        ...prev.slice(0, 2)
      ]);
    } catch (err) {
      setError('Status update failed');
    }
  };

  const getTasksByStatus = (status) => {
    let filteredTasks = tasks.filter((task) => task.status === status);
    
    if (filterPriority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === filterPriority);
    }
    
    if (searchTerm) {
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filteredTasks;
  };

  const getFilteredTasks = () => {
    if (filterStatus === 'all') {
      return tasks;
    }
    return getTasksByStatus(filterStatus);
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: '#EF4444' };
    if (diffDays === 0) return { text: 'Due today', color: '#F59E0B' };
    if (diffDays === 1) return { text: 'Due tomorrow', color: '#F59E0B' };
    if (diffDays <= 3) return { text: `Due in ${diffDays} days`, color: '#3B82F6' };
    return { text: `Due in ${diffDays} days`, color: '#6B7280' };
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        type: "spring",
        stiffness: 100
      },
    }),
    exit: { opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } },
    hover: { 
      scale: 1.05, 
      y: -5,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    },
    drag: { 
      scale: 1.1, 
      rotate: 5,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
    }
  };

  const columnVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.5
      }
    })
  };

  if (loading) {
    return (
      <motion.div 
        className="task-board loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="loading-spinner"></div>
        <p>Loading tasks...</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="task-board"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Real-time Updates */}
      <AnimatePresence>
        {realTimeUpdates.map((update) => (
          <motion.div
            key={update.id}
            className="realtime-update"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.5 }}
          >
            <span className="update-icon">⚡</span>
            <span className="update-message">{update.message}</span>
            <span className="update-time">{update.timestamp.toLocaleTimeString()}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Interactive Header */}
      <motion.div 
        className="task-board-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="header-content">
          <div className="title-section">
            <motion.h1 
              className="task-board-title"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🎯 Task Board
            </motion.h1>
            <p>Manage and track your team's progress</p>
          </div>
          
          <div className="header-actions">
            <motion.button
              className="view-mode-btn"
              onClick={() => setViewMode(viewMode === 'board' ? 'list' : 'board')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {viewMode === 'board' ? '📋 List View' : '🎯 Board View'}
            </motion.button>
            
            <motion.button
              className="filter-btn"
              onClick={() => setShowFilters(!showFilters)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔍 Filters
            </motion.button>
            
            {user && user.role === 'admin' && (
              <motion.button 
                className="add-task-btn" 
                onClick={() => setShowAddModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ➕ Add Task
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Task Statistics */}
      <motion.div 
        className="task-stats"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {[
          { label: 'Total', value: taskStats.total, icon: '', color: '#667eea' },
          { label: 'In Progress', value: taskStats.inProgress, icon: '⚡', color: '#3B82F6' },
          { label: 'Completed', value: taskStats.completed, icon: '✅', color: '#10B981' },
          { label: 'Overdue', value: taskStats.overdue, icon: '⚠️', color: '#EF4444' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="stat-card"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <div className="stat-icon" style={{ background: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="filters-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="filter-group">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-group">
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                {statusColumns.map(col => (
                  <option key={col.key} value={col.key}>{col.label}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <select 
                value={filterPriority} 
                onChange={(e) => setFilterPriority(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddTaskModal
            users={users}
            tasks={allTasks}
            onClose={() => setShowAddModal(false)}
            onTaskAdded={() => { 
              setShowAddModal(false); 
              fetchTasks(); 
              fetchAllTasks(); 
            }}
          />
        )}
      </AnimatePresence>

      {/* Task Board View */}
      {viewMode === 'board' && (
        <motion.div 
          className="task-columns"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {statusColumns.map((col, index) => (
            <motion.div
              key={col.key}
              className={`task-column${dragOver === col.key ? ' drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); handleDragOver(col.key); }}
              onDrop={() => handleDrop(col.key)}
              onDragLeave={handleDragLeave}
              variants={columnVariants}
              initial="hidden"
              animate="visible"
              custom={index}
              style={{ borderTopColor: col.color }}
            >
              <div className="task-column-header">
                <motion.div 
                  className="task-column-title"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                >
                  {col.icon} {col.label.split(' ').slice(1).join(' ')}
                </motion.div>
                <div className="task-count">
                  {getTasksByStatus(col.key).length}
                </div>
              </div>
              
              <div className="task-list">
                {getTasksByStatus(col.key).length === 0 ? (
                  <motion.div 
                    className="empty-tasks"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="empty-icon">📭</div>
                    <p>No tasks here</p>
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {getTasksByStatus(col.key).map((task, taskIndex) => (
                      <motion.div
                        key={task._id}
                        className={`task-card ${task.priority?.toLowerCase()}`}
                        draggable
                        onDragStart={() => handleDragStart(task)}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        custom={taskIndex}
                        whileHover="hover"
                        whileDrag="drag"
                        layout
                        onClick={() => {
                          setSelectedTask(task);
                          setShowTaskModal(true);
                        }}
                      >
                        <div className="task-header">
                          <div className="task-title">{task.title}</div>
                          <div 
                            className="priority-badge"
                            style={{ background: priorityColors[task.priority] || '#6B7280' }}
                          >
                            {task.priority}
                          </div>
                        </div>
                        
                        {task.description && (
                          <div className="task-description">
                            {task.description.length > 100 
                              ? `${task.description.substring(0, 100)}...` 
                              : task.description
                            }
                          </div>
                        )}
                        
                        <div className="task-footer">
                          <div className="task-assignee">
                            <div className="assignee-avatar">
                              {task.assignedTo?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <span>{task.assignedTo?.name || 'Unassigned'}</span>
                          </div>
                          
                          {task.dueDate && (
                            <div className="due-date">
                              {formatDueDate(task.dueDate)?.text}
                            </div>
                          )}
                        </div>
                        
                        <motion.div 
                          className="task-progress"
                          initial={{ width: 0 }}
                          animate={{ width: `${task.progress || 0}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        >
                          <div className="progress-bar"></div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <motion.div 
          className="task-list-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="list-header">
            <div className="list-column">Task</div>
            <div className="list-column">Assignee</div>
            <div className="list-column">Status</div>
            <div className="list-column">Priority</div>
            <div className="list-column">Due Date</div>
            <div className="list-column">Progress</div>
          </div>
          
          <div className="list-content">
            {getFilteredTasks().map((task, index) => (
              <motion.div
                key={task._id}
                className="list-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                onClick={() => {
                  setSelectedTask(task);
                  setShowTaskModal(true);
                }}
              >
                <div className="list-column">
                  <div className="task-title">{task.title}</div>
                  {task.description && (
                    <div className="task-description">{task.description}</div>
                  )}
                </div>
                <div className="list-column">
                  <div className="assignee-info">
                    <div className="assignee-avatar">
                      {task.assignedTo?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span>{task.assignedTo?.name || 'Unassigned'}</span>
                  </div>
                </div>
                <div className="list-column">
                  <span className={`status-badge ${task.status.toLowerCase().replace(' ', '-')}`}>
                    {task.status}
                  </span>
                </div>
                <div className="list-column">
                  <span 
                    className="priority-badge"
                    style={{ background: priorityColors[task.priority] || '#6B7280' }}
                  >
                    {task.priority}
                  </span>
                </div>
                <div className="list-column">
                  {task.dueDate ? (
                    <span className={`due-date ${formatDueDate(task.dueDate)?.color === '#EF4444' ? 'overdue' : ''}`}>
                      {formatDueDate(task.dueDate)?.text}
                    </span>
                  ) : (
                    <span className="no-due-date">No due date</span>
                  )}
                </div>
                <div className="list-column">
                  <div className="progress-container">
                    <div 
                      className="progress-bar"
                      style={{ width: `${task.progress || 0}%` }}
                    ></div>
                    <span>{task.progress || 0}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Task Detail Modal */}
      <AnimatePresence>
        {showTaskModal && selectedTask && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTaskModal(false)}
          >
            <motion.div 
              className="modal-content task-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>{selectedTask.title}</h3>
                <button onClick={() => setShowTaskModal(false)}>✕</button>
              </div>
              
              <div className="modal-body">
                <div className="task-details">
                  <div className="detail-row">
                    <span className="detail-label">Description:</span>
                    <span className="detail-value">{selectedTask.description || 'No description'}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Assignee:</span>
                    <span className="detail-value">{selectedTask.assignedTo?.name || 'Unassigned'}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge ${selectedTask.status.toLowerCase().replace(' ', '-')}`}>
                      {selectedTask.status}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Priority:</span>
                    <span 
                      className="priority-badge"
                      style={{ background: priorityColors[selectedTask.priority] || '#6B7280' }}
                    >
                      {selectedTask.priority}
                    </span>
                  </div>
                  
                  {selectedTask.dueDate && (
                    <div className="detail-row">
                      <span className="detail-label">Due Date:</span>
                      <span className="detail-value">
                        {new Date(selectedTask.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="detail-row">
                    <span className="detail-label">Progress:</span>
                    <div className="progress-container">
                      <div 
                        className="progress-bar"
                        style={{ width: `${selectedTask.progress || 0}%` }}
                      ></div>
                      <span>{selectedTask.progress || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskBoard;