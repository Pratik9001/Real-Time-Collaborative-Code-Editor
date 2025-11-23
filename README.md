# Real-Time Collaborative Code Editor

A web application that allows multiple users to simultaneously edit code documents with real-time synchronization using WebSockets. Built with React, Node.js, and Monaco Editor.

## Features

### 🚀 Core Functionality
- **Real-time Collaboration**: Multiple users can edit the same document simultaneously
- **Live Cursor Tracking**: See where other users are typing with colored indicators
- **Selection Sync**: Show what text other users have selected
- **Operational Transformation**: Conflict-free editing with robust algorithm
- **Document Sharing**: Share documents with unique links and permission controls

### 👥 User Experience
- **Authentication**: Secure JWT-based login/registration system
- **User Profiles**: Personal settings, preferences, and avatars
- **Typing Indicators**: See when others are actively typing
- **Presence System**: Online/offline status with user avatars
- **Document Management**: Create, save, and organize multiple code documents

### 💻 Code Editor
- **Monaco Editor**: VS Code editor with syntax highlighting
- **Language Support**: JavaScript, TypeScript, Python, Java, C++, Go, Rust, and more
- **IntelliSense**: Auto-completion, error highlighting, and code formatting
- **Theme Support**: Dark and light themes
- **Keyboard Shortcuts**: Professional editing experience

### 🔧 Technical Features
- **WebSocket Communication**: Socket.io for real-time updates
- **Database**: PostgreSQL for document storage, Redis for sessions
- **API Security**: Rate limiting, input validation, and CORS protection
- **Responsive Design**: Mobile-friendly interface
- **Docker Support**: Complete development environment setup

## Tech Stack

### Frontend
- **React 18** - User interface framework
- **Vite** - Fast development server and build tool
- **Monaco Editor** - Code editing component (VS Code engine)
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.io Client** - Real-time WebSocket communication
- **Zustand** - State management
- **React Router** - Navigation and routing
- **React Hook Form** - Form handling and validation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.io** - WebSocket server for real-time communication
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Primary database
- **Redis** - Session storage and caching
- **Knex.js** - SQL query builder and migrations
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **PostgreSQL** - Production-ready database
- **Redis** - In-memory data structure store

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (optional but recommended)

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Real-Time-Collaborative-Code-Editor
   ```

2. **Start the development environment**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Database: localhost:5432
   - Redis: localhost:6379

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd server && npm install

   # Install frontend dependencies
   cd ../client && npm install
   ```

2. **Set up environment variables**
   ```bash
   # Backend
   cp server/.env.example server/.env
   # Edit server/.env with your database and Redis settings

   # Frontend
   cp client/.env.example client/.env
   # Edit client/.env with your API URLs
   ```

3. **Start services**
   ```bash
   # Start PostgreSQL and Redis (required)
   docker-compose up postgres redis -d

   # Run database migrations
   cd server
   npm run migrate

   # Start backend (in one terminal)
   npm run dev

   # Start frontend (in another terminal)
   cd ../client
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## Environment Variables

### Backend (server/.env)
```env
# Server Configuration
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=collaborative_editor_dev
DB_SSL=false

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (client/.env)
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
```

## Database Setup

### Using Docker (Recommended)
The PostgreSQL container will be automatically created and configured when you run `docker-compose up`.

### Manual Setup
1. Create PostgreSQL database:
   ```sql
   CREATE DATABASE collaborative_editor_dev;
   ```

2. Run migrations:
   ```bash
   cd server
   npm run migrate
   ```

3. (Optional) Run seeders:
   ```bash
   npm run seed
   ```

## Project Structure

```
Real-Time-Collaborative-Code-Editor/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API and WebSocket services
│   │   ├── store/         # State management
│   │   ├── types/         # TypeScript definitions
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── vite.config.ts
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript definitions
│   │   ├── utils/         # Utility functions
│   │   └── migrations/    # Database migrations
│   ├── package.json
│   └── knexfile.ts
├── docker-compose.yml     # Development environment
└── README.md
```

## Development

### Running Tests
```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test

# Run tests with coverage
npm run test:coverage
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run typecheck
```

### Database Management
```bash
# Create new migration
npm run migrate:make <migration_name>

# Run migrations
npm run migrate

# Rollback migrations
npm run migrate:rollback

# Reset database
npm run migrate:reset
```

## Deployment

### Production Build
```bash
# Build frontend
cd client && npm run build

# Build backend
cd server && npm run build

# Start production server
npm start
```

### Docker Production
```bash
# Build and run production containers
docker-compose -f docker-compose.prod.yml up --build
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Document Endpoints
- `GET /api/documents` - Get user documents
- `POST /api/documents` - Create new document
- `GET /api/documents/:id` - Get document by ID
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/share` - Share document

### WebSocket Events
- `join_document` - Join a document editing session
- `leave_document` - Leave a document session
- `text_operation` - Send/receive text operations
- `cursor_position` - Send/receive cursor positions
- `user_typing` - Send/receive typing indicators

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.

## Roadmap

- [ ] Video/voice chat integration (WebRTC)
- [ ] Advanced document permissions
- [ ] Version history and branching
- [ ] Document templates and snippets
- [ ] Advanced search and filtering
- [ ] Mobile app development
- [ ] Plugin system for extensions
- [ ] Enterprise features (SSO, audit logs)

---

**Built with ❤️ for developers who love collaboration**