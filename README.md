# Enterprise E-Commerce Platform

A production-ready, scalable e-commerce solution with modern minimalist UI, Razorpay payment integration, Azure storage, Redis caching, and full order tracking system.

## Features

### Customer Features
- **Modern Minimalist UI** - Clean, spacious product display with optimal typography and spacing
- **Product Browsing** - Advanced filtering, search, categorization, and sorting
- **Shopping Cart** - Real-time cart management with quantity updates
- **Secure Checkout** - Razorpay payment integration with encrypted transactions
- **Order Management** - Complete order history with real-time tracking
- **Return & Refund** - Easy return process with refund tracking
- **Invoice Generation** - Automated PDF invoices for all purchases
- **Wishlist** - Save favorite products for later
- **User Dashboard** - Profile management, address book, order history
- **Real-time Notifications** - Socket.io integration for live order updates

### Admin Features
- **Product Management** - Add, edit, delete products with bulk operations
- **Sales Offers** - Create time-limited promotional offers
- **Order Management** - Track and update order statuses
- **Return Management** - Approve or reject return requests
- **Admin Dashboard** - Real-time statistics and metrics
- **User Analytics** - Track user behavior and purchases
- **Inventory Management** - Stock tracking and alerts

### Technical Features
- **Scalability** - Handles 1M+ concurrent users
- **Redis Caching** - Fast product/category caching
- **Connection Pooling** - pgBouncer for DB optimization
- **Docker & Kubernetes** - Complete containerization
- **Azure Integration** - Blob storage for images/videos
- **CI/CD Pipeline** - Automated testing and deployment
- **Security** - JWT auth, HTTPS, rate limiting, input validation

## Tech Stack

### Backend
- Node.js + Express.js
- PostgreSQL 15
- Redis 7
- Razorpay Payment Gateway
- Azure Blob Storage
- Socket.io for real-time updates

### Frontend
- React 18
- Tailwind CSS
- Zustand (state management)
- Axios (HTTP client)
- Socket.io Client

### DevOps
- Docker & Docker Compose
- Kubernetes (K8s)
- GitHub Actions (CI/CD)
- Nginx (reverse proxy)

## Project Structure

```
.
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── migrations/     # Database schema
│   │   └── server.js       # Main entry point
│   ├── Dockerfile          # Backend container
│   └── package.json
├── frontend/               # React SPA
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   ├── store/          # Zustand stores
│   │   └── App.js
│   ├── Dockerfile          # Frontend container
│   └── package.json
├── k8s/                    # Kubernetes manifests
│   └── deployment.yaml     # K8s resources
├── docker-compose.yml      # Local development setup
├── .github/workflows/      # CI/CD pipelines
└── README.md              # This file
```

## Quick Start

### Prerequisites
- Docker & Docker Compose (for containerized setup)
- Node.js 18+ & npm (for local development)
- PostgreSQL 15 (for local development)
- Redis 7 (for local development)

### Local Development with Docker Compose

1. **Clone and setup environment:**
   ```bash
   git clone <repository-url>
   cd ecommerce-platform
   cp .env.example .env
   ```

2. **Configure environment variables:**
   ```bash
   # .env
   DB_PASSWORD=your-secure-password
   JWT_SECRET=your-jwt-secret-key
   RAZORPAY_KEY_ID=your-razorpay-key
   RAZORPAY_KEY_SECRET=your-razorpay-secret
   AZURE_STORAGE_CONNECTION_STRING=your-azure-connection
   ```

3. **Start with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

### Local Development (Manual Setup)

1. **Install dependencies:**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

2. **Setup database:**
   ```bash
   # Create database and run migrations
   psql -U postgres -f backend/src/migrations/001-initial-schema.sql
   ```

3. **Start services:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   
   # Terminal 3 - Redis (or use docker)
   redis-server
   ```

## Database Schema

### Core Tables
- **users** - User accounts and profiles
- **products** - Product catalog
- **product_reviews** - Customer reviews
- **cart_items** - Shopping cart
- **orders** - Order records
- **order_items** - Items in each order
- **returns** - Return requests
- **invoices** - Invoice documents
- **addresses** - Shipping/billing addresses
- **sales_offers** - Promotional offers
- **activity_logs** - Audit trail

### Indexes & Optimization
- Hash indexes on frequently accessed columns
- Composite indexes for filtered queries
- Partitioning support for large tables

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification

### Products
- `GET /api/products` - List products (paginated, cached)
- `GET /api/products/:id` - Get product details
- `GET /api/products/categories/list` - Get all categories

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/:id` - Update quantity
- `DELETE /api/cart/:id` - Remove item

### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/:id/track` - Track order
- `POST /api/orders/:id/return` - Create return request

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify-payment` - Verify payment
- `GET /api/payments/status/:razorpayOrderId` - Get payment status

### Admin
- `POST /admin/products` - Create product
- `PUT /admin/products/:id` - Update product
- `POST /admin/sales-offers` - Create offer
- `GET /admin/stats` - Get dashboard stats
- `GET /admin/orders` - List all orders

## Deployment

### Docker Compose (Staging/Testing)
```bash
docker-compose -f docker-compose.yml up -d
```

### Kubernetes (Production)

1. **Setup cluster:**
   ```bash
   kubectl create namespace ecommerce
   kubectl apply -f k8s/deployment.yaml
   ```

2. **Configure secrets:**
   ```bash
   kubectl create secret generic app-secrets \
     --from-literal=DB_PASSWORD=secure-password \
     --from-literal=JWT_SECRET=your-secret \
     -n ecommerce
   ```

3. **Scale deployments:**
   ```bash
   kubectl scale deployment backend --replicas=5 -n ecommerce
   kubectl scale deployment frontend --replicas=3 -n ecommerce
   ```

4. **Monitor pods:**
   ```bash
   kubectl get pods -n ecommerce -w
   kubectl logs -f deployment/backend -n ecommerce
   ```

### Azure App Service

1. **Build images:**
   ```bash
   docker build -t myregistry.azurecr.io/ecommerce-api:latest ./backend
   docker build -t myregistry.azurecr.io/ecommerce-web:latest ./frontend
   ```

2. **Push to Azure:**
   ```bash
   docker push myregistry.azurecr.io/ecommerce-api:latest
   docker push myregistry.azurecr.io/ecommerce-web:latest
   ```

3. **Deploy with Azure CLI:**
   ```bash
   az container create --resource-group mygroup \
     --name ecommerce-api \
     --image myregistry.azurecr.io/ecommerce-api:latest \
     --ports 5000 --environment-variables DB_HOST=myhost ...
   ```

## Performance Optimization

### Caching Strategy
- **Redis**: Product lists, categories, user sessions (1hr TTL)
- **Browser Cache**: Static assets (1 year), API responses (5 min)
- **Database**: Query result caching, connection pooling

### Database Optimization
- Composite indexes on frequently filtered columns
- EXPLAIN ANALYZE for query optimization
- Read replicas for analytics queries
- Partitioning for large tables (orders by date)

### Frontend Optimization
- Code splitting by route
- Image lazy loading
- Gzip compression
- Minification of JS/CSS

### Backend Optimization
- Connection pooling (pgBouncer)
- Query pagination
- Rate limiting
- Request compression

## Scaling to 1M Users

### Architecture
```
Load Balancer (Azure LB / AWS ALB)
    ↓
Kubernetes Cluster (3+ nodes)
    ├── Backend Pods (10+) - Auto-scaled
    ├── Frontend Pods (5+) - Auto-scaled
    ├── PostgreSQL (Read replicas)
    ├── Redis (Cluster)
    └── Azure Storage (CDN)
```

### Key Components
1. **Load Balancer** - Distributes traffic across zones
2. **Kubernetes HPA** - Auto-scales based on CPU/memory
3. **PostgreSQL Replicas** - Read-heavy queries on replicas
4. **Redis Cluster** - Distributed caching
5. **CDN** - Edge caching for static assets
6. **Monitoring** - Prometheus, Grafana, ELK

## Security

### Authentication & Authorization
- JWT tokens with 7-day expiry
- Bcrypt password hashing (10 rounds)
- Role-based access control (RBAC)

### Data Protection
- HTTPS/TLS encryption
- Input validation & sanitization
- SQL parameterization to prevent injection
- CORS headers configured
- Helmet.js security headers

### API Security
- Rate limiting (100 req/15min per IP)
- Request size limits
- CSRF protection
- API key rotation

## Monitoring & Logging

### Application Metrics
- Request latency
- Error rates
- Cache hit ratio
- Database query performance

### Infrastructure Metrics
- CPU/Memory usage
- Disk I/O
- Network bandwidth
- Pod restarts

### Logging
- Structured JSON logging
- Centralized log aggregation
- Error tracking with stack traces
- Audit trail for admin actions

## Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce
DB_USER=postgres
DB_PASSWORD=secure

# Cache
REDIS_HOST=localhost
REDIS_PORT=6379

# Auth
JWT_SECRET=your-secret-key

# Payments
RAZORPAY_KEY_ID=key_***
RAZORPAY_KEY_SECRET=secret_***

# Storage
AZURE_STORAGE_CONNECTION_STRING=***
AZURE_CONTAINER_NAME=products
AZURE_STORAGE_URL=https://***

# Server
NODE_ENV=production
PORT=5000
FRONTEND_URL=http://localhost:3000
```

## Testing

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test

# Integration
npm run test:integration
```

## Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Commit changes: `git commit -m "Add feature"`
3. Push to branch: `git push origin feature/name`
4. Create Pull Request

## License

MIT License - see LICENSE file

## Support

For issues or questions:
- Create an issue on GitHub
- Contact: support@ecommerce.com
- Documentation: https://docs.ecommerce.com

---

**Built with ❤️ for modern e-commerce**
