import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card-link">
      <div className="product-card">
        <div className="product-image">
          <img src={product.image_url || 'https://via.placeholder.com/200'} alt={product.name} />
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          
          <p className="product-description">
            {product.description?.substring(0, 60)}...
          </p>

          <div className="product-footer">
            <div className="price-section">
              <p className="price">₹{product.price}</p>
              <p className="category">{product.category}</p>
            </div>

            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
