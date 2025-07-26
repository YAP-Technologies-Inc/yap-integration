#!/bin/bash

# Test script to verify YAP application deployment
# Usage: ./test-deployment.sh [server_ip]

set -e

SERVER_IP=${1:-134.199.177.235}

echo "🧪 Testing YAP Application Deployment on $SERVER_IP"
echo "=================================================="

# Test health check
echo "1. Testing health check..."
if curl -f -s http://$SERVER_IP/health > /dev/null; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    exit 1
fi

# Test frontend
echo "2. Testing frontend..."
if curl -f -s http://$SERVER_IP > /dev/null; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
    exit 1
fi

# Test backend API
echo "3. Testing backend API..."
if curl -f -s http://$SERVER_IP/api/health > /dev/null; then
    echo "✅ Backend API is accessible"
else
    echo "❌ Backend API is not accessible"
    exit 1
fi

# Test database connection (via backend)
echo "4. Testing database connection..."
if curl -f -s http://$SERVER_IP/api/health | grep -q "healthy"; then
    echo "✅ Database connection is working"
else
    echo "❌ Database connection failed"
    exit 1
fi

echo ""
echo "🎉 All tests passed! Your YAP application is running successfully."
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://$SERVER_IP"
echo "   Backend API: http://$SERVER_IP/api"
echo "   Health Check: http://$SERVER_IP/health" 