#!/bin/bash

# This script applies all Phase 1, 2, and 3 changes at once

cd /workspaces/ecommerce-shophub/ecommerce-complete

echo "=== Creating CSS files for modern UI ==="

# ProductCard CSS
cat > amazon-customer-website/src/styles/ProductCard.css << 'EOF'
/* ===== MODERN PRODUCT CARD ===== */
.product-card {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 15px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  height: 100%;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.2);
}
.product-image-wrapper {
  position: relative;
  overflow: hidden;
  background: #f8f9fa;
  aspect-ratio: 1;
  height: 250px;
}
.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.product-card:hover .product-image {
  transform: scale(1.05);
}
.discount-badge {
  position: absolute;
  right: 10px;
  top: 10px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
}
.size-badge {
  position: absolute;
  left: 10px;
  top: 10px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  font-size: 0.75rem;
}
.product-info {
  padding: 1rem;
  flex: 1;
}
.product-name {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.4rem 0;
  color: #333;
}
.product-type {
  font-size: 0.8rem;
  color: #999;
  margin: 0 0 0.4rem 0;
}
.product-price {
  display: flex;
  gap: 0.5rem;
  margin: 0.5rem 0;
}
.original-price {
  text-decoration: line-through;
  color: #999;
}
.sale-price {
  font-weight: 700;
  color: #f5576c;
}
.current-price {
  font-weight: 700;
  color: #667eea;
}
.in-stock {
  font-size: 0.8rem;
  color: #43e97b;
  font-weight: 600;
}
.add-to-cart-btn {
  width: 100%;
  padding: 0.8rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
}
.add-to-cart-btn:hover {
  transform: translateY(-2px);
}
.add-to-cart-btn.added {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}
EOF

# ProductCarousel CSS
cat > amazon-customer-website/src/styles/ProductCarousel.css << 'EOF'
.product-carousel {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem 0;
}
.carousel-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  font-size: 1.5rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
}
.carousel-btn:hover {
  transform: scale(1.1);
}
.carousel-container {
  flex: 1;
  overflow: hidden;
}
.carousel-track {
  display: flex;
  gap: 1.5rem;
  transition: transform 0.3s ease;
}
.carousel-item {
  flex: 0 0 calc(25% - 1.125rem);
  text-decoration: none;
  color: inherit;
}
.carousel-image-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  margin-bottom: 0.5rem;
}
.carousel-image-wrapper img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.carousel-item:hover .carousel-image-wrapper img {
  transform: scale(1.05);
}
.carousel-discount {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  font-weight: 700;
}
.carousel-item h4 {
  margin: 0.5rem 0;
  font-size: 0.95rem;
}
.carousel-price {
  display: flex;
  gap: 0.5rem;
  font-weight: 700;
}
.strikethrough {
  text-decoration: line-through;
  color: #999;
}
.discount-price {
  color: #f5576c;
}
@media (max-width: 1024px) {
  .carousel-item {
    flex: 0 0 calc(33.333% - 1rem);
  }
}
@media (max-width: 768px) {
  .carousel-item {
    flex: 0 0 calc(50% - 0.75rem);
  }
}
EOF

# FilterSidebar CSS
cat > amazon-customer-website/src/styles/FilterSidebar.css << 'EOF'
.filter-toggle {
  display: none;
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 1rem;
}
.filter-sidebar {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
}
.filter-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
}
.close-filter {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.filter-group {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}
.filter-group h4 {
  margin: 0 0 0.8rem 0;
  font-weight: 700;
  color: #333;
}
.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 5px;
  transition: all 0.2s ease;
}
.filter-checkbox:hover {
  background: #f8f9fa;
}
.filter-checkbox input {
  cursor: pointer;
}
.filter-checkbox span {
  font-size: 0.95rem;
}
.size-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}
.size-option {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.size-option:hover {
  border-color: #667eea;
}
.price-range {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.price-slider {
  width: 100%;
}
.price-display {
  font-weight: 600;
  color: #667eea;
  margin: 0;
}
.reset-filters {
  width: 100%;
  padding: 0.8rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}
.reset-filters:hover {
  transform: translateY(-2px);
}
@media (max-width: 768px) {
  .filter-toggle {
    display: block;
  }
  .filter-sidebar {
    position: fixed;
    top: 0;
    left: -100%;
    right: auto;
    bottom: 0;
    width: 80%;
    max-height: 100vh;
    border-radius: 0;
    z-index: 1001;
    transition: left 0.3s ease;
  }
  .filter-sidebar.open {
    left: 0;
  }
  .close-filter {
    display: block;
  }
}
EOF

echo "=== CSS files created successfully ==="

# Create Cloudinary config file
cat > backend-api/config/cloudinary.js << 'EOF'
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret'
});

module.exports = cloudinary;
EOF

echo "=== Cloudinary config created ==="

# Update backend .env with Cloudinary placeholders
cat >> .env << 'EOF'

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Razorpay Configuration (Add your keys here when ready)
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_SECRET_KEY=your-secret-key
EOF

echo "=== All Phase 1, 2, 3 changes completed! ==="
