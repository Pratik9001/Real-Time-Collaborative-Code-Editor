#!/bin/bash

# Generate Secure Secrets for Production
# This script generates secure random strings for JWT secrets and passwords

set -e

echo "🔐 Generating secure secrets..."

# Generate JWT secrets (32 characters minimum)
JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

# Generate secure passwords
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

echo "✅ Secure secrets generated!"
echo ""
echo "📝 Generated secrets:"
echo "JWT_SECRET: $JWT_SECRET"
echo "JWT_REFRESH_SECRET: $JWT_REFRESH_SECRET"
echo "DB_PASSWORD: $DB_PASSWORD"
echo "REDIS_PASSWORD: $REDIS_PASSWORD"
echo ""

# Update .env.production file
if [ -f ".env.production" ]; then
    echo "🔄 Updating .env.production file..."

    # Backup original file
    cp .env.production .env.production.backup

    # Update secrets
    sed -i "s/your-super-secure-jwt-secret-key-change-this-in-production-min-32-chars/$JWT_SECRET/" .env.production
    sed -i "s/your-super-secure-refresh-key-change-this-in-production-min-32-chars/$JWT_REFRESH_SECRET/" .env.production
    sed -i "s/ChangeThisSecurePassword123!/$DB_PASSWORD/" .env.production
    sed -i "s/ChangeThisRedisPassword456!/$REDIS_PASSWORD/" .env.production

    echo "✅ .env.production updated with secure secrets!"
    echo ""
    echo "⚠️  Please review and update other values in .env.production:"
    echo "- DOMAIN (set to your actual domain)"
    echo "- CLIENT_URL"
    echo "- API_URL"
    echo "- WS_URL"
    echo "- Email configuration (optional)"
else
    echo "❌ .env.production file not found!"
    echo "Please copy .env.example.prod to .env.production first."
fi

echo ""
echo "🎉 Secrets generation completed!"