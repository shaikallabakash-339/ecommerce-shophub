# Complete Setup Guide

## Step-by-Step Installation

### Step 1: Extract the Files
```bash
tar -xzf ecommerce-complete.tar.gz
cd ecommerce-complete
```

### Step 2: Create Environment File
```bash
cp .env.example .env
```

### Step 3: Edit .env File
Open `.env` and fill in the following:

```env
# Must Change (Get from Razorpay Dashboard)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxx

# Must Change (Get from Azure Portal)
AZURE_STORAGE_ACCOUNT_NAME=yourstorageaccount
AZURE_STORAGE_ACCOUNT_KEY=your_account_key_here
AZURE_CONTAINER_NAME=ecommerce
AZURE_ENDPOINT=https://yourstorageaccount.blob.core.windows.net

# Optional (generate with: openssl rand -base64 32)
JWT_SECRET=your-random-secret-key

# These work as-is for local development
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=postgres
DB_NAME=ecommerce
REDIS_HOST=redis
REDIS_PORT=6379
```

### Step 4: Start Docker Containers
```bash
# Make sure Docker Desktop is running, then:
docker-compose up -d

# This will:
# 1. Create PostgreSQL database
# 2. Start Redis cache
# 3. Build and start backend API
# 4. Build and start customer website
# 5. Build and start admin dashboard
```

### Step 5: Wait for Services to Be Ready
```bash
# Check status
docker-compose ps

# All services should show "healthy" or "running"
# Wait about 1-2 minutes for builds to complete
```

### Step 6: Verify Services

**Customer Website:**
```bash
curl http://localhost:3000/health
# Should return: healthy
```

**Admin Dashboard:**
```bash
curl http://localhost:3001/health
# Should return: healthy
```

**Backend API:**
```bash
curl http://localhost:5000/health
# Should return: {"status":"Server running","timestamp":"2024-01-01T..."}
```

### Step 7: Open in Browser
- **Customer**: http://localhost:3000
- **Admin**: http://localhost:3001
- **API**: http://localhost:5000/health

### Step 8: Create Admin User

**Method 1: Using curl**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin@123456",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

**Response should be:**
```json
{
  "message": "User registered successfully",
  "user": {"id": 1, "email": "admin@example.com"},
  "token": "eyJhbGc..."
}
```

### Step 9: Make User Admin

```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d ecommerce

# In the psql prompt, run:
UPDATE users SET is_admin = true WHERE email = 'admin@example.com';
\q
```

### Step 10: Login to Admin Dashboard
1. Go to http://localhost:3001
2. Enter credentials:
   - Email: `admin@example.com`
   - Password: `Admin@123456`
3. Click Login

### Step 11: Add Products (Admin)
1. Go to Products page
2. Fill in product details:
   - Name: "Sample Product"
   - Description: "Test product"
   - Price: "999"
   - Category: "Electronics"
   - Stock: "10"
3. Click "Add Product"

### Step 12: Test Customer Website
1. Go to http://localhost:3000
2. Products should appear
3. Click on a product to view details
4. Click "Add to Cart"
5. Go to Cart page
6. Click "Proceed to Checkout"
7. Register or login as customer

### Step 13: Test Payment Flow
1. Fill in shipping address
2. Click "Pay with Razorpay"
3. Use Razorpay test card:
   - Card: `4111 1111 1111 1111`
   - Date: Any future date (e.g., `12/25`)
   - CVV: Any 3 digits (e.g., `123`)
4. Click Pay

## Troubleshooting

### Error: "Cannot connect to Docker daemon"
**Solution:** Make sure Docker Desktop is running

### Error: "Port 5000 already in use"
**Solution:** Change port in docker-compose.yml or kill process using the port
```bash
# On Linux/Mac
lsof -i :5000
kill -9 <PID>

# On Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Error: "Database connection refused"
**Solution:** Wait for PostgreSQL to start (can take 30 seconds)
```bash
# Check logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Error: "Cannot GET /api/products"
**Solution:** Wait for backend to fully start (can take 1-2 minutes for build)
```bash
# Check backend logs
docker-compose logs backend

# Restart if needed
docker-compose restart backend
```

### Blank page in browser
**Solution:** Clear browser cache and refresh
```bash
# Or hard refresh
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

## Common Tasks

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Stop All Services
```bash
docker-compose down
```

### Delete All Data (Fresh Start)
```bash
docker-compose down -v
# Then start again with docker-compose up -d
```

### Restart a Service
```bash
docker-compose restart backend
docker-compose restart customer
docker-compose restart admin
```

### Access Database Directly
```bash
docker-compose exec postgres psql -U postgres -d ecommerce
```

### Access Redis CLI
```bash
docker-compose exec redis redis-cli
```

## Useful URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Customer Site | http://localhost:3000 | Customer shopping |
| Admin Panel | http://localhost:3001 | Admin management |
| Backend API | http://localhost:5000 | API endpoints |
| API Health | http://localhost:5000/health | Status check |
| Razorpay Dashboard | https://dashboard.razorpay.com | Payment testing |

## Default Test Data

Once setup is complete, you can:
1. Create multiple products from admin
2. Add products to cart from customer site
3. Test payment flow with Razorpay test cards
4. Track orders in customer dashboard
5. View analytics in admin dashboard

## Next Steps

1. **Configure Razorpay** with real API keys from https://dashboard.razorpay.com
2. **Configure Azure Storage** with real credentials
3. **Update JWT Secret** in .env for production
4. **Set up SSL/HTTPS** for production
5. **Configure domain names** instead of localhost
6. **Set up email notifications** (optional enhancement)
7. **Deploy to cloud** (AWS, Azure, GCP, etc.)

## Support

If you encounter issues:
1. Check logs: `docker-compose logs -f [service]`
2. Verify .env file has all required keys
3. Ensure ports 3000, 3001, 5000, 5432, 6379 are available
4. Restart Docker Desktop
5. Try fresh installation: `docker-compose down -v && docker-compose up -d`

Good luck! 🚀
