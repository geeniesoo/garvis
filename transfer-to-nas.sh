#!/bin/bash

# Transfer script for Garvis to Synology NAS
# Usage: ./transfer-to-nas.sh

NAS_IP="192.168.0.110"
NAS_USER="genesoo"
NAS_PATH="/volume1/docker/garvis"

echo "🚀 Transferring Garvis to NAS at $NAS_IP"

# Create tar file with all necessary files
echo "📦 Creating transfer package..."
tar -czf garvis-deploy.tar.gz \
    src/ \
    package.json \
    tsconfig.json \
    Dockerfile \
    docker-compose.yml \
    .dockerignore \
    .env.example \
    README.md \
    CLAUDE.md \
    spec/

echo "📤 Transferring files to NAS..."
scp garvis-deploy.tar.gz $NAS_USER@$NAS_IP:/tmp/

echo "🔧 Setting up on NAS via SSH..."
ssh $NAS_USER@$NAS_IP << 'ENDSSH'
    # Navigate to existing directory
    cd /volume1/docker/garvis
    
    # Extract files
    sudo tar -xzf /tmp/garvis-deploy.tar.gz
    
    # Create logs and data directories
    sudo mkdir -p logs data
    sudo chmod 755 logs data
    
    # Clean up
    rm /tmp/garvis-deploy.tar.gz
    
    echo "✅ Files extracted to /volume1/docker/garvis"
    ls -la
ENDSSH

echo "🎉 Transfer complete!"
echo "Next steps:"
echo "1. SSH into your NAS: ssh genesoo@192.168.0.110"
echo "2. Navigate to: cd /volume1/docker/garvis"
echo "3. Create .env file with your Slack tokens"
echo "4. Run: docker-compose up -d"