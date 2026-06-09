# Installation Guide

Complete setup instructions for the Enterprise E-Commerce Platform.

## System Requirements

### Minimum
- CPU: 2 cores
- RAM: 4GB
- Storage: 10GB
- OS: Linux, macOS, or Windows (WSL2)

### Recommended (Production)
- CPU: 4+ cores
- RAM: 16GB+
- Storage: 50GB SSD
- OS: Linux (Ubuntu 20.04+)

## Prerequisites

### Required Software
1. **Docker & Docker Compose** (latest version)
   ```bash
   # macOS
   brew install docker docker-compose
   
   # Ubuntu/Debian
   sudo apt-get install docker.io docker-compose
   ```

2. **Node.js 18+** (for local development)
   ```bash
   # Using nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   ```

3. **Git**
   ```bash
   # macOS
   brew install git
   
   # Ubuntu/Debian
   sudo apt-get install git
   ```

### Azure Account
- Create Azure Storage Account
- Create PostgreSQL Database
- Create Redis Cache
- Get connection strings

### Razorpay Account
- Create Razorpay account
- Get API Key and Secret from dashboard

## Installation Steps

### 1. Extract Archive

```bash
# Extract the downloaded archive
tar -xzf ecommerce-platform-v1.0.tar.gz
cd v0-project
```

### 2. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit with your settings
nano .env
# or
vim .env
# or
code .env  # VS Code
```

**Set these required variables:**
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce
DB_USER=postgres
DB_PASSWORD=your-secure-password  # Generate: openssl rand -base64 32

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=$(openssl rand -base64 32)  # Generate secure key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
AZURE_CONTAINER_NAME=products
AZURE_STORAGE_URL=https://yourstorage.blob.core.windows.net

# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY=rzp_test_xxxxxx
```

### 3. Docker Compose Setup (Recommended)

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Verify services are running:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/health
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### 4. Local Development Setup (Alternative)

#### 4.1 Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp ../.env .env

# Initialize database
npm run migrate

# Start development server
npm run dev
```

The backend will start on http://localhost:5000

#### 4.2 Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file (optional, uses defaults)
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local

# Start development server
npm start
```

The frontend will start on http://localhost:3000

### 5. Database Initialization

#### With Docker Compose
```bash
# Database initialization happens automatically
# Verify with:
docker-compose exec postgres psql -U postgres -d ecommerce -c "\dt"
```

#### Manual Setup
```bash
# Connect to database
psql -h localhost -U postgres -d ecommerce

# Or run migration file
psql -h localhost -U postgres -f backend/src/migrations/001-initial-schema.sql -d ecommerce
```

### 6. First-Time Setup

#### Create Admin Account

```bash
# Access the API
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin@123456",
    "first_name": "Admin",
    "last_name": "User",
    "phone": "+919876543210"
  }'
```

#### Update User to Admin (Database)

```bash
docker-compose exec postgres psql -U postgres -d ecommerce

-- Update user to admin
UPDATE users SET is_admin = true WHERE email = 'admin@example.com';

-- Verify
SELECT email, is_admin FROM users;
```

#### Create Sample Products

```bash
# Use the API to upload products via admin panel
# Or insert directly into database
docker-compose exec postgres psql -U postgres -d ecommerce

INSERT INTO products (sku, name, description, price, category, image_urls, stock_quantity) 
VALUES ('PROD001', 'Sample Product', 'A great product', 999.99, 'Electronics', '{""}'::text[], 50);
```

### 7. Verify Installation

```bash
# Test Backend
curl http://localhost:5000/health
# Expected: {"status":"OK","timestamp":"..."}

# Test Frontend Health
curl http://localhost:3000/health
# Expected: healthy

# Test Database Connection
docker-compose exec postgres psql -U postgres -c "SELECT version();"

# Test Redis Connection
docker-compose exec redis redis-cli ping
# Expected: PONG
```

### 8. Access Applications

Open in your browser:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Docs** (if implemented): http://localhost:5000/api-docs

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=5001
FRONTEND_URL=http://localhost:5001
```

### Database Connection Error

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Verify credentials
docker-compose exec postgres psql -U postgres -c "SELECT 1;"

# Reset database
docker-compose down -v
docker-compose up -d
```

### Redis Connection Error

```bash
# Check Redis is running
docker-compose ps redis

# Test connection
docker-compose exec redis redis-cli ping

# Check logs
docker-compose logs redis
```

### Build Fails

```bash
# Clear Docker cache
docker-compose down
docker system prune -a
docker-compose up --build

# Check Node version
node --version  # Should be v18+
npm --version   # Should be 9+

# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Application Crashes

```bash
# View full logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check resource usage
docker stats

# Increase memory if needed
# Edit docker-compose.yml and add:
# services:
#   backend:
#     environment:
#       - NODE_OPTIONS=--max-old-space-size=1024
```

## Configuration

### Scaling for Development

```bash
# Increase backend replicas
docker-compose up -d --scale backend=2

# Set custom resource limits in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Enable HTTPS (Development)

```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

# Update Nginx config to use HTTPS
# Edit frontend/nginx.conf to listen on 443
```

## Backup & Restore

### Backup Database

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U postgres ecommerce > backup.sql

# Backup entire Docker volume
docker run --rm -v ecommerce_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

### Restore Database

```bash
# Restore from SQL dump
docker-compose exec -T postgres psql -U postgres < backup.sql

# Restore from tar backup
docker run --rm -v ecommerce_postgres_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## Production Deployment

For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## Getting Help

### Check Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Port 5432 in use | `docker-compose down -v && docker-compose up -d` |
| Container won't start | Check `docker-compose logs <service>` |
| Database migration failed | Recreate database: `docker-compose down -v` |
| API not responding | Check Redis and PostgreSQL are running |
| Frontend blank page | Check browser console for errors |

### Support

- Documentation: [README.md](./README.md)
- Deployment Guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- GitHub Issues: Create an issue with logs
- Email: support@ecommerce.com

## Next Steps

1. ✅ Installation complete
2. Create admin account
3. Upload products via admin panel
4. Create sales offers
5. Test checkout with Razorpay test keys
6. Setup monitoring and alerts
7. Configure production deployment

Happy coding! 🚀
