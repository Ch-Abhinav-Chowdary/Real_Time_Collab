import React, { useEffect, useState, useContext, useRef } from 'react';
import api from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const ROLES = ['admin', 'member', 'viewer'];

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteLink, setInviteLink] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [realTimeStats, setRealTimeStats] = useState({
    onlineUsers: 0,
    activeTasks: 0,
    systemHealth: 100
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  
  const intervalRef = useRef(null);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
    startRealTimeUpdates();
    generateMockActivities();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startRealTimeUpdates = () => {
    intervalRef.current = setInterval(() => {
      setRealTimeStats(prev => ({
        onlineUsers: Math.floor(Math.random() * 20) + 10,
        activeTasks: Math.floor(Math.random() * 50) + 30,
        systemHealth: Math.max(85, Math.min(100, prev.systemHealth + (Math.random() - 0.5) * 5))
      }));
    }, 3000);
  };

  const generateMockActivities = () => {
    const activities = [
      { type: 'task_created', user: 'John Doe', action: 'created task "Update UI"', time: '2 min ago', icon: '📝' },
      { type: 'user_joined', user: 'Sarah Smith', action: 'joined the team', time: '5 min ago', icon: '👋' },
      { type: 'task_completed', user: 'Mike Johnson', action: 'completed "Fix Bug"', time: '10 min ago', icon: '✅' },
      { type: 'file_uploaded', user: 'Lisa Wang', action: 'uploaded "Design Mockups"', time: '15 min ago', icon: '📁' },
      { type: 'workflow_triggered', user: 'System', action: 'automated workflow executed', time: '20 min ago', icon: '⚡' }
    ];
    setRecentActivities(activities);
  };

  const fetchStats = async () => {
    try {
      const [usersRes, tasksRes] = await Promise.all([
        api.get('/users'),
        api.get('/tasks')
      ]);
      
      const totalTasks = tasksRes.data.length;
      const completedTasks = tasksRes.data.filter(task => task.status === 'Done').length;
      
      setStats({
        totalUsers: usersRes.data.length,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.put(`/auth/user/${id}/role`, { role: newRole });
      fetchUsers();
      addSystemAlert('success', `User role updated successfully`);
    } catch (err) {
      addSystemAlert('error', 'Failed to update role');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/auth/user/${id}`);
      fetchUsers();
      addSystemAlert('success', 'User deleted successfully');
    } catch (err) {
      addSystemAlert('error', 'Failed to delete user');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteLink('');
    try {
      const res = await api.post('/auth/invite', { email: inviteEmail, role: inviteRole });
      setInviteLink(res.data.inviteLink);
      setInviteEmail('');
      setShowInviteModal(false);
      addSystemAlert('success', 'Invitation sent successfully');
    } catch (err) {
      addSystemAlert('error', 'Failed to send invite');
    } finally {
      setInviteLoading(false);
    }
  };

  const addSystemAlert = (type, message) => {
    const alert = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date()
    };
    setSystemAlerts(prev => [alert, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setSystemAlerts(prev => prev.filter(a => a.id !== alert.id));
    }, 5000);
  };

  const quickActions = [
    {
      title: 'Manage Tasks',
      description: 'Create, edit, and assign tasks to team members',
      icon: '📋',
      link: '/tasks',
      color: 'primary',
      gradient: 'linear-gradient(135deg, #667eea, #764ba2)'
    },
    {
      title: 'View Analytics',
      description: 'Monitor team performance and task metrics',
      icon: '📊',
      link: '/analytics',
      color: 'success',
      gradient: 'linear-gradient(135deg, #10B981, #059669)'
    },
    {
      title: 'Workflow Management',
      description: 'Configure and manage automated workflows',
      icon: '🔄',
      link: '/admin/workflows',
      color: 'warning',
      gradient: 'linear-gradient(135deg, #F59E0B, #D97706)'
    },
    {
      title: 'User Management',
      description: 'Manage team members and their permissions',
      icon: '👥',
      link: '/admin/users',
      color: 'info',
      gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)'
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences and security',
      icon: '⚙️',
      link: '/admin/settings',
      color: 'secondary',
      gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
    },
    {
      title: 'Activity Logs',
      description: 'View detailed system activity and audit trails',
      icon: '📜',
      link: '/admin/logs',
      color: 'dark',
      gradient: 'linear-gradient(135deg, #6B7280, #4B5563)'
    }
  ];

  if (!user || user.role !== 'admin') {
    return (
      <motion.div 
        className="admin-dashboard access-denied"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2>🚫 Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div 
        className="dashboard-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="loading-content">
          <motion.div 
            className="spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          ></motion.div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading admin dashboard...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="admin-dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* System Alerts */}
      <AnimatePresence>
        {systemAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            className={`system-alert ${alert.type}`}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
          >
            <span className="alert-icon">
              {alert.type === 'success' ? '✅' : '❌'}
            </span>
            <span className="alert-message">{alert.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Interactive Header */}
      <motion.div 
        className="dashboard-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="header-content">
          <div className="welcome-section">
            <motion.h1
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              👋 Welcome back, {user.name}!
            </motion.h1>
            <p>Here's what's happening with your team today</p>
          </div>
          <div className="header-actions">
            <motion.span 
              className="admin-badge"
              animate={{ 
                background: ['linear-gradient(135deg, #667eea, #764ba2)', 'linear-gradient(135deg, #764ba2, #667eea)'],
                boxShadow: ['0 4px 12px rgba(102, 126, 234, 0.3)', '0 8px 20px rgba(102, 126, 234, 0.4)']
              }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              👑 Administrator
            </motion.span>
            <motion.button
              className="invite-btn"
              onClick={() => setShowInviteModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ➕ Invite User
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Real-time Stats Bar */}
      <motion.div 
        className="realtime-stats-bar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="realtime-item">
          <span className="realtime-label">Online Users:</span>
          <motion.span 
            className="realtime-value"
            key={realTimeStats.onlineUsers}
            initial={{ scale: 1.2, color: '#10B981' }}
            animate={{ scale: 1, color: '#333' }}
            transition={{ duration: 0.5 }}
          >
            {realTimeStats.onlineUsers}
          </motion.span>
        </div>
        <div className="realtime-item">
          <span className="realtime-label">Active Tasks:</span>
          <motion.span 
            className="realtime-value"
            key={realTimeStats.activeTasks}
            initial={{ scale: 1.2, color: '#3B82F6' }}
            animate={{ scale: 1, color: '#333' }}
            transition={{ duration: 0.5 }}
          >
            {realTimeStats.activeTasks}
          </motion.span>
        </div>
        <div className="realtime-item">
          <span className="realtime-label">System Health:</span>
          <motion.span 
            className="realtime-value"
            key={Math.round(realTimeStats.systemHealth)}
            initial={{ scale: 1.2, color: '#10B981' }}
            animate={{ scale: 1, color: '#333' }}
            transition={{ duration: 0.5 }}
          >
            {Math.round(realTimeStats.systemHealth)}%
          </motion.span>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div 
        className="dashboard-tabs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {['overview', 'users', 'analytics', 'settings'].map((tab) => (
          <motion.button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </motion.button>
        ))}
      </motion.div>

      {/* Overview Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Stats Overview */}
            <div className="stats-section">
              <motion.h2 
                className="section-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                📊 Overview
              </motion.h2>
              <div className="stats-grid">
                {[
                  { icon: '👥', title: 'Total Users', value: stats.totalUsers, desc: 'Active team members', color: '#667eea' },
                  { icon: '📋', title: 'Total Tasks', value: stats.totalTasks, desc: 'All active tasks', color: '#10B981' },
                  { icon: '✅', title: 'Completed', value: stats.completedTasks, desc: 'Successfully finished', color: '#F59E0B' },
                  { icon: '⏳', title: 'Pending', value: stats.pendingTasks, desc: 'Awaiting completion', color: '#EF4444' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <motion.div 
                      className="stat-icon"
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                      style={{ background: stat.color }}
                    >
                      {stat.icon}
                    </motion.div>
                    <div className="stat-content">
                      <h3>{stat.title}</h3>
                      <motion.div 
                        className="stat-value"
                        key={stat.value}
                        initial={{ scale: 1.2, color: stat.color }}
                        animate={{ scale: 1, color: '#2c3e50' }}
                        transition={{ duration: 0.5 }}
                      >
                        {stat.value}
                      </motion.div>
                      <p className="stat-description">{stat.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="actions-section">
              <motion.h2 
                className="section-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                ⚡ Quick Actions
              </motion.h2>
              <div className="actions-grid">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Link to={action.link} className={`action-card ${action.color}`}>
                      <motion.div 
                        className="action-icon"
                        animate={{ 
                          rotate: [0, 5, -5, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                      >
                        {action.icon}
                      </motion.div>
                      <div className="action-content">
                        <h3>{action.title}</h3>
                        <p>{action.description}</p>
                      </div>
                      <motion.div 
                        className="action-arrow"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="activity-section">
              <motion.h2 
                className="section-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                🔥 Recent Activity
              </motion.h2>
              <div className="activity-card">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={index}
                    className="activity-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                  >
                    <motion.div 
                      className="activity-icon"
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                    >
                      {activity.icon}
                    </motion.div>
                    <div className="activity-content">
                      <p><strong>{activity.user}</strong> {activity.action}</p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="users-section">
              <motion.h2 
                className="section-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                👥 User Management
              </motion.h2>
              
              {loading ? (
                <div className="loading-users">Loading users...</div>
              ) : error ? (
                <div className="error">{error}</div>
              ) : (
                <div className="users-grid">
                  {users.map((u, index) => (
                    <motion.div
                      key={u._id}
                      className="user-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      onClick={() => {
                        setSelectedUser(u);
                        setShowUserModal(true);
                      }}
                    >
                      <div className="user-avatar">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <h3>{u.name}</h3>
                        <p>{u.email}</p>
                        <span className={`user-role ${u.role}`}>{u.role}</span>
                      </div>
                      <div className="user-actions">
                        <select
                          value={u.role}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleRoleChange(u._id, e.target.value);
                          }}
                          disabled={u._id === user.id || (u.role === 'admin' && u._id !== user.id)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <motion.button
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(u._id);
                          }}
                          disabled={u._id === user.id || u.role === 'admin'}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          🗑️
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="analytics-section">
              <motion.h2 
                className="section-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                📊 Analytics Overview
              </motion.h2>
              <div className="analytics-grid">
                <motion.div 
                  className="analytics-card"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3>Team Performance</h3>
                  <div className="performance-metrics">
                    <div className="metric">
                      <span>Task Completion Rate</span>
                      <motion.div 
                        className="progress-bar"
                        initial={{ width: 0 }}
                        animate={{ width: `${(stats.completedTasks / stats.totalTasks) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      ></motion.div>
                      <span>{stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="settings-section">
              <motion.h2 
                className="section-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                ⚙️ System Settings
              </motion.h2>
              <div className="settings-grid">
                <motion.div 
                  className="setting-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3>System Health</h3>
                  <div className="health-indicator">
                    <motion.div 
                      className="health-bar"
                      initial={{ width: 0 }}
                      animate={{ width: `${realTimeStats.systemHealth}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    ></motion.div>
                    <span>{Math.round(realTimeStats.systemHealth)}%</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite User Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Invite New User</h3>
              <form className="invite-form" onSubmit={handleInvite}>
                <input
                  type="email"
                  placeholder="Email address"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  required
                />
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <motion.button 
                  type="submit" 
                  disabled={inviteLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {inviteLoading ? 'Inviting...' : 'Send Invite'}
                </motion.button>
              </form>
              {inviteLink && (
                <div className="invite-link">
                  <p>Invite Link:</p>
                  <a href={inviteLink} target="_blank" rel="noopener noreferrer">{inviteLink}</a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Details Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUserModal(false)}
          >
            <motion.div 
              className="modal-content user-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>User Details</h3>
              <div className="user-details">
                <div className="user-avatar-large">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <h4>{selectedUser.name}</h4>
                <p>{selectedUser.email}</p>
                <span className={`user-role ${selectedUser.role}`}>{selectedUser.role}</span>
              </div>
              <div className="user-actions-modal">
                <select
                  value={selectedUser.role}
                  onChange={(e) => handleRoleChange(selectedUser._id, e.target.value)}
                  disabled={selectedUser._id === user.id || (selectedUser.role === 'admin' && selectedUser._id !== user.id)}
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <motion.button
                  className="delete-btn"
                  onClick={() => {
                    handleDelete(selectedUser._id);
                    setShowUserModal(false);
                  }}
                  disabled={selectedUser._id === user.id || selectedUser.role === 'admin'}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  Delete User
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminDashboard; 