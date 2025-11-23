#!/bin/bash

# Development Environment Starter
# Quick way to start the development environment

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Development Environment...${NC}"

# Stop any existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.dev.yml down 2>/dev/null || true

# Start services
echo -e "${BLUE}📦 Starting development containers...${NC}"
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to start
echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
sleep 15

# Check if services are running
echo -e "${BLUE}🔍 Checking service status...${NC}"
docker-compose -f docker-compose.dev.yml ps

# Run database migrations
echo -e "${BLUE}🗄️ Running database migrations...${NC}"
docker-compose -f docker-compose.dev.yml exec backend npm run migrate

echo -e "${GREEN}✅ Development environment is ready!${NC}"
echo ""
echo "📱 Your application is available at:"
echo "   🌐 Frontend: http://localhost:5173"
echo "   🔌 Backend API: http://localhost:3001"
echo ""
echo "🔧 Useful commands:"
echo "   📋 View logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "   🛑 Stop services: docker-compose -f docker-compose.dev.yml down"
echo "   🔄 Restart: docker-compose -f docker-compose.dev.yml restart"
echo ""
echo "📊 Development database:"
echo "   🗄️ PostgreSQL: localhost:5432"
echo "   🔴 Redis: localhost:6379"
echo ""
echo "🎉 Start coding! Your collaborative editor is ready for development."