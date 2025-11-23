# Deployment Guide

This guide covers deploying the Real-Time Collaborative Code Editor to production using Docker.

## 🚀 Quick Start

### Prerequisites

- **Server**: Linux (Ubuntu 20.04+ recommended) with Docker and Docker Compose
- **Domain**: A registered domain name pointing to your server
- **SSL**: SSL certificate (Let's Encrypt recommended)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in to apply Docker group changes
```

### Step 2: Application Setup

```bash
# Clone the repository
git clone <your-repository-url>
cd Real-Time-Collaborative-Code-Editor

# Configure environment
cp .env.example.prod .env.production
nano .env.production  # Edit with your configuration
```

### Step 3: SSL Setup

```bash
# Set up SSL certificates
./scripts/setup-ssl.sh your-domain.com

# Or use your own certificates
# Place cert.pem and key.pem in the ssl/ directory
```

### Step 4: Deploy

```bash
# Deploy the application
./scripts/deploy.sh
```

That's it! Your application will be available at `https://your-domain.com`

## 📋 Detailed Configuration

### Environment Variables (.env.production)

```env
# Domain Configuration
DOMAIN=your-domain.com
CLIENT_URL=https://your-domain.com
API_URL=https://your-domain.com/api
WS_URL=https://your-domain.com

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_secure_db_password
DB_NAME=collaborative_editor
DB_SSL=true

# Redis Configuration
REDIS_PASSWORD=your_secure_redis_password

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
```

### Security Considerations

1. **Strong Passwords**: Use strong, unique passwords for database and Redis
2. **JWT Secrets**: Generate secure random strings for JWT secrets
3. **SSL**: Always use HTTPS in production
4. **Firewall**: Configure firewall to allow only necessary ports
5. **Updates**: Keep Docker and system packages updated

### Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 🏗️ Deployment Options

### Option 1: Docker Compose (Recommended)

**Pros**: Easy to set up, includes all services, portable
**Cons**: Single-server deployment

```bash
# Deploy
./scripts/deploy.sh

# Update
./scripts/deploy.sh

# Stop
docker-compose -f docker-compose.prod.yml down

# Logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Option 2: Cloud Services

#### DigitalOcean App Platform

1. Create a new app
2. Connect your GitHub repository
3. Configure environment variables
4. Set up database (PostgreSQL)
5. Deploy

#### AWS ECS/RDS

1. Push Docker images to ECR
2. Create ECS cluster
3. Set up RDS PostgreSQL instance
4. Configure load balancer with SSL
5. Deploy services

#### Google Cloud Run

1. Build and push to Container Registry
2. Create Cloud Run services
3. Set up Cloud SQL for PostgreSQL
4. Configure custom domain

### Option 3: Kubernetes

**Pros**: Scalable, container orchestration
**Cons**: More complex setup

```yaml
# k8s/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: collaborative-editor-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: collaborative-editor-backend
  template:
    metadata:
      labels:
        app: collaborative-editor-backend
    spec:
      containers:
      - name: backend
        image: your-registry/collaborative-editor-backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        # ... other environment variables
```

## 🔧 Maintenance

### Backups

```bash
# Manual backup
./scripts/backup.sh

# Automated backups (add to crontab)
0 2 * * * /path/to/scripts/backup.sh
```

### Updates

```bash
# Update application
git pull
./scripts/deploy.sh

# Update system
sudo apt update && sudo apt upgrade -y
```

### Monitoring

```bash
# Check service health
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

## 🔍 Troubleshooting

### Common Issues

#### SSL Certificate Issues

```bash
# Check certificate expiration
openssl x509 -in ssl/cert.pem -text -noout | grep "Not After"

# Renew with Let's Encrypt
sudo certbot renew
```

#### Database Connection Issues

```bash
# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres

# Test database connection
docker-compose -f docker-compose.prod.yml exec backend npm run db:test
```

#### Service Not Starting

```bash
# Check logs for errors
docker-compose -f docker-compose.prod.yml logs

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

### Performance Tuning

#### Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_documents_owner_id ON documents(owner_id);
CREATE INDEX idx_document_access_document_id ON document_access(document_id);
CREATE INDEX idx_operations_document_id ON operations(document_id);
```

#### Nginx Optimization

```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 2048;

# Enable caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 📊 Scaling

### Horizontal Scaling

```bash
# Scale backend services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Load balancer configuration in nginx.conf
upstream backend {
    server backend_1:3001;
    server backend_2:3001;
    server backend_3:3001;
}
```

### Database Scaling

- **Read Replicas**: Set up PostgreSQL read replicas
- **Connection Pooling**: Use PgBouncer
- **Caching**: Implement Redis caching layer

## 🔐 Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Strong passwords for all services
- [ ] Firewall configured properly
- [ ] JWT secrets are secure and unique
- [ ] Database access restricted
- [ ] Regular security updates applied
- [ ] Monitoring and logging enabled
- [ ] Backup strategy implemented
- [ ] Rate limiting configured
- [ ] CORS configured for production domain

## 🚀 Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrations run
- [ ] All services healthy
- [ ] Load balancer configured
- [ ] Monitoring set up
- [ ] Backups automated
- [ ] DNS configured
- [ ] SSL auto-renewal set up
- [ ] Performance testing completed

## 📞 Support

If you encounter issues during deployment:

1. Check the logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify environment variables
3. Ensure all services are healthy
4. Check SSL certificate validity
5. Review firewall configuration

For additional support, create an issue in the repository.