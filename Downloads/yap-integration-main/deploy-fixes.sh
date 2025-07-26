#!/bin/bash

# Deploy Frontend Fixes to Server
# This script uploads all the files we've fixed to remove localhost URLs

set -e

SERVER_IP="157.230.214.76"
PROJECT_NAME="yap-integration"

echo "🚀 Deploying frontend fixes to $SERVER_IP"

# Upload the fixed frontend files
echo "📤 Uploading fixed frontend files..."

# Upload the auth page
scp "yap-frontend-v2 copy/src/app/auth/page.tsx" root@$SERVER_IP:/opt/$PROJECT_NAME/yap-frontend-v2\ copy/src/app/auth/

# Upload the dashboard components
scp "yap-frontend-v2 copy/src/components/dashboard/DailyStreak.tsx" root@$SERVER_IP:/opt/$PROJECT_NAME/yap-frontend-v2\ copy/src/components/dashboard/

# Upload the lesson components
scp "yap-frontend-v2 copy/src/components/lesson/LessonUi.tsx" root@$SERVER_IP:/opt/$PROJECT_NAME/yap-frontend-v2\ copy/src/components/lesson/

# Upload the auth components
scp "yap-frontend-v2 copy/src/components/auth/SignUpForm.tsx" root@$SERVER_IP:/opt/$PROJECT_NAME/yap-frontend-v2\ copy/src/components/auth/

# Upload the hooks
scp "yap-frontend-v2 copy/src/hooks/useUserProfile.ts" root@$SERVER_IP:/opt/$PROJECT_NAME/yap-frontend-v2\ copy/src/hooks/
scp "yap-frontend-v2 copy/src/hooks/useCompletedLessons.ts" root@$SERVER_IP:/opt/$PROJECT_NAME/yap-frontend-v2\ copy/src/hooks/
scp "yap-frontend-v2 copy/src/hooks/useUserStats.ts" root@$SERVER_IP:/opt/$PROJECT_NAME/yap-frontend-v2\ copy/src/hooks/

# Upload the updated environment file
scp .env root@$SERVER_IP:/opt/$PROJECT_NAME/

# Upload the updated docker-compose.yml
scp docker-compose.yml root@$SERVER_IP:/opt/$PROJECT_NAME/

echo "✅ Files uploaded successfully!"

# SSH into server and rebuild frontend
echo "🔄 Rebuilding frontend on server..."
ssh root@$SERVER_IP << 'EOF'
cd /opt/yap-integration

# Stop frontend container
echo "Stopping frontend container..."
docker-compose stop frontend

# Rebuild and start frontend
echo "Rebuilding frontend..."
docker-compose up -d --build frontend

# Check status
echo "Checking container status..."
docker-compose ps

echo "✅ Frontend rebuild completed!"
echo "🌐 Your application should be available at: https://yapapp.io"
EOF

echo "🎉 Frontend fixes deployed successfully!"
echo "📊 To check status: ssh root@$SERVER_IP 'cd /opt/$PROJECT_NAME && docker-compose ps'"
echo "📋 To view logs: ssh root@$SERVER_IP 'cd /opt/$PROJECT_NAME && docker-compose logs -f frontend'" 