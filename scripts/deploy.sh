#!/bin/bash

# Production Deployment Script for Docker Compose
# This script handles the complete deployment process

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_step "🚀 Starting Production Deployment..."

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root. Use a regular user with Docker permissions."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please run: ./scripts/install-docker.sh"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please run: ./scripts/install-docker.sh"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    echo "Please copy .env.example.prod to .env.production:"
    echo "cp .env.example.prod .env.production"
    echo ""
    echo "Then configure your environment variables, especially:"
    echo "- DOMAIN (set to your actual domain)"
    echo "- CLIENT_URL"
    echo "- API_URL"
    echo "- WS_URL"
    exit 1
fi

# Load environment variables
source .env.production

# Validate required environment variables
required_vars=("DB_PASSWORD" "JWT_SECRET" "JWT_REFRESH_SECRET" "REDIS_PASSWORD")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set!"
        print_warning "Run ./scripts/generate-secrets.sh to generate secure values"
        exit 1
    fi
done

print_success "Environment variables validated"

# Check if using default values (development mode)
if [ "$DOMAIN" = "localhost" ]; then
    print_warning "You're using localhost as domain. This is fine for testing."
    print_warning "For production, update DOMAIN to your actual domain name."
    echo ""
    read -p "Continue with localhost? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Please update DOMAIN in .env.production and try again."
        exit 1
    fi
fi

# Stop any existing containers to avoid conflicts
print_step "🛑 Stopping any existing containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Create necessary directories
print_step "📁 Creating directories..."
mkdir -p ssl logs backups

# Generate or update SSL certificates
if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
    print_step "📜 Generating SSL certificate..."

    if [ "$DOMAIN" = "localhost" ]; then
        # Generate self-signed certificate for localhost
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        print_success "Self-signed SSL certificate generated for localhost"
    else
        print_warning "For production domains, consider using Let's Encrypt:"
        echo "    ./scripts/setup-ssl.sh $DOMAIN"
        echo ""
        print_step "📜 Generating self-signed certificate (for testing only)..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=${DOMAIN}"
        print_success "Self-signed SSL certificate generated (replace with production certificate)"
    fi
else
    print_success "SSL certificate exists"
fi

# Set proper permissions for SSL files
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

# Pull latest images
print_step "📦 Pulling Docker images..."
docker-compose -f docker-compose.prod.yml pull

# Build custom images
print_step "🔨 Building application images..."
docker-compose -f docker-compose.prod.yml build --no-cache

print_success "Docker images built"

# Run database migrations
print_step "🗄️ Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm backend npm run migrate

# Start production containers
print_step "🚀 Starting production containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
print_step "⏳ Waiting for services to start..."
sleep 20

# Check service health
print_step "🔍 Checking service health..."

# Function to check if service is healthy
check_service_health() {
    local service_name=$1
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f docker-compose.prod.yml ps | grep -q "${service_name}.*Up (healthy)"; then
            print_success "$service_name is healthy"
            return 0
        elif docker-compose -f docker-compose.prod.yml ps | grep -q "${service_name}.*Up"; then
            echo -n "."
        else
            print_error "$service_name failed to start"
            return 1
        fi

        sleep 2
        ((attempt++))
    done

    print_error "$service_name health check timed out"
    return 1
}

# Check each service
services=("postgres" "redis" "backend" "frontend")
all_healthy=true

for service in "${services[@]}"; do
    if ! check_service_health $service; then
        all_healthy=false
    fi
done

echo ""

if [ "$all_healthy" = true ]; then
    print_success "All services are healthy! 🎉"
else
    print_warning "Some services may not be fully ready. Check logs:"
    echo "docker-compose -f docker-compose.prod.yml logs"
fi

# Show deployment status
echo ""
print_step "📊 Deployment Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
print_success "🎉 Deployment completed successfully!"
echo ""

# Show access information
if [ "$DOMAIN" = "localhost" ]; then
    echo "📱 Your application is available at:"
    echo "   🌐 Frontend: https://localhost"
    echo "   🔌 API: https://localhost/api"
    echo ""
    echo "⚠️  You'll see a browser warning about self-signed certificate."
    echo "   Click 'Advanced' → 'Proceed to localhost' to continue."
else
    echo "📱 Your application is available at: https://$DOMAIN"
fi

echo ""
echo "🔧 Useful commands:"
echo "   📋 View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   🛑 Stop services: docker-compose -f docker-compose.prod.yml down"
echo "   🔄 Update deployment: ./scripts/deploy.sh"
echo "   💾 Create backup: ./scripts/backup.sh"
echo ""
echo "⚠️  Important for production:"
echo "   1. Replace self-signed SSL certificate with proper one"
echo "   2. Set up regular backups with: crontab -e → '0 2 * * * /path/to/scripts/backup.sh'"
echo "   3. Configure monitoring and alerting"
echo "   4. Review and update security settings"