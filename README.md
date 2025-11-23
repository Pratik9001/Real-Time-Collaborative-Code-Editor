# 🚀 Real-Time Collaborative Code Editor

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white)](https://socket.io/)

**A powerful web application that allows multiple users to simultaneously edit code documents with real-time synchronization using WebSockets. Built with React, Node.js, and Monaco Editor.**

[**Live Demo**](https://your-demo-link.com) • [**Documentation**](docs/) • [**Quick Start**](QUICKSTART.md) • [**Deployment Guide**](DEPLOYMENT.md)

</div>

## ✨ Features

### 🚀 Core Functionality
- **🤝 Real-time Collaboration** - Multiple users can edit the same document simultaneously
- **👆 Live Cursor Tracking** - See where other users are typing with colored indicators
- **📝 Selection Sync** - Show what text other users have selected
- **⚡ Operational Transformation** - Conflict-free editing with robust algorithm
- **🔗 Document Sharing** - Share documents with unique links and permission controls

### 👥 User Experience
- **🔐 Authentication** - Secure JWT-based login/registration system
- **👤 User Profiles** - Personal settings, preferences, and avatars
- **⌨️ Typing Indicators** - See when others are actively typing
- **👁️ Presence System** - Online/offline status with user avatars
- **📄 Document Management** - Create, save, and organize multiple code documents

### 💻 Code Editor
- **🎨 Monaco Editor** - VS Code editor with syntax highlighting
- **🌍 Language Support** - JavaScript, TypeScript, Python, Java, C++, Go, Rust, and more
- **🧠 IntelliSense** - Auto-completion, error highlighting, and code formatting
- **🌙 Theme Support** - Dark and light themes
- **⌨️ Keyboard Shortcuts** - Professional editing experience

### 🔧 Technical Features
- **🔌 WebSocket Communication** - Socket.io for real-time updates
- **🗄️ Database** - PostgreSQL for document storage, Redis for sessions
- **🔒 API Security** - Rate limiting, input validation, and CORS protection
- **📱 Responsive Design** - Mobile-friendly interface
- **🐳 Docker Support** - Complete development environment setup

## 🛠️ Tech Stack

### Frontend
- **React 18** - User interface framework
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast development server and build tool
- **Monaco Editor** - Code editing component (VS Code engine)
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.io Client** - Real-time WebSocket communication
- **Zustand** - Lightweight state management
- **React Router** - Navigation and routing
- **React Hook Form** - Form handling and validation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.io** - WebSocket server for real-time communication
- **TypeScript** - Type-safe backend development
- **PostgreSQL** - Primary database with full-text search
- **Redis** - Session storage and caching
- **Knex.js** - SQL query builder and migrations
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and load balancer
- **PostgreSQL** - Production-ready database
- **Redis** - In-memory data structure store

## 🚀 Quick Start

### 🐳 Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/real-time-collaborative-code-editor.git
   cd real-time-collaborative-code-editor
   ```

2. **Deploy with one command**
   ```bash
   ./scripts/deploy.sh
   ```

3. **Access your application**
   - 🌐 Frontend: `https://localhost`
   - 🔌 API: `https://localhost/api`

That's it! 🎉 Your collaborative code editor is running!

### 🛠️ Development Setup

```bash
# Clone repository
git clone https://github.com/your-username/real-time-collaborative-code-editor.git
cd real-time-collaborative-code-editor

# Install all dependencies
npm run install:all

# Start development environment
./scripts/start-dev.sh

# Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

## 📖 Documentation

- **[Quick Start Guide](QUICKSTART.md)** - Get running in minutes
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions
- **[GitHub Upload Guide](GITHUB.md)** - Upload to GitHub
- **[Contributing Guide](CONTRIBUTING.md)** - Development guidelines

## 🌐 Live Demo

Experience the collaborative editor in action:
[**Try it live →**](https://demo.example.com)

- ✨ Create a new document
- 👥 Share the link with friends
- 🤝 Collaborate in real-time
- 💬 See live cursors and typing indicators
- 🔗 Test multi-language support

## 🎯 Use Cases

- **👥 Pair Programming** - Code together with teammates
- **📚 Educational Settings** - Collaborative coding lessons
- **💬 Code Reviews** - Real-time feedback and discussions
- **🏢 Team Coding** - Collaborative development sessions
- **🎓 Remote Work** - Pair programming from anywhere
- **👨‍🏫 Technical Interviews** - Live coding interviews

## 📊 Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   React Client   │◄──►│   Node.js API   │
│  (Monaco Editor)  │    │  (Socket.io)    │
│                 │    │                 │
│  • Real-time UI  │    │  • WebSocket   │
│  • Cursors      │    │  • Auth/JWT     │
│  • Typing       │    │  • API Routes   │
└─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   PostgreSQL    │◄─── Redis
                       │   • Documents   │
                       │   • Users        │
                       │   • Operations   │
                       └─────────────────┘
```

## 🔧 Development

### 📋 Prerequisites

- **Node.js 18+** and npm
- **Docker** and Docker Compose

### 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# E2E testing
npm run test:e2e
```

### 📝 Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run typecheck
```

## 🚀 Production Deployment

### 📦 Production Docker Compose

```bash
# Deploy to production
./scripts/deploy.sh

# Production with custom domain
DOMAIN=yourdomain.com ./scripts/deploy.sh

# Set up SSL certificates
./scripts/setup-ssl.sh yourdomain.com
```

### ☁️ Cloud Deployment

Supports deployment to:
- **AWS** (ECS, EC2, RDS)
- **Google Cloud** (Cloud Run, Cloud SQL)
- **DigitalOcean** (App Platform, Droplets)
- **Azure** (Container Instances)
- **Heroku** (Docker deployment)

## 🏷️ Repository Structure

```
real-time-collaborative-code-editor/
├── 📁 client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API and WebSocket services
│   │   ├── store/         # State management (Zustand)
│   │   ├── types/         # TypeScript definitions
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── vite.config.ts
├── 📁 server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── migrations/    # Database migrations
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript definitions
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── knexfile.ts
├── 📁 scripts/               # Deployment and utility scripts
├── 📁 k8s/                   # Kubernetes configurations
├── 📁 nginx/                 # Nginx configuration
├── 📄 docker-compose.yml     # Development setup
├── 📄 docker-compose.prod.yml # Production setup
├── 📄 QUICKSTART.md          # Quick deployment guide
├── 📄 DEPLOYMENT.md          # Detailed deployment guide
├── 📄 CONTRIBUTING.md        # Development guidelines
├── 📄 LICENSE                # MIT License
└── 📄 README.md              # This file
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md).

### 🚀 Quick Contribution

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=your-username/real-time-collaborative-code-editor&type=Date)]

## 🔗 Links

- **[Live Demo](https://demo.example.com)**
- **[Issues](https://github.com/your-username/real-time-collaborative-code-editor/issues)**
- **[Discussions](https://github.com/your-username/real-time-collaborative-code-editor/discussions)**

## 💬 Support

- **Issues**: Report bugs or request features
- **Discussions**: Ask questions and share ideas
- **Email**: [your-email@example.com](mailto:your-email@example.com)

---

<div align="center">

**Built with ❤️ for developers who love collaboration**

[⭐ Star this repo](https://github.com/your-username/real-time-collaborative-code-editor) • [🐛 Report Issue](https://github.com/your-username/real-time-collaborative-code-editor/issues) • [📖 Documentation](docs/)

</div>