# YAP Integration

This repository contains both the frontend (Next.js) and backend (Node.js) for the YAP project, with full Docker deployment support.

## Project Structure

- `yap-frontend-v2 copy/` — Next.js 15 frontend (React 19, TailwindCSS 4)
- `YAPBackend copy/` — Node.js backend (Express, ethers, etc.)
- `docker-compose.yml` — Production deployment configuration
- `nginx.conf` — Reverse proxy configuration
- `deploy.sh` — Automated deployment script

---

## 🚀 Quick Start (Production Deployment)

### 1. Clone the repository
```sh
git clone https://github.com/YAP-Technologies-Inc/yap-integration.git
cd yap-integration
```

### 2. Set up environment variables
Create a `.env` file in the root directory:
```bash
PRIVATE_KEY=your_private_key_here
TOKEN_ADDRESS=your_token_address_here
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_PRIVY_CLIENT_ID=your_privy_client_id
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### 3. Deploy to production server
```sh
# Make deploy script executable
chmod +x deploy.sh

# Deploy to your server (replace with your server IP)
./deploy.sh your-server-ip
```

**Or deploy manually:**
```sh
# Build and start all services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Access your application
- **Frontend**: `https://your-domain.com`
- **Backend API**: `https://your-domain.com/api`
- **Health Check**: `https://your-domain.com/health`

---

## 💻 Local Development

### 1. Install dependencies
#### Backend
```sh
cd "YAPBackend copy"
npm install
```
#### Frontend
```sh
cd "yap-frontend-v2 copy"
npm install
```

### 2. Environment Variables
- **Do NOT commit your `.env` files.**
- `.env` files are already in `.gitignore` and will not be uploaded to GitHub.
- Place your `.env` files in the appropriate folders:
  - `YAPBackend copy/.env`
  - `yap-frontend-v2 copy/.env`

### 3. Running the Project
#### Backend
```sh
cd "YAPBackend copy"
node index.js
```
#### Frontend
```sh
cd "yap-frontend-v2 copy"
npm run dev
```
- The frontend will usually be available at [http://localhost:3000](http://localhost:3000)

---

## 🐳 Docker Deployment

### Architecture
- **Frontend**: Next.js app on port 3000
- **Backend**: Node.js API on port 4000
- **Database**: PostgreSQL on port 5432
- **Reverse Proxy**: Nginx on ports 80/443

### Services
- `frontend` - Next.js application
- `backend` - Node.js API server
- `postgres` - PostgreSQL database
- `nginx` - Reverse proxy and SSL termination

### Commands
```sh
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# View logs
docker-compose logs -f [service-name]

# Check status
docker-compose ps
```

---

## 🔧 Configuration

### Nginx Configuration
- SSL/TLS termination
- CORS headers
- Rate limiting
- Health checks
- Static file serving

### Database Setup
- PostgreSQL with persistent storage
- Automatic schema creation
- User authentication tables
- Lesson completion tracking

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `PRIVATE_KEY` | Blockchain private key | Yes |
| `TOKEN_ADDRESS` | YAP token contract address | Yes |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Privy application ID | Yes |
| `NEXT_PUBLIC_PRIVY_CLIENT_ID` | Privy client ID | Yes |
| `NEXT_PUBLIC_API_URL` | API base URL | Yes |

---

## 📝 Git Usage
- Your `.env` files are protected by `.gitignore` and will not be uploaded.
- To commit and push changes:
```sh
git add .
git commit -m "Your message"
git push
```
- If you need to force push (overwrite remote):
```sh
git push -u origin main --force
```
  **Warning:** This will overwrite the remote branch with your local branch.

---

## 🐛 Troubleshooting

### Common Issues
1. **Port conflicts**: Stop existing services using ports 80, 443, 3000, 4000, 5432
2. **SSL certificate errors**: Ensure SSL certificates are properly mounted
3. **Database connection**: Check PostgreSQL container is running
4. **CORS errors**: Verify nginx configuration and API URL settings

### Debug Commands
```sh
# Check container status
docker-compose ps

# View service logs
docker-compose logs -f [service-name]

# Access container shell
docker-compose exec [service-name] sh

# Check network connectivity
docker-compose exec backend ping postgres
```

---

## 📚 Additional Resources
- [Docker Setup Guide](DOCKER_SETUP.md)
- [Deployment Guide](DEPLOYMENT.md)
- [API Documentation](YAPBackend%20copy/README.md)

---

## Notes
- If you see `Module not found: Can't resolve '@11labs/react'`, install it in the frontend:
  ```sh
  cd "yap-frontend-v2 copy"
  npm install @11labs/react
  ```
- For any issues, check the documentation or open an issue in this repo.

---

## License
[MIT](LICENSE) 