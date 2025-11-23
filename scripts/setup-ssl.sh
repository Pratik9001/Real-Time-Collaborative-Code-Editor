#!/bin/bash

# SSL Certificate Setup Script using Let's Encrypt
# This script sets up proper SSL certificates for production

set -e

DOMAIN=${1:-"your-domain.com"}

if [ "$DOMAIN" = "your-domain.com" ]; then
    echo "❌ Please provide your domain as first argument"
    echo "Usage: ./scripts/setup-ssl.sh your-domain.com"
    exit 1
fi

echo "🔐 Setting up SSL certificate for $DOMAIN"

# Install Certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot
fi

# Create SSL directory
mkdir -p ssl

# Generate certificate
echo "📜 Generating SSL certificate..."
sudo certbot certonly --standalone \
    -d $DOMAIN \
    --email "admin@$DOMAIN" \
    --agree-tos \
    --non-interactive \
    --force-renewal

# Copy certificates to project directory
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*.pem

echo "✅ SSL certificates installed successfully!"

# Set up auto-renewal
echo "🔄 Setting up auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && docker cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $(pwd)/ssl/cert.pem && docker cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $(pwd)/ssl/key.pem && docker-compose -f docker-compose.prod.yml restart nginx") | crontab -

echo "✅ Auto-renewal configured!"

echo "🎉 SSL setup completed!"
echo ""
echo "Your certificates will auto-renew and nginx will restart automatically."