# YAP Application Deployment Guide

## Prerequisites

1. **Server Access**: SSH access to your server (157.230.214.76)
2. **Environment Variables**: Create a `.env` file with the following variables:

```bash
# Blockchain Configuration
PRIVATE_KEY=your_private_key_here
TOKEN_ADDRESS=your_token_contract_address_here

# Flowglad Configuration
FLOWGLAD_SECRET_KEY=your_flowglad_secret_key_here

# Database Configuration (for local development)
DATABASE_URL=postgresql://yapuser:1234@localhost:5432/yapdb

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://134.199.177.235:4000
```

## Quick Deployment

1. **Create .env file** with your actual values
2. **Run the deployment script**:
   ```bash
   ./deploy.sh
   ```

The script will:
- Install Docker and Docker Compose on the server
- Copy your code to `/opt/yap-integration/`
- Build and start all containers
- Set up Nginx reverse proxy

## Manual Deployment

If you prefer to deploy manually:

1. **SSH into your server**:
   ```bash
   ssh root@157.230.214.76
   ```

2. **Create deployment directory**:
   ```bash
   mkdir -p /opt/yap-integration
   ```

3. **Copy files to server**:
   ```bash
   rsync -avz --exclude 'node_modules' --exclude '.git' ./ root@157.230.214.76:/opt/yap-integration/
   ```

4. **Install Docker** (if not already installed):
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   systemctl enable docker
   systemctl start docker
   ```

5. **Install Docker Compose**:
   ```bash
   curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   chmod +x /usr/local/bin/docker-compose
   ```

6. **Deploy the application**:
   ```bash
   cd /opt/yap-integration
   docker-compose up -d --build
   ```

## Application URLs

After deployment, your application will be available at:

- **Frontend**: http://134.199.177.235
- **Backend API**: http://134.199.177.235/api
- **Health Check**: http://134.199.177.235/health

## Management Commands

### Check Status
```bash
ssh root@157.230.214.76 'cd /opt/yap-integration && docker-compose ps'
```

### View Logs
```bash
ssh root@157.230.214.76 'cd /opt/yap-integration && docker-compose logs -f'
```

### Restart Services
```bash
ssh root@157.230.214.76 'cd /opt/yap-integration && docker-compose restart'
```

### Stop Services
```bash
ssh root@157.230.214.76 'cd /opt/yap-integration && docker-compose down'
```

### Update Application
```bash
ssh root@157.230.214.76 'cd /opt/yap-integration && docker-compose pull && docker-compose up -d --build'
```

## Architecture

The deployment includes:

1. **PostgreSQL Database** (port 5432)
   - Persistent data storage
   - Automatic initialization with required tables

2. **Backend API** (port 4000)
   - Node.js/Express server
   - Handles authentication, lessons, and blockchain interactions

3. **Frontend** (port 3000)
   - Next.js application
   - React-based user interface

4. **Nginx Reverse Proxy** (ports 80, 443)
   - Routes traffic to appropriate services
   - Handles SSL termination (when configured)
   - Rate limiting and security headers

## Troubleshooting

### Check Container Logs
```bash
docker-compose logs [service_name]
```

### Access Database
```bash
docker-compose exec postgres psql -U yapuser -d yapdb
```

### Restart Specific Service
```bash
docker-compose restart [service_name]
```

### View Resource Usage
```bash
docker stats
```

## Security Notes

- The application runs behind Nginx with security headers
- Rate limiting is enabled for API endpoints
- Database is only accessible within the Docker network
- Environment variables should be kept secure and not committed to version control 