# 🚀 Quick Start Guide - Docker Compose Deployment

This guide will help you deploy the Real-Time Collaborative Code Editor in minutes using Docker Compose.

## ⚡ One-Command Deployment

```bash
# Deploy the application (works out of the box for testing)
./scripts/deploy.sh
```

That's it! 🎉 Your application will be available at `https://localhost`

## 📋 Detailed Steps

### Step 1: Prerequisites

Make sure you have Docker and Docker Compose installed:

```bash
# Check if Docker is installed
docker --version
docker-compose --version

# If not installed, run:
./scripts/install-docker.sh
```

### Step 2: Configure Environment (Optional)

For testing, the default configuration works fine. For production:

```bash
# Copy environment template
cp .env.example.prod .env.production

# Generate secure secrets
./scripts/generate-secrets.sh

# Edit configuration (set your domain, etc.)
nano .env.production
```

### Step 3: Deploy

```bash
# Deploy with default settings (localhost)
./scripts/deploy.sh
```

The script will:
- ✅ Validate your configuration
- ✅ Generate SSL certificates (self-signed for testing)
- ✅ Build and start all services
- ✅ Run database migrations
- ✅ Perform health checks

### Step 4: Access Your Application

Open your browser and navigate to:
- **Frontend**: `https://localhost`
- **API**: `https://localhost/api`

> ⚠️ **Browser Warning**: You'll see a security warning about the self-signed certificate. Click "Advanced" → "Proceed to localhost" to continue.

## 🎯 What You Get

With this deployment, you'll have:

### 📱 **Application Features**
- ✅ Real-time collaborative code editing
- ✅ User authentication and registration
- ✅ Live cursor tracking and typing indicators
- ✅ Document sharing and permissions
- ✅ Multiple programming language support
- ✅ Modern responsive UI

### 🏗️ **Infrastructure**
- ✅ PostgreSQL database
- ✅ Redis for sessions
- ✅ Nginx reverse proxy
- ✅ SSL/TLS encryption
- ✅ Health monitoring
- ✅ Automated backups (manual trigger)

## 🔧 Common Tasks

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Stop Services
```bash
docker-compose -f docker-compose.prod.yml down
```

### Update Deployment
```bash
git pull
./scripts/deploy.sh
```

### Create Backup
```bash
./scripts/backup.sh
```

### Restart Services
```bash
docker-compose -f docker-compose.prod.yml restart
```

## 🌐 Production Deployment

For production deployment with your own domain:

### 1. Update Configuration
```bash
# Edit .env.production
nano .env.production

# Update these values:
DOMAIN=yourdomain.com
CLIENT_URL=https://yourdomain.com
API_URL=https://yourdomain.com/api
WS_URL=https://yourdomain.com
```

### 2. Set Up SSL (Optional but Recommended)
```bash
# For Let's Encrypt (requires port 80 access)
./scripts/setup-ssl.sh yourdomain.com

# Or use your own certificates
# Place cert.pem and key.pem in the ssl/ directory
```

### 3. Deploy
```bash
./scripts/deploy.sh
```

### 4. Update DNS
Point your domain's A record to your server's IP address.

## 🔍 Troubleshooting

### Port Conflicts
If you get port conflicts, check what's using the ports:
```bash
# Check port 80/443
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Stop conflicting services if needed
sudo systemctl stop nginx  # Example
```

### Permission Issues
If you get permission errors:
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and log back in, or run:
newgrp docker
```

### Database Issues
```bash
# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres

# Reset database (WARNING: This deletes all data)
docker-compose -f docker-compose.prod.yml down
docker volume rm collaborative-editor_postgres_data
./scripts/deploy.sh
```

### SSL Issues
```bash
# Regenerate SSL certificates
rm ssl/cert.pem ssl/key.pem
./scripts/deploy.sh
```

## 📊 Monitoring

### Check Service Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Health Checks
All services have built-in health checks. The deployment script verifies these automatically.

### Resource Usage
```bash
# Check resource usage
docker stats

# Check disk usage
docker-compose -f docker-compose.prod.yml exec df -h
```

## 🔒 Security Notes

- **Default passwords** are generated automatically
- **SSL certificates** are self-signed for testing
- **JWT secrets** are generated randomly
- **All traffic** is encrypted with HTTPS
- **Rate limiting** is configured
- **Input validation** is enabled

For production, replace self-signed certificates with proper ones and review all security settings.

## 🎉 Success!

If everything worked, you now have a fully functional Real-Time Collaborative Code Editor running! 🚀

- Register a new account
- Create your first document
- Share the link with friends
- Collaborate in real-time

Need help? Check the [Deployment Guide](DEPLOYMENT.md) or create an issue in the repository.