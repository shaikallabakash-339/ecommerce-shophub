# QUICK START GUIDE (5 Minutes)

## For Windows PC - Local Testing ONLY

### Prerequisites
- Docker Desktop installed (https://www.docker.com/products/docker-desktop)

---

## 5-Minute Setup

### Step 1: Extract Files
```powershell
tar -xzf ecommerce-final.tar.gz
cd ecommerce-final
```

### Step 2: Create Environment File
Copy `.env.example` to `.env` or create `.env`:

```powershell
# Create .env file with:
DB_HOST=postgres
DB_PORT=5432
DB_USER=ecommerce_user
DB_PASSWORD=ecommerce_password_123
DB_NAME=ecommerce_db
REDIS_HOST=redis
REDIS_PORT=6379
BACKEND_PORT=5000
NODE_ENV=development
JWT_SECRET=test_secret_key
REACT_APP_API_URL=http://localhost:5000/api
RAZORPAY_KEY_ID=test
RAZORPAY_SECRET_KEY=test
```

### Step 3: Start Everything
```powershell
docker-compose up
```

Wait for output:
```
✓ postgres is ready
✓ redis is ready
✓ backend starting...
✓ customer website ready
✓ admin dashboard ready
```

### Step 4: Open in Browser

- **Customer**: http://localhost:3000
- **Admin**: http://localhost:3001
- **API Health**: http://localhost:5000/api/health

---

## What You See

### Customer Website (http://localhost:3000)
- Product listing
- Shopping cart
- Checkout
- My Orders
- Login

### Admin Dashboard (http://localhost:3001)
- Statistics dashboard
- Add products
- Create sales offers
- View products list

### Backend API (http://localhost:5000)
- Handles all requests
- Manages database
- Processes payments

---

## Stop the Application

```powershell
# Keep running
Ctrl + C (in PowerShell)

# Full stop and cleanup
docker-compose down
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot connect to Docker" | Start Docker Desktop first |
| Port already in use | Change port in docker-compose.yml |
| Database error | Wait 2 minutes for database initialization |
| Blank page in browser | Refresh browser (F5) |
| API connection error | Check REACT_APP_API_URL in .env |

---

## NEXT STEPS

1. ✅ Application running locally
2. Read **DEVELOPMENT.md** to modify code
3. Read **PRODUCTION_DEPLOYMENT.md** to deploy to cloud

---

## IMPORTANT FILES

- `FOLDER_STRUCTURE.md` - Explains folder organization
- `LOCAL_TESTING.md` - Detailed local testing guide
- `DEVELOPMENT.md` - How to modify code
- `PRODUCTION_DEPLOYMENT.md` - How to deploy to production

---

## THAT'S IT!

Your e-commerce platform is running! 🎉
