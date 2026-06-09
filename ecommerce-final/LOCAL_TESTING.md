# LOCAL TESTING GUIDE (Windows PC)

## IMPORTANT: LOCAL TESTING ONLY - NOT FOR PRODUCTION

This guide is for testing on your Windows PC using Docker Desktop.

---

## PREREQUISITES

### What You Need Installed

1. **Docker Desktop for Windows**
   - Download: https://www.docker.com/products/docker-desktop
   - Size: ~500 MB
   - Installation: Just click "Install"

2. **Git for Windows** (Optional but recommended)
   - Download: https://git-scm.com/download/win
   - Used to: Clone projects

3. **VS Code** (Optional, for editing)
   - Download: https://code.visualstudio.com/

---

## STEP-BY-STEP LOCAL TESTING

### STEP 1: Extract Project Files

**On Windows:**

```powershell
# Go to where you downloaded the file
cd C:\Users\YourName\Downloads

# Extract (or use Windows Explorer to right-click > Extract)
tar -xzf ecommerce-final.tar.gz

# Navigate to project
cd ecommerce-final
```

---

### STEP 2: Create .env File

**In `ecommerce-final/` folder, create `.env` file:**

```env
# DATABASE (Local testing)
DB_HOST=postgres
DB_PORT=5432
DB_USER=ecommerce_user
DB_PASSWORD=ecommerce_password_123
DB_NAME=ecommerce_db

# REDIS (Local testing)
REDIS_HOST=redis
REDIS_PORT=6379

# BACKEND
BACKEND_PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_12345

# FRONTEND API
REACT_APP_API_URL=http://localhost:5000/api

# RAZORPAY (Get from https://dashboard.razorpay.com)
RAZORPAY_KEY_ID=your_razorpay_key_here
RAZORPAY_SECRET_KEY=your_razorpay_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# AZURE STORAGE (Get from Azure Portal)
AZURE_STORAGE_ACCOUNT_NAME=your_account_name
AZURE_STORAGE_ACCOUNT_KEY=your_account_key
AZURE_CONTAINER_NAME=ecommerce-images

# PORTS (For local testing)
CUSTOMER_PORT=3000
ADMIN_PORT=3001
```

**Note**: For local testing, you can use dummy values for Razorpay and Azure. They won't actually process, but the app will run.

---

### STEP 3: Start Everything with Docker Compose

**In PowerShell (in ecommerce-final folder):**

```powershell
# Start all services (takes 1-2 minutes first time)
docker-compose up

# You should see:
# postgres is ready
# redis is ready
# backend starting...
# customer website building...
# admin dashboard building...
# 
# When you see "Ready to accept connections" for all, it's done
```

**Keep this PowerShell window open!**

---

### STEP 4: Access the Applications

**Open in your browser:**

- **Customer Website**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3001
- **Backend API**: http://localhost:5000/api/health

---

## STEP 5: Testing the Application

### Test Customer Website

1. Go to http://localhost:3000
2. Click "Register" or "Sign Up"
3. Create account with:
   - Email: test@example.com
   - Password: Test123!
4. Browse products
5. Add item to cart
6. Go to checkout

### Test Admin Dashboard

1. Go to http://localhost:3001
2. Login with admin credentials (if available)
3. Add new product
4. Create sale offer
5. See in customer website immediately

---

## COMMON ISSUES & FIXES

### Issue 1: Docker Not Running

**Error**: "Cannot connect to Docker daemon"

**Fix**:
```powershell
# Start Docker Desktop
# Wait 30 seconds
# Try again:
docker-compose up
```

### Issue 2: Port Already in Use

**Error**: "Port 3000 already in use" or "Port 5000 already in use"

**Fix**:
```powershell
# Kill the process using that port
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Or change port in docker-compose.yml
```

### Issue 3: Database Connection Failed

**Error**: "Cannot connect to database"

**Fix**:
```powershell
# Check if containers are running
docker ps

# If postgres not running:
docker-compose down
docker-compose up --build

# Wait for database to initialize (2-3 minutes)
```

### Issue 4: Frontend Can't Connect to Backend

**Error**: "Network Error" when loading products

**Fix**:
- Check `.env` file has correct `REACT_APP_API_URL=http://localhost:5000/api`
- Rebuild: `docker-compose up --build`
- Clear browser cache: Ctrl+Shift+Delete

---

## STOPPING THE APPLICATION

**In PowerShell:**

```powershell
# Stop all containers (doesn't delete data)
docker-compose down

# Stop and remove all data
docker-compose down -v

# Stop containers but keep running
Ctrl + C (in PowerShell)
```

---

## VIEWING LOGS

**See what's happening:**

```powershell
# All logs
docker-compose logs

# Backend logs only
docker-compose logs backend

# Customer website logs
docker-compose logs customer

# Admin dashboard logs
docker-compose logs admin

# Follow logs (live updates)
docker-compose logs -f backend
```

---

## DATABASE ACCESS (For Testing)

**Connect directly to database:**

```powershell
# Enter PostgreSQL container
docker-compose exec postgres psql -U ecommerce_user -d ecommerce_db

# List tables
\dt

# View users
SELECT * FROM users;

# Exit
\q
```

---

## MAKING CHANGES WHILE RUNNING

### Change Frontend Code
1. Edit file in `amazon-customer-website/src/`
2. Save
3. Browser auto-reloads (React hot reload)

### Change Backend Code
1. Edit file in `backend-api/`
2. Save
3. Restart backend: `docker-compose restart backend`

### Change Database Schema
1. Edit `backend-api/init.sql`
2. Stop: `docker-compose down`
3. Start: `docker-compose up --build`

---

## TESTING CHECKLIST

- [ ] Docker Desktop is running
- [ ] `docker-compose up` shows no errors
- [ ] http://localhost:3000 loads (customer website)
- [ ] http://localhost:3001 loads (admin dashboard)
- [ ] http://localhost:5000/api/health returns "OK"
- [ ] Can register new user
- [ ] Can login
- [ ] Can view products
- [ ] Can add to cart
- [ ] Admin can login
- [ ] Admin can add products
- [ ] Products appear on customer site immediately

---

## WHAT'S RUNNING WHERE

| Service | Port | Technology | Status Command |
|---------|------|-----------|-----------------|
| Customer Website | 3000 | React | http://localhost:3000 |
| Admin Dashboard | 3001 | React | http://localhost:3001 |
| Backend API | 5000 | Node.js | http://localhost:5000/api/health |
| Database | 5432 | PostgreSQL | Internal only |
| Cache | 6379 | Redis | Internal only |

---

## PERFORMANCE NOTES

First time running:
- Docker images download: 2-5 minutes
- Database initialization: 1-2 minutes
- React build: 2-3 minutes
- **Total**: First run takes ~5-10 minutes

Subsequent runs:
- **Startup time**: 30-60 seconds
- **Hot reload**: ~2 seconds (when you change code)

---

## NEXT STEPS

1. ✅ Follow this guide for local testing
2. → Read DEVELOPMENT.md to modify code
3. → Read PRODUCTION_DEPLOYMENT.md when ready to deploy

---

## NEED HELP?

If something doesn't work:

1. Check logs: `docker-compose logs`
2. Restart everything: `docker-compose restart`
3. Rebuild everything: `docker-compose down && docker-compose up --build`
4. Check ports: `netstat -ano`
5. Check Docker is running: Open Docker Desktop app

---

## LOCAL TESTING SUMMARY

✅ Extract files
✅ Create .env
✅ Run `docker-compose up`
✅ Access http://localhost:3000
✅ Test features
✅ Check logs if issues

**Everything runs on your PC. No internet needed (except for optional APIs).**
