#!/bin/bash

# GitHub Upload Script for Real-Time Collaborative Code Editor
# This script helps you upload your entire project to GitHub

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_step "📤 GitHub Upload Script for Real-Time Collaborative Code Editor"

# Check if Git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    echo "Visit: https://git-scm.com/downloads"
    exit 1
fi

print_success "Git is installed"

# Get GitHub username
echo ""
print_step "📝 Enter your GitHub username:"
read -p "GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    print_error "GitHub username is required!"
    exit 1
fi

# Get repository name
REPO_NAME="real-time-collaborative-code-editor"
echo ""
print_step "📝 Repository name (default: $REPO_NAME):"
read -p "Repository name [$REPO_NAME]: " INPUT_REPO_NAME
REPO_NAME=${INPUT_REPO_NAME:-$REPO_NAME}

# Initialize Git repository if not already done
print_step "🔧 Initializing Git repository..."
if [ ! -d ".git" ]; then
    git init
    print_success "Git repository initialized"
else
    print_success "Git repository already exists"
fi

# Configure Git user if not set
if [ -z "$(git config user.name)" ]; then
    echo ""
    print_step "📝 Enter your Git configuration:"
    read -p "Your name: " GIT_NAME
    read -p "Your email: " GIT_EMAIL
    git config user.name "$GIT_NAME"
    git config user.email "$GIT_EMAIL"
    print_success "Git configuration set"
fi

# Add all files to Git
print_step "📦 Adding all files to Git..."
git add .

# Check if there are any files to commit
if git diff --cached --quiet; then
    print_warning "No files to add. All files might be ignored by .gitignore."
else
    print_success "Files added to Git"
fi

# Create initial commit
print_step "💾 Creating initial commit..."
git commit -m "🚀 Initial commit: Real-Time Collaborative Code Editor

✨ Features:
- Real-time collaborative code editing with WebSockets
- Live cursor tracking and typing indicators
- User authentication with JWT
- Document sharing and permissions
- Multi-language support (20+ programming languages)
- Modern React + Node.js architecture
- Docker deployment ready
- Comprehensive testing setup

🏗️ Tech Stack:
- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, Socket.io, PostgreSQL, Redis
- Code Editor: Monaco Editor (VS Code engine)
- Deployment: Docker, Nginx, SSL/TLS

📚 Complete documentation and deployment guides included.

🎯 Ready for collaborative coding experiences!" || {
    print_warning "No changes to commit (might be already committed)"
}

# Create GitHub repository
print_step "🌐 Setting up GitHub repository..."
REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# Check if remote already exists
if git remote get-url origin >/dev/null 2>&1; then
    print_warning "Remote 'origin' already exists. Updating..."
    git remote set-url origin "$REPO_URL"
else
    git remote add origin "$REPO_URL"
    print_success "Remote 'origin' added: $REPO_URL"
fi

# Instructions for creating repository on GitHub
echo ""
print_step "📋 Manual GitHub Repository Creation:"
echo ""
echo "Please follow these steps to create the GitHub repository:"
echo ""
echo "1. 🌐 Open GitHub: https://github.com"
echo "2. 🔐 Sign in to your GitHub account"
echo "3. ➕ Click the '+' button in the top-right corner"
echo "4. 📁 Select 'New repository'"
echo "5. 📝 Fill in repository details:"
echo "   - Repository name: $REPO_NAME"
echo "   - Description: A web application using WebSockets to allow multiple users to simultaneously edit the same document with real-time cursor synchronization"
echo "   - Visibility: Choose Public or Private"
echo "   - ⚠️  IMPORTANT: Do NOT initialize with README, .gitignore, or license"
echo "6. 🎯 Click 'Create repository'"
echo ""
echo "After creating the repository, press Enter to continue..."
read -p "Press Enter when repository is created on GitHub..."

# Push to GitHub
print_step "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main || {
    print_error "Failed to push to GitHub!"
    echo ""
    echo "Possible reasons:"
    echo "1. Repository doesn't exist on GitHub"
    echo "2. Authentication issues (GitHub token needed)"
    echo "3. Network connectivity issues"
    echo ""
    echo "Troubleshooting:"
    echo "- Make sure the repository exists: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo "- Set up GitHub Personal Access Token for authentication"
    echo "- Check your internet connection"
    exit 1
}

print_success "Code pushed to GitHub successfully!"

# Success message
echo ""
print_success "🎉 Upload completed successfully!"
echo ""
echo "📱 Your repository is now available at:"
echo "   🔗 https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "🔧 Next steps:"
echo "   1. 📖 Visit your repository on GitHub"
echo "   2. ⭐ Add a README (it's already there!)"
echo "   3. 🏷️ Add topics: collaborative-editor, real-time, websocket, monaco-editor, react, nodejs"
echo "   4. 🔧 Set up GitHub Actions for CI/CD"
echo "   5. 📢 Share your project with the community!"
echo ""
print_success "Your Real-Time Collaborative Code Editor is now live on GitHub! 🚀"