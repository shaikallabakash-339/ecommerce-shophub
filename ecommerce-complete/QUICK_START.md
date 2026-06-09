# 🚀 FashionHub Quick Start Guide

## ⚡ Get Started in 2 Minutes

### 1. Start All Services
```bash
cd /workspaces/ecommerce-shophub/ecommerce-complete
docker compose up -d
```

Wait for containers to be healthy (usually 30-60 seconds).

### 2. Verify Services are Running
```bash
docker compose ps
```

You should see:
- ✅ ecommerce-postgres (Healthy)
- ✅ ecommerce-redis (Healthy)
- ✅ ecommerce-backend (Running)
- ✅ ecommerce-customer (Running)
- ✅ ecommerce-admin (Running)

### 3. Access the Platforms

#### Customer Website
- **URL**: http://localhost:3000
- **Features**: 
  - Browse products with filters (gender, size, price, sale)
  - Search with history tracking
  - Add to cart
  - View orders
  - User dashboard

#### Admin Dashboard
- **URL**: http://localhost:3001
- **Features**:
  - View product inventory
  - Add new products
  - Upload product images
  - Delete products
  - Manage inventory

#### API Documentation
- **URL**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

---

## 👤 Test Account

Use any of these accounts (or register new ones):

```
Email: test2@example.com
Password: pass1234
```

Or register a new account on the customer website.

---

## 📝 API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
```

### Products
```
GET    /api/products                    (with filters)
GET    /api/products/:id
GET    /api/products/filters/options
```

### Search History
```
POST   /api/search-history/add
GET    /api/search-history
DELETE /api/search-history/clear
```

### Cart
```
POST   /api/cart
GET    /api/cart
DELETE /api/cart/:itemId
```

### Orders
```
POST   /api/orders
GET    /api/orders
GET    /api/orders/:id
```

### Razorpay (Payment)
```
POST   /api/razorpay/create
POST   /api/razorpay/verify
GET    /api/razorpay/:orderId/status
```

### Cloudinary (Image Upload)
```
POST   /api/upload/cloudinary/upload
DELETE /api/upload/cloudinary/:publicId
```

---

## 🔧 Add Live Credentials

### Cloudinary Setup

1. Sign up at https://cloudinary.com
2. Get your credentials from Dashboard
3. Update `.env` in `backend-api/`:

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

4. Rebuild backend:
```bash
docker compose build backend
docker compose up -d backend
```

### Razorpay Setup

1. Sign up at https://razorpay.com
2. Get your API keys from Settings
3. Update `.env` in `backend-api/`:

```bash
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_SECRET_KEY=your-secret-key
```

4. Rebuild backend:
```bash
docker compose build backend
docker compose up -d backend
```

---

## 🐛 Troubleshooting

### Containers Won't Start
```bash
# Check logs
docker compose logs backend
docker compose logs customer
docker compose logs admin

# Restart all services
docker compose down
docker compose up -d
```

### API Not Responding
```bash
# Check backend health
curl http://localhost:5000/api/health

# Check database connection
docker compose exec backend npm run migrate
```

### Frontend Shows API Errors
```bash
# Rebuild frontend with correct API URL
docker compose build customer admin
docker compose up -d customer admin
```

### Database Issues
```bash
# Reset database
docker compose down -v
docker compose up -d
```

---

## 📱 Features Overview

### 👗 Customer Platform

**Hero Section**
- Animated gradient background
- Call-to-action button
- Responsive design

**Product Carousel**
- Auto-rotating showcase
- Shows sale items prominently
- Manual navigation controls

**Advanced Filtering**
- Filter by gender (Men/Women/Kids)
- Filter by product type
- Filter by size with grid layout
- Filter by age group
- Price range slider
- Sale items only toggle

**Product Cards**
- Discount badges
- Size information
- Gender and type labels
- Original vs sale price
- Stock status
- Add to cart button with feedback

**Search History**
- Automatically saves searches (when logged in)
- Quick access to recent searches
- Personalized experience

**User Account**
- Login/Register
- View orders
- Order tracking
- User profile

### 👔 Admin Platform

**Product Management**
- View all products in inventory table
- Add new products with complete details
- Edit product information
- Delete products
- Image upload with preview
- Multiple size selection

**Product Form Fields**
- Name, description, price
- Original price and discount percentage
- Category (Men/Women/Kids)
- Product type (Shirt, Jeans, Saree, etc.)
- Age group
- Stock quantity
- Size selection (dynamic based on type)
- Image upload

---

## 🎨 Customization

### Change Colors
Edit the color gradients in CSS files:

```css
/* Purple gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Pink gradient */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

/* Cyan gradient */
background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

/* Green gradient */
background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
```

### Add New Product Types
Edit `ecommerce-complete/admin-seller-dashboard/src/pages/AdminDashboard.js`:

```javascript
const sizes = {
  'Shirt': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'Jeans': ['28', '30', '32', '34', '36', '38'],
  // Add more types here
  'YourType': ['SIZE1', 'SIZE2', ...]
};
```

---

## 📊 Database Schema

### Products Table
```
id, name, description, price, original_price, discount_percent,
is_on_sale, gender, product_type, sizes (JSON), age_group,
image_url, stock, created_at, updated_at
```

### Users Table
```
id, email, password (hashed), firstName, lastName,
is_admin, created_at, updated_at
```

### Orders Table
```
id, user_id, total_amount, payment_method, status,
created_at, updated_at
```

### Search History Table
```
id, user_id, search_query, created_at
```

---

## 🚀 Production Deployment

### Using Docker Swarm
```bash
docker swarm init
docker stack deploy -c docker-compose.yml fashionhub
```

### Using Kubernetes
```bash
kubectl apply -f k8s/
```

### Environment Variables for Production
```
NODE_ENV=production
DB_HOST=prod-db-host
CLOUDINARY_CLOUD_NAME=your-production-account
RAZORPAY_KEY_ID=your-production-key
JWT_SECRET=long-random-secret-key-change-me
```

---

## 📞 Support

For issues or questions:
1. Check the logs: `docker compose logs -f`
2. Review PHASE_COMPLETION_SUMMARY.md
3. Verify all environment variables are set
4. Ensure all containers are healthy

---

**Happy Building! 🎉**

Your FashionHub platform is ready to use. Customize it, add your credentials, and deploy to production!
