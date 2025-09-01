# 🚀 CollabCore - Real-Time Collaboration Platform

A comprehensive, full-stack real-time collaboration platform built with React, Node.js, and Socket.IO. Features include collaborative file editing, task management, workflow automation, gamification, and real-time communication.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Real-Time Features](#-real-time-features)
- [Architecture](#-architecture)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎯 Core Collaboration
- **Real-time file editing** with multiple users
- **Live cursor tracking** and presence indicators
- **Chat rooms** with real-time messaging
- **Task management** with Kanban board
- **Workflow automation** system
- **File collaboration** with version control

### 👥 User Management
- **Role-based access control** (Admin, Member, Viewer)
- **User authentication** with JWT tokens
- **User profiles** with customizable avatars
- **Activity tracking** and analytics
- **Gamification system** with points, levels, and badges

### 📊 Analytics & Insights
- **Task analytics** dashboard
- **User activity feeds**
- **Performance metrics**
- **Leaderboards**
- **Workflow execution tracking**

### 🔧 Advanced Features
- **Workflow automation** with triggers and actions
- **File type support** (JS, Python, HTML, CSS, JSON, etc.)
- **Auto-save functionality**
- **Conflict resolution**
- **Real-time notifications**

## 🛠️ Tech Stack

### Frontend
- **React 19.1.0** - Modern React with hooks
- **Vite 6.3.5** - Fast build tool and dev server
- **React Router DOM 7.6.2** - Client-side routing
- **Framer Motion 12.18.1** - Animation library
- **Chart.js 4.5.0** - Data visualization
- **Socket.IO Client 4.8.1** - Real-time communication
- **Axios 1.10.0** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js 5.1.0** - Web framework
- **Socket.IO 4.8.1** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose 8.16.0** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Multer** - File upload handling

### Development Tools
- **ESLint** - Code linting
- **Nodemon** - Development server with auto-restart
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
Real_Time_Collab-main/
├── frontend/                          # React frontend application
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── AdminDashboard.jsx    # Admin management interface
│   │   │   ├── ChatRoom.jsx          # Real-time chat functionality
│   │   │   ├── FileCollaboration.jsx # File editing interface
│   │   │   ├── FileEditor.jsx        # Collaborative code editor
│   │   │   ├── FileManager.jsx       # File management system
│   │   │   ├── TaskBoard.jsx         # Kanban task board
│   │   │   ├── TaskAnalytics.jsx     # Analytics dashboard
│   │   │   ├── UserProfile.jsx       # User profile management
│   │   │   ├── WorkflowManager.jsx   # Workflow automation
│   │   │   └── ...                   # Other UI components
│   │   ├── context/                  # React context providers
│   │   │   └── AuthContext.jsx       # Authentication state management
│   │   ├── utils/                    # Utility functions
│   │   │   └── axiosConfig.js        # HTTP client configuration
│   │   ├── assets/                   # Static assets
│   │   ├── App.jsx                   # Main application component
│   │   └── main.jsx                  # Application entry point
│   ├── public/                       # Public assets
│   ├── package.json                  # Frontend dependencies
│   └── vite.config.js                # Vite configuration
├── backend/                          # Node.js backend server
│   ├── config/                       # Configuration files
│   │   └── db.js                     # Database connection
│   ├── controllers/                  # Request handlers
│   ├── middleware/                   # Express middleware
│   ├── models/                       # MongoDB schemas
│   │   ├── User.js                   # User data model
│   │   ├── Task.js                   # Task data model
│   │   ├── Workflow.js               # Workflow data model
│   │   ├── File.js                   # File data model
│   │   ├── Message.js                # Message data model
│   │   └── Activity.js               # Activity tracking model
│   ├── routes/                       # API route definitions
│   │   ├── authRoutes.js             # Authentication endpoints
│   │   ├── taskRoutes.js             # Task management endpoints
│   │   ├── workflowRoutes.js         # Workflow endpoints
│   │   ├── fileRoutes.js             # File management endpoints
│   │   ├── messageRoutes.js          # Messaging endpoints
│   │   └── activityRoutes.js         # Activity tracking endpoints
│   ├── services/                     # Business logic services
│   ├── uploads/                      # File upload directory
│   ├── server.js                     # Main server file
│   ├── socket.js                     # WebSocket configuration
│   └── package.json                  # Backend dependencies
└── REAL_TIME_FILE_EDITING.md         # Detailed file editing documentation
```

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
MONGO_URI=mongodb://localhost:27017/collabcore
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_here
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

## 🎮 Usage

### Starting the Application

1. **Start MongoDB service**
2. **Start Backend Server:**
   ```bash
   cd backend
   npm start
   ```
   Server will run on `http://localhost:5000`

3. **Start Frontend Development Server:**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

### Key Features Usage

#### Real-Time File Editing
- Navigate to any chat room
- Click the "📁 Files" button
- Create new files or open existing ones
- Collaborate with multiple users in real-time
- See live cursors and edits from other users

#### Task Management
- Access the Task Board from the main navigation
- Create, assign, and track tasks
- Use the Kanban board for visual task management
- Set due dates and dependencies

#### Workflow Automation
- Admins can create automated workflows
- Set triggers (task completion, file uploads, etc.)
- Define actions (send notifications, create tasks, etc.)
- Monitor workflow execution

## 🔌 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### File Management
- `GET /api/files/room/:room` - Get files for a room
- `GET /api/files/:fileId` - Get specific file
- `POST /api/files` - Create new file
- `PUT /api/files/:fileId` - Update file content
- `DELETE /api/files/:fileId` - Delete file

### Task Management
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Workflow Management
- `GET /api/workflows` - Get all workflows
- `POST /api/workflows` - Create new workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

### Activity Tracking
- `GET /api/activities` - Get activity feed
- `GET /api/activities/stats` - Get activity statistics

## ⚡ Real-Time Features

### WebSocket Events

#### Chat & Presence
- `joinRoom` - User joins a chat room
- `onlineUsers` - List of users currently in room
- `typing` - User typing indicators

#### File Collaboration
- `joinFile` - User joins file editing session
- `fileEdit` - Real-time content updates
- `cursorMove` - Cursor position updates
- `saveFile` - File save operations
- `userJoinedFile` / `userLeftFile` - Presence updates

#### Activity Tracking
- `activity` - Broadcast user activities
- Real-time notifications for all connected users

### Supported File Types
- JavaScript (.js)
- Python (.py)
- HTML (.html)
- CSS (.css)
- JSON (.json)
- XML (.xml)
- YAML (.yaml)
- SQL (.sql)
- Markdown (.md)
- Plain text files

## 🏗️ Architecture

### Frontend Architecture
- **Component-based** React architecture
- **Context API** for state management
- **Protected routes** with role-based access
- **Responsive design** with CSS modules
- **Animation system** using Framer Motion

### Backend Architecture
- **MVC pattern** with Express.js
- **RESTful API** design
- **WebSocket integration** for real-time features
- **Middleware-based** authentication and validation
- **MongoDB** with Mongoose ODM

### Real-Time Communication
- **Socket.IO** for bidirectional communication
- **Room-based** messaging and file editing
- **Event-driven** architecture
- **Automatic reconnection** handling

### Security Features
- **JWT-based** authentication
- **Password hashing** with bcrypt
- **Role-based** access control
- **CORS** configuration
- **Input validation** and sanitization

## 🎯 Key Components

### FileCollaboration.jsx
- Main file collaboration interface
- Real-time collaborative editing
- Cursor tracking and presence
- Auto-save functionality

### TaskBoard.jsx
- Kanban board for task management
- Drag and drop functionality
- Task creation and assignment
- Status tracking

### AdminDashboard.jsx
- User management interface
- System analytics
- Workflow configuration
- Administrative controls

### ChatRoom.jsx
- Real-time messaging
- File sharing
- User presence indicators
- Room management

## 🔧 Development

### Available Scripts

#### Backend
```bash
npm start          # Start development server with nodemon
npm test           # Run tests
```

#### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Environment Variables
- `MONGO_URI` - MongoDB connection string
- `PORT` - Backend server port
- `CLIENT_URL` - Frontend URL for CORS
- `JWT_SECRET` - Secret for JWT token signing
- `VITE_API_URL` - Backend API URL for frontend

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build and start the server
3. Configure MongoDB connection
4. Set up reverse proxy (nginx recommended)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your web server
3. Configure environment variables
4. Set up proper routing for SPA

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the existing documentation
- Review the code comments
- Open an issue on GitHub

---

**CollabCore** - Empowering teams with real-time collaboration tools since 2024 🚀
