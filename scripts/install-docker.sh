#!/bin/bash

# Docker Installation Script for Ubuntu/Debian
# Run with: sudo ./scripts/install-docker.sh

set -e

echo "🐳 Installing Docker and Docker Compose..."

# Update package index
sudo apt-get update

# Install packages to allow apt to use a repository over HTTPS
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up the stable repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add current user to docker group
sudo usermod -aG docker $USER

echo "✅ Docker and Docker Compose installed successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Log out and log back in to apply Docker group changes"
echo "2. Run 'docker --version' to verify installation"
echo "3. Run 'docker-compose --version' to verify Docker Compose"
echo ""
echo "⚠️  If you get permission errors, run 'newgrp docker' or log out/in"