import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './NavBar.css';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '' },
    { path: '/tasks', label: 'Tasks', icon: '' },
    { path: '/chat', label: 'Chat', icon: '' },
    { path: '/activities', label: 'Activity Feed', icon: '' },
    { path: '/leaderboard', label: 'Leaderboard', icon: '' },
    { path: '/guide', label: 'Guide', icon: '' },
    ...(user?.role === 'admin' ? [
      { path: '/admin', label: 'Admin', icon: '⚙️' },
      { path: '/analytics', label: 'Analytics', icon: '📊' },
      { path: '/admin/workflows', label: 'Workflows', icon: '🔄' }
    ] : []),
    ...(user?.role === 'member' ? [
      { path: '/member', label: 'Member', icon: '👥' }
    ] : []),
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  const handleLogout = () => {
    logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'var(--primary-600)',
      member: 'var(--success-600)',
      viewer: 'var(--warning-600)'
    };
    return colors[role] || 'var(--gray-600)';
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon"></span>
            <span className="brand-text">CollabHub</span>
          </Link>
        </div>

        <div className={`nav-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {isActive(item.path) && <span className="active-indicator"></span>}
            </Link>
          ))}
        </div>
        
        <div className="nav-user">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span 
                className="user-role"
                style={{ color: getRoleColor(user?.role) }}
              >
                {user?.role}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <span className="logout-icon"></span>
            <span className="logout-text">Logout</span>
          </button>
        </div>

        <button 
          className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>
    </nav>
  );
};

export default NavBar; 