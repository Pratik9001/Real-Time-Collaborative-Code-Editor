# Contributing to Real-Time Collaborative Code Editor

Thank you for your interest in contributing to the Real-Time Collaborative Code Editor! This document will guide you through the contribution process.

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork**
3. **Set up development environment**
4. **Make your changes**
5. **Test your changes**
6. **Submit a pull request**

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for local development)
- Git

### Setup Instructions

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/real-time-collaborative-code-editor.git
cd real-time-collaborative-code-editor

# 2. Install all dependencies
npm run install:all

# 3. Start development environment
./scripts/start-dev.sh

# 4. Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

## 📋 Development Guidelines

### Code Style

We use the following tools to maintain code quality:

- **ESLint** for JavaScript/TypeScript linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Husky** for git hooks

#### Before committing:

```bash
# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm test

# Type check
npm run typecheck
```

### Git Workflow

1. **Create a feature branch** from `main`
2. **Make your changes** with small, focused commits
3. **Test thoroughly** before submitting
4. **Submit a pull request** to `main`

#### Branch Naming

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

#### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(editor): add syntax highlighting for Rust`
- `fix(auth): resolve JWT expiration issue`
- `docs(api): update authentication documentation`
- `refactor(database): optimize query performance`

## 🏗️ Project Structure

```
real-time-collaborative-code-editor/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API and WebSocket services
│   │   ├── store/         # State management (Zustand)
│   │   ├── types/         # TypeScript definitions
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── migrations/    # Database migrations
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript definitions
│   │   └── utils/         # Utility functions
├── scripts/               # Deployment and utility scripts
├── k8s/                   # Kubernetes configurations
├── nginx/                 # Nginx configuration
└── docs/                  # Documentation
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- test-file.test.ts
```

### Writing Tests

- **Unit tests** for individual functions and components
- **Integration tests** for API endpoints and services
- **E2E tests** for user workflows
- **Performance tests** for critical paths

#### Test Structure

```typescript
// Example unit test
import { describe, it, expect, beforeEach } from '@jest/globals';
import { MyService } from '../services/MyService';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    service = new MyService();
  });

  it('should perform operation correctly', () => {
    const result = service.doSomething();
    expect(result).toBe(expectedValue);
  });
});
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description** of the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs **actual behavior**
4. **Environment details** (OS, browser, Node.js version)
5. **Screenshots** if applicable
6. **Error messages** from browser console

### Bug Report Template

```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Ubuntu 20.04]
- Browser: [e.g., Chrome 91.0]
- Node.js: [e.g., 18.0.0]

## Screenshots
[Attach screenshots if applicable]

## Additional Context
[Any other relevant information]
```

## 💡 Feature Requests

We welcome feature requests! Please:

1. **Check existing issues** first
2. **Describe the problem** you're trying to solve
3. **Propose a solution** if you have one
4. **Consider the impact** on existing users

### Feature Request Template

```markdown
## Problem Statement
What problem does this feature solve?

## Proposed Solution
Describe your proposed solution

## Alternatives Considered
What other approaches did you consider?

## Additional Context
[Any other relevant information]
```

## 📚 Documentation

### Types of Documentation

- **README.md** - Main project documentation
- **API documentation** - API endpoints and usage
- **Code comments** - Inline code documentation
- **Guides** - Step-by-step tutorials

### Documentation Guidelines

- Use clear, concise language
- Include code examples
- Keep documentation up to date
- Use consistent formatting

## 🔧 Development Tools

### Recommended VS Code Extensions

- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Docker
- GitLens
- Auto Rename Tag

### Browser Development Tools

- Chrome DevTools
- React Developer Tools
- Redux DevTools (if applicable)

## 🚀 Pull Request Process

### Before Submitting

1. **Test your changes** thoroughly
2. **Update documentation** if needed
3. **Add tests** for new features
4. **Ensure CI passes**
5. **Rebase** if necessary

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass locally
- [ ] CI passes
```

## 🏷️ Labels

We use these labels to categorize issues and pull requests:

- `bug` - Bug reports
- `enhancement` - Feature requests
- `documentation` - Documentation changes
- `good first issue` - Good for newcomers
- `help wanted` - Community help needed
- `priority: high` - High priority
- `priority: low` - Low priority

## 🤝 Getting Help

If you need help:

1. **Check existing issues** and documentation
2. **Join our discussions** or Discord (if available)
3. **Ask questions** in relevant issues
4. **Review similar projects** for patterns

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

We appreciate all contributions to this project! Whether you're fixing a bug, implementing a feature, improving documentation, or just providing feedback, you're helping make the Real-Time Collaborative Code Editor better for everyone.

---

**Happy coding!** 🚀