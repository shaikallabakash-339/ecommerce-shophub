import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const API_BASE = process.env.REACT_APP_API_URL || '/api';
  const [isAdded, setIsAdded] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${API_BASE}/cart`,
        { product_id: product.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const discountedPrice = product.is_on_sale
    ? (product.price * (1 - product.discount_percent / 100)).toFixed(0)
    : product.price;

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-image-wrapper">
        <img
          src={product.image_url || 'https://via.placeholder.com/300x300?text=Fashion'}
          alt={product.name}
          className="product-image"
          onError={(e) => e.target.src = 'https://via.placeholder.com/300x300?text=Fashion'}
        />

        {/* Discount Badge */}
        {product.is_on_sale && (
          <div className="discount-badge">
            <span className="discount-percent">-{product.discount_percent}%</span>
            <span className="sale-label">SALE</span>
          </div>
        )}

        {/* Size Label */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="size-badge">{product.sizes.length} Sizes</div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>

        <p className="product-type">
          {product.gender} • {product.product_type}
        </p>

        <p className="product-desc">{product.description?.substring(0, 50)}...</p>

        {/* Age Group */}
        {product.age_group && (
          <p className="age-group">👥 Age: {product.age_group}</p>
        )}

        <div className="product-price">
          {product.is_on_sale ? (
            <>
              <span className="original-price">₹{product.price}</span>
              <span className="sale-price">₹{discountedPrice}</span>
            </>
          ) : (
            <span className="current-price">₹{product.price}</span>
          )}
        </div>

        <div className="product-stock">
          {product.stock > 0 ? (
            <span className="in-stock">✓ In Stock</span>
          ) : (
            <span className="out-stock">Out of Stock</span>
          )}
        </div>
      </div>

      <button
        className={`add-to-cart-btn ${isAdded ? 'added' : ''}`}
        onClick={handleAddToCart}
      >
        {isAdded ? '✓ Added to Cart' : '🛒 Add to Cart'}
      </button>
    </Link>
  );
};

export default ProductCard;
