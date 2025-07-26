#!/bin/bash

# YAP Application Deployment Script
# Usage: ./deploy.sh [server_ip]

set -e

SERVER_IP=${1:-157.230.214.76}
PROJECT_NAME="yap-integration"

echo "🚀 Deploying YAP Application to $SERVER_IP"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with the following variables:"
    echo "PRIVATE_KEY=your_private_key"
    echo "TOKEN_ADDRESS=your_token_address"
    echo "FLOWGLAD_SECRET_KEY=your_flowglad_secret"
    exit 1
fi

# Create deployment directory on server
echo "📁 Creating deployment directory..."
ssh root@$SERVER_IP "mkdir -p /opt/$PROJECT_NAME"

# Copy files to server
echo "📤 Copying files to server..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'uploads' ./ root@$SERVER_IP:/opt/$PROJECT_NAME/

# Copy .env file
scp .env root@$SERVER_IP:/opt/$PROJECT_NAME/

# Install Docker and Docker Compose on server if not present
echo "🐳 Installing Docker and Docker Compose..."
ssh root@$SERVER_IP << 'EOF'
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        systemctl enable docker
        systemctl start docker
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
EOF

# Deploy application
echo "🚀 Deploying application..."
ssh root@$SERVER_IP << EOF
    cd /opt/$PROJECT_NAME
    
    # Stop existing containers
    docker-compose down || true
    
    # Remove old images
    docker system prune -f
    
    # Build and start containers
    docker-compose up -d --build
    
    # Wait for services to be ready
    echo "⏳ Waiting for services to start..."
    sleep 30
    
    # Check service status
    docker-compose ps
    
    # Show logs
    echo "📋 Recent logs:"
    docker-compose logs --tail=20
EOF

echo "✅ Deployment completed!"
echo "🌐 Your application should be available at:"
echo "   Frontend: https://yapapp.io"
echo "   Backend API: https://yapapp.io/api"
echo ""
echo "📊 To check status: ssh root@$SERVER_IP 'cd /opt/$PROJECT_NAME && docker-compose ps'"
echo "📋 To view logs: ssh root@$SERVER_IP 'cd /opt/$PROJECT_NAME && docker-compose logs -f'" 