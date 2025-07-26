# YAP Application - Complete Docker Setup

## 🐳 What We've Created

Your YAP application is now fully dockerized and ready for deployment! Here's what we've set up:

### 📁 Files Created

1. **`docker-compose.yml`** - Orchestrates all services
2. **`init-db.sql`** - Database initialization script
3. **`nginx.conf`** - Reverse proxy configuration
4. **`deploy.sh`** - Automated deployment script
5. **`test-deployment.sh`** - Deployment verification script
6. **`DEPLOYMENT.md`** - Complete deployment guide
7. **`YAPBackend copy/Dockerfile`** - Backend container
8. **`yap-frontend-v2 copy/Dockerfile`** - Frontend container
9. **`.dockerignore` files** - Optimize build context

### 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx (80)    │    │  Frontend (3000)│    │  Backend (4000) │
│   Reverse Proxy │    │   Next.js App   │    │  Node.js API    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ PostgreSQL (5432)│
                    │   Database      │
                    └─────────────────┘
```

### 🚀 Quick Start

1. **Create your `.env` file**:
   ```bash
   PRIVATE_KEY=your_private_key_here
   TOKEN_ADDRESS=your_token_contract_address_here
   FLOWGLAD_SECRET_KEY=your_flowglad_secret_key_here
   DATABASE_URL=postgresql://yapuser:1234@localhost:5432/yapdb
   NEXT_PUBLIC_API_URL=http://134.199.177.235:4000
   ```

2. **Deploy to your server**:
   ```bash
   ./deploy.sh
   ```

3. **Test the deployment**:
   ```bash
   ./test-deployment.sh
   ```

### 🌐 Access Your Application

After deployment, your application will be available at:
- **Frontend**: http://134.199.177.235
- **Backend API**: http://134.199.177.235/api
- **Health Check**: http://134.199.177.235/health

### 🔧 Services Included

1. **PostgreSQL Database**
   - Persistent data storage
   - Automatic table creation
   - User authentication data
   - Lesson progress tracking
   - User statistics

2. **Backend API (Node.js/Express)**
   - User authentication
   - Lesson management
   - Blockchain integration
   - Audio processing
   - Health monitoring

3. **Frontend (Next.js/React)**
   - Modern React interface
   - Responsive design
   - Real-time updates
   - Progressive Web App features

4. **Nginx Reverse Proxy**
   - Load balancing
   - SSL termination ready
   - Rate limiting
   - Security headers
   - CORS handling

### 📊 Management Commands

```bash
# Check status
ssh root@134.199.177.235 'cd /opt/yap-integration && docker-compose ps'

# View logs
ssh root@134.199.177.235 'cd /opt/yap-integration && docker-compose logs -f'

# Restart services
ssh root@134.199.177.235 'cd /opt/yap-integration && docker-compose restart'

# Update application
ssh root@134.199.177.235 'cd /opt/yap-integration && docker-compose pull && docker-compose up -d --build'
```

### 🔒 Security Features

- **Rate limiting** on API endpoints
- **Security headers** via Nginx
- **Container isolation** with Docker networks
- **Environment variable** protection
- **Database access** restricted to internal network

### 📈 Scalability

The setup is designed to be easily scalable:
- **Horizontal scaling** possible with load balancers
- **Database clustering** can be added
- **CDN integration** ready for static assets
- **Monitoring** can be added (Prometheus, Grafana)

### 🛠️ Troubleshooting

If you encounter issues:

1. **Check container logs**:
   ```bash
   docker-compose logs [service_name]
   ```

2. **Verify database connection**:
   ```bash
   docker-compose exec postgres psql -U yapuser -d yapdb
   ```

3. **Test individual services**:
   ```bash
   curl http://134.199.177.235/health
   curl http://134.199.177.235/api/health
   ```

4. **Restart specific service**:
   ```bash
   docker-compose restart [service_name]
   ```

### 🎯 Next Steps

1. **Deploy immediately** with `./deploy.sh`
2. **Set up SSL certificates** for HTTPS
3. **Configure monitoring** and logging
4. **Set up automated backups** for the database
5. **Add CI/CD pipeline** for automated deployments

Your application is now production-ready! 🚀 