# FOLDER STRUCTURE EXPLANATION

## Clean, Simple Structure (As Requested)

```
ecommerce-final/
├── amazon-customer-website/          ← Customer Shopping App (React)
│   ├── src/                          ← Source code
│   │   ├── pages/                    ← Page components (Home, Cart, Login, etc)
│   │   ├── components/               ← Reusable components (Header, Footer, etc)
│   │   ├── context/                  ← State management (Auth, Cart state)
│   │   ├── styles/                   ← CSS files
│   │   ├── App.js                    ← Main app with routing
│   │   └── index.js                  ← React entry point
│   ├── public/                       ← Static files (index.html, images)
│   ├── package.json                  ← Dependencies
│   └── Dockerfile                    ← Docker config (LOCAL TESTING)
│
├── admin-seller-dashboard/           ← Admin Management App (React)
│   ├── src/                          ← Source code
│   │   ├── pages/                    ← Admin pages (Dashboard, Products, Offers)
│   │   ├── components/               ← Admin components (Header, Sidebar)
│   │   ├── context/                  ← Admin state management
│   │   ├── styles/                   ← CSS files
│   │   ├── App.js                    ← Main admin app
│   │   └── index.js                  ← React entry point
│   ├── public/                       ← Static files
│   ├── package.json                  ← Dependencies
│   └── Dockerfile                    ← Docker config (LOCAL TESTING)
│
├── backend-api/                      ← Backend Server (Node.js/Express)
│   ├── routes/                       ← API endpoints
│   │   ├── auth.js                   ← Login, Register, Profile
│   │   ├── products.js               ← Get products, search
│   │   ├── cart.js                   ← Cart operations
│   │   ├── orders.js                 ← Order management
│   │   ├── payments.js               ← Razorpay integration
│   │   ├── admin.js                  ← Admin operations
│   │   └── uploads.js                ← Azure storage
│   │
│   ├── models/                       ← Database helpers
│   │   └── db.js                     ← Database connections
│   │
│   ├── middleware/                   ← Middleware
│   │   ├── auth.js                   ← JWT authentication
│   │   └── errorHandler.js           ← Error handling
│   │
│   ├── config/                       ← Configuration
│   │   └── database.js               ← Database config
│   │
│   ├── server.js                     ← Main Express server
│   ├── package.json                  ← Dependencies
│   └── Dockerfile                    ← Docker config (LOCAL TESTING)
│
├── docker-compose.yml                ← LOCAL TESTING configuration
├── .env.example                      ← Environment template
├── FOLDER_STRUCTURE.md              ← This file
├── LOCAL_TESTING.md                 ← Local testing guide
├── DEVELOPMENT.md                   ← Development guide
└── PRODUCTION_DEPLOYMENT.md         ← Production deployment guide
```

---

## HOW THIS FOLDER STRUCTURE WORKS

### 1. **Three Independent Applications**

Each folder is a **completely separate application**:

#### amazon-customer-website/
- **What it is**: Customer shopping website
- **Technology**: React.js
- **Port**: 3000
- **What it does**:
  - Displays products
  - Shopping cart
  - Checkout
  - Order tracking
  - User dashboard
- **Communicates with**: Backend API (localhost:5000)

#### admin-seller-dashboard/
- **What it is**: Admin management panel
- **Technology**: React.js
- **Port**: 3001
- **What it does**:
  - Add/edit products
  - Create sales offers
  - View orders
  - Dashboard statistics
- **Communicates with**: Backend API (localhost:5000)

#### backend-api/
- **What it is**: Server handling all logic
- **Technology**: Node.js + Express
- **Port**: 5000
- **What it does**:
  - Handles API requests
  - Manages database
  - Processes payments
  - Handles file uploads
  - Authenticates users
- **Communicates with**: PostgreSQL database, Redis cache, Razorpay API, Azure Storage

---

### 2. **Data Flow**

```
USER BROWSER (Windows PC)
         ↓
[amazon-customer-website] (http://localhost:3000)
         ↓ (makes API calls)
    Backend API (http://localhost:5000)
         ↓
   PostgreSQL Database
   Redis Cache
   Razorpay API
   Azure Storage
```

---

### 3. **Folder Structure Advantages**

| Folder | Purpose | Why This Way |
|--------|---------|-------------|
| `amazon-customer-website/` | Customer app | Separated = Easy to maintain |
| `admin-seller-dashboard/` | Admin app | Separate = Different features |
| `backend-api/` | Server | One backend = All data flows here |
| `docker-compose.yml` | Start everything | One command = All services run |

---

### 4. **Starting the Application**

#### On Windows PC (Local Testing):

```bash
# 1. Navigate to project folder
cd ecommerce-final

# 2. Start all services
docker-compose up

# 3. Open in browser:
# Customer:  http://localhost:3000
# Admin:     http://localhost:3001
# API:       http://localhost:5000/api/health
```

---

### 5. **File Organization Logic**

#### React Apps (Frontend)
```
src/
├── pages/          ← Full page components (always rendered)
├── components/     ← Reusable small components
├── context/        ← Shared state (auth, cart)
├── styles/         ← CSS for styling
├── App.js          ← Routes all pages
└── index.js        ← React entry point
```

#### Node.js App (Backend)
```
routes/     ← Define endpoints (/api/products, /api/login, etc)
models/     ← Database helper functions
middleware/ ← Authentication, error handling
config/     ← Database, settings
server.js   ← Start the server
```

---

### 6. **Environment Variables (.env)**

All three apps read from single `.env` file:

```env
# Backend
BACKEND_PORT=5000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=ecommerce

# Frontend
REACT_APP_API_URL=http://localhost:5000/api

# Payment
RAZORPAY_KEY_ID=your_key
RAZORPAY_SECRET_KEY=your_secret

# Storage
AZURE_ACCOUNT_NAME=your_account
AZURE_ACCOUNT_KEY=your_key
```

---

### 7. **How Docker Works with This Structure**

`docker-compose.yml` **automatically**:
1. Starts PostgreSQL database (port 5432)
2. Starts Redis cache (port 6379)
3. Builds & starts backend-api (port 5000)
4. Builds & starts customer website (port 3000)
5. Builds & starts admin dashboard (port 3001)
6. Connects them all together
7. Shares the `.env` file with all apps

**One command does everything!**

---

### 8. **Communication Between Apps**

```
Customer Website (React)
  └─ Calls backend API: fetch('http://localhost:5000/api/products')
  └─ Gets response and displays products
  └─ User clicks "Add to cart"
  └─ Calls: POST http://localhost:5000/api/cart

Admin Dashboard (React)
  └─ Calls backend API: fetch('http://localhost:5000/api/admin/products')
  └─ Gets products list
  └─ Admin creates offer
  └─ Calls: POST http://localhost:5000/api/admin/offers

Backend API (Node.js)
  ├─ Receives requests from both frontends
  ├─ Queries PostgreSQL database
  ├─ Uses Redis cache for speed
  ├─ Calls Razorpay for payments
  ├─ Uploads files to Azure Storage
  └─ Sends response back to frontend
```

---

## NEXT STEPS

1. **Read LOCAL_TESTING.md** → How to test on Windows PC
2. **Read DEVELOPMENT.md** → How to modify code
3. **Read PRODUCTION_DEPLOYMENT.md** → How to deploy to production

All files are self-contained and independent. Start with local testing!
