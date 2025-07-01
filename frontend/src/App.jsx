import { Routes, Route, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ChatRoom from './components/ChatRoom';
import ProtectedRoute from './components/ProtectedRoute';
import TaskBoard from './components/TaskBoard';
import './App.css';
import UserProfile from './components/UserProfile';
import AdminDashboard from './components/AdminDashboard';
import MemberDashboard from './components/MemberDashboard';
import Leaderboard from './components/Leaderboard';
import NavBar from './components/NavBar';
import { AuthContext } from './context/AuthContext';
import GamificationGuide from './components/GamificationGuide';
import WorkflowManager from './components/WorkflowManager';
import { AnimatePresence, motion } from 'framer-motion';
import TaskAnalytics from './components/TaskAnalytics';
import ActivityFeed from './components/ActivityFeed';

function App() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  return (
    <div className="app">
      <header className="header">
        <span>CollabCore</span>
        {user && <NavBar />}
      </header>
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Routes location={location} key={location.pathname}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
              <Route path="/tasks" element={<ProtectedRoute><TaskBoard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path="/activities" element={<ProtectedRoute><ActivityFeed /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute role="admin"><TaskAnalytics /></ProtectedRoute>} />
              <Route path="/admin/workflows" element={<ProtectedRoute role="admin"><WorkflowManager /></ProtectedRoute>} />
              <Route path="/member" element={<ProtectedRoute role="member"><MemberDashboard /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
              <Route path="/guide" element={<ProtectedRoute><GamificationGuide /></ProtectedRoute>} />

              <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} TeamCollab. All rights reserved.
      </footer>
    </div>
  );
}

export default App;