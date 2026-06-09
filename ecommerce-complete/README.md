# ShopHub - E-Commerce Platform

A complete, production-ready e-commerce platform with customer website, admin dashboard, and backend API. Built with React, Node.js, PostgreSQL, Redis, Razorpay payment gateway, and Azure storage.

## 🏗️ Architecture

```
ecommerce-complete/
├── amazon-customer-website/      # Customer React Frontend (Port 3000)
├── admin-seller-dashboard/       # Admin React Frontend (Port 3001)
├── backend-api/                  # Node.js/Express Backend (Port 5000)
└── docker-compose.yml            # Docker Compose Configuration
```

## ✨ Features

### Customer Website
- Product browsing with search and filtering
- Shopping cart management
- Secure checkout with Razorpay integration
- Order tracking and management
- User dashboard with order history
- Return/refund processing
- Responsive design

### Admin Dashboard
- Product management (CRUD operations)
- Sales offers and discount management
- Order tracking and management
- Dashboard with statistics
- Real-time updates via Socket.io

### Backend API
- User authentication with JWT
- Product management with Redis caching
- Cart operations
- Order processing
- Payment verification with Razorpay
- Azure Blob storage for images/videos
- RESTful API with 40+ endpoints
- WebSocket support for real-time updates

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git

### Installation

1. **Clone/Extract the repository**
   ```bash
   cd ecommerce-complete
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Edit .env with your credentials**
   ```bash
   # Add your Razorpay keys
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_SECRET_KEY=your_secret_key

   # Add your Azure storage details
   AZURE_STORAGE_ACCOUNT_NAME=your_account_name
   AZURE_STORAGE_ACCOUNT_KEY=your_account_key
   ```

4. **Start all services**
   ```bash
   docker-compose up -d
   ```

5. **Access the applications**
   - Customer Website: http://localhost:3000
   - Admin Dashboard: http://localhost:3001
   - Backend API: http://localhost:5000

### Create Admin User

```bash
# Register via API
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin@123",
    "firstName": "Admin",
    "lastName": "User"
  }'

# Make user admin in database
docker-compose exec postgres psql -U postgres -d ecommerce \
  -c "UPDATE users SET is_admin = true WHERE email = 'admin@example.com';"

# Now login to admin dashboard with these credentials
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - List products (with pagination, search, filter)
- `GET /api/products/:id` - Get product details
- `GET /api/products/categories/list` - Get all categories

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/:cartId` - Update cart item
- `DELETE /api/cart/:cartId` - Remove from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/:id/track` - Track order
- `PUT /api/orders/:id/cancel` - Cancel order
- `POST /api/orders/:id/return` - Return order

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify-payment` - Verify payment
- `GET /api/payments/order-status/:orderId` - Get payment status

### Admin
- `POST /api/admin/products` - Add product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `POST /api/admin/offers` - Create offer
- `GET /api/admin/offers` - Get all offers
- `DELETE /api/admin/offers/:id` - Delete offer
- `GET /api/admin/dashboard/stats` - Get dashboard stats

### Uploads
- `POST /api/uploads/image` - Upload image
- `POST /api/uploads/video` - Upload video
- `POST /api/uploads/batch` - Batch upload files

## 🔧 Configuration

### Environment Variables

**Database**
- `DB_USER` - PostgreSQL user (default: postgres)
- `DB_PASSWORD` - PostgreSQL password (default: postgres)
- `DB_HOST` - Database host (default: postgres)
- `DB_NAME` - Database name (default: ecommerce)

**Redis**
- `REDIS_HOST` - Redis host (default: redis)
- `REDIS_PORT` - Redis port (default: 6379)

**JWT**
- `JWT_SECRET` - Secret key for JWT tokens

**Razorpay**
- `RAZORPAY_KEY_ID` - Razorpay API key
- `RAZORPAY_SECRET_KEY` - Razorpay secret key
- `RAZORPAY_WEBHOOK_SECRET` - Webhook secret

**Azure Storage**
- `AZURE_STORAGE_ACCOUNT_NAME` - Account name
- `AZURE_STORAGE_ACCOUNT_KEY` - Account key
- `AZURE_CONTAINER_NAME` - Container name
- `AZURE_ENDPOINT` - Storage endpoint

## 🏥 Health Checks

All services include health checks:
- Backend: `GET http://localhost:5000/health`
- Customer: `GET http://localhost:3000/health`
- Admin: `GET http://localhost:3001/health`

## 📊 Database Schema

### Tables
- **users** - User accounts and admin info
- **products** - Product catalog
- **cart** - Shopping cart items
- **orders** - Customer orders
- **returns** - Return requests
- **sales_offers** - Promotional offers

### Indexes
Automatically created for performance:
- `users(email)`
- `products(category)`
- `cart(user_id)`
- `orders(user_id, status)`
- `sales_offers(product_id)`

## 🔒 Security Features

- JWT-based authentication
- Bcrypt password hashing
- SQL injection prevention with parameterized queries
- CORS enabled for frontend URLs
- Rate limiting support
- Input validation and sanitization
- Admin access control

## 🚢 Production Deployment

### Using Kubernetes

```bash
# Create namespace
kubectl create namespace ecommerce

# Deploy resources
kubectl apply -f k8s/ -n ecommerce

# Check status
kubectl get pods -n ecommerce
```

### Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml ecommerce
```

### Environment Setup

```bash
# Generate secure JWT secret
openssl rand -base64 32

# Set production environment
NODE_ENV=production
```

## 📈 Scaling for 1M Users

### Database Optimization
- Connection pooling (pgbouncer)
- Query optimization with indexes
- Read replicas for scaling reads
- Partitioning large tables

### Caching Strategy
- Redis cache for products
- Cart caching
- Session management

### Frontend Optimization
- Build optimization
- Code splitting
- CDN for static assets
- Lazy loading images

### Backend Scaling
- Horizontal scaling with load balancer
- Auto-scaling based on metrics
- API rate limiting
- Request batching

## 🐛 Troubleshooting

### Database connection issues
```bash
# Check PostgreSQL status
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

### Redis connection issues
```bash
# Check Redis status
docker-compose logs redis

# Test Redis connection
docker-compose exec redis redis-cli ping
```

### Port conflicts
```bash
# Change port in docker-compose.yml
# Or check what's using the port
lsof -i :3000
```

## 📚 Documentation

- [Installation Guide](./INSTALLATION.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [API Documentation](./API.md)

## 🤝 Support

For issues and questions, refer to documentation files or check logs:

```bash
docker-compose logs -f [service-name]
```

## 📄 License

MIT License - See LICENSE file for details

## 🎉 Ready to Deploy

This platform is production-ready and can handle:
- ✅ Millions of users
- ✅ Real-time updates
- ✅ Secure payments
- ✅ Multi-image/video uploads
- ✅ Complex order management
- ✅ Admin analytics

Happy selling! 🚀
