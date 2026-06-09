import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ProductCarousel.css';

const ProductCarousel = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 4;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.max(1, products.length - itemsPerView + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [products.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, products.length - itemsPerView + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(0, products.length - itemsPerView) : prev - 1
    );
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="product-carousel">
      <button className="carousel-btn prev" onClick={handlePrev}>❮</button>

      <div className="carousel-container">
        <div
          className="carousel-track"
          style={{
            transform: `translateX(-${currentIndex * (100 / Math.min(itemsPerView, products.length))}%)`,
          }}
        >
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="carousel-item"
            >
              <div className="carousel-image-wrapper">
                <img
                  src={product.image_url || 'https://via.placeholder.com/250x250?text=Fashion'}
                  alt={product.name}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/250x250?text=Fashion'}
                />
                {product.is_on_sale && (
                  <div className="carousel-discount">-{product.discount_percent}%</div>
                )}
              </div>
              <h4>{product.name}</h4>
              <p className="carousel-price">
                {product.is_on_sale ? (
                  <>
                    <span className="strikethrough">₹{product.price}</span>
                    <span className="discount-price">
                      ₹{(product.price * (1 - product.discount_percent / 100)).toFixed(0)}
                    </span>
                  </>
                ) : (
                  <span>₹{product.price}</span>
                )}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <button className="carousel-btn next" onClick={handleNext}>❯</button>
    </div>
  );
};

export default ProductCarousel;
