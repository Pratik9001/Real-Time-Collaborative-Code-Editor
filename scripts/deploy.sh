#!/bin/bash

# Production Deployment Script
# This script deploys the collaborative code editor to production

set -e

echo "🚀 Starting Production Deployment..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    echo "Please copy .env.example.prod to .env.production and configure it."
    exit 1
fi

# Load environment variables
source .env.production

# Validate required environment variables
required_vars=("DOMAIN" "DB_PASSWORD" "JWT_SECRET" "JWT_REFRESH_SECRET" "REDIS_PASSWORD")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set!"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Create SSL directory if it doesn't exist
mkdir -p ssl

# Generate SSL certificate if it doesn't exist
if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
    echo "📜 Generating SSL certificate..."

    # Generate self-signed certificate for testing
    # In production, replace this with Let's Encrypt or your own certificates
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/key.pem \
        -out ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=${DOMAIN}"

    echo "✅ SSL certificate generated (self-signed for testing)"
else
    echo "✅ SSL certificate exists"
fi

# Pull latest images and build
echo "📦 Building and pulling Docker images..."
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml build --no-cache

echo "✅ Docker images built"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm backend npm run migrate

# Start production containers
echo "🚀 Starting production containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check if services are running
echo "🔍 Checking service health..."
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up (healthy)"; then
    echo "✅ All services are healthy!"
else
    echo "❌ Some services are not healthy. Check logs with: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi

# Show status
echo "📊 Deployment Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📱 Your application is available at: https://${DOMAIN}"
echo ""
echo "🔧 Useful commands:"
echo "  View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  Stop services: docker-compose -f docker-compose.prod.yml down"
echo "  Update deployment: ./scripts/deploy.sh"
echo ""
echo "⚠️  Don't forget to:"
echo "  - Replace the self-signed SSL certificate with a proper one"
echo "  - Set up proper backups for your database"
echo "  - Configure monitoring and alerting"
echo "  - Review security settings"