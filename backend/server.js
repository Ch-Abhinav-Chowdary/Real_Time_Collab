require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const socketSetup = require('./socket');

// Import routes
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const taskRoutes = require('./routes/taskRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const fileRoutes = require('./routes/fileRoutes');
const activityRoutes = require('./routes/activityRoutes');

// Initialize app and server
const app = express();
app.use(cors({
  origin: ["https://deploy-mern-1whq.vercel.app"],
  methods: ["POST", "GET"],
  credentials: true
  }
));
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// CORS setup
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Middleware
app.use(express.json());

// Test route to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// Serve static files from the "uploads" directory
app.use('/uploads', express.static('uploads'));

// Debug: Log all API requests
app.use('/api', (req, res, next) => {
  console.log(`📥 API Request: ${req.method} ${req.url}`);
  console.log(`🔍 Full URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/activities', activityRoutes);

// Catch-all route for debugging (404 handler)
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: 'Route not found', 
    method: req.method, 
    url: req.originalUrl,
    availableRoutes: [
      'GET /api/test',
      'GET /api/files/test',
      'POST /api/files',
      'GET /api/files/room/:room',
      'GET /api/activities',
      'GET /api/activities/stats'
    ]
  });
});

// WebSocket setup
socketSetup(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 File API available at: http://localhost:${PORT}/api/files`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`📊 Activity API available at: http://localhost:${PORT}/api/activities`);
});
