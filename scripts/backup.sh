#!/bin/bash

# Database Backup Script
# This script creates backups of the PostgreSQL database

set -e

# Load environment variables
source .env.production

# Backup configuration
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/collaborative_editor_backup_${TIMESTAMP}.sql"
CONTAINER_NAME="collaborative-editor-db-prod"

# Create backup directory
mkdir -p ${BACKUP_DIR}

echo "🗄️ Creating database backup..."

# Create backup
docker exec ${CONTAINER_NAME} pg_dump -U ${DB_USER} ${DB_NAME} > ${BACKUP_FILE}

# Compress backup
gzip ${BACKUP_FILE}

echo "✅ Backup created: ${BACKUP_FILE}.gz"

# Keep only the last 10 backups
echo "🧹 Cleaning up old backups..."
ls -t ${BACKUP_DIR}/*.sql.gz | tail -n +11 | xargs -r rm

echo "✅ Backup process completed"