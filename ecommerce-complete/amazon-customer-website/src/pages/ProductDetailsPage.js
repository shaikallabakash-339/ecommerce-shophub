import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_BASE}/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      alert('Product added to cart!');
      navigate('/cart');
    }
  };

  if (loading) {
    return <div>Loading product...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div>
          <img
            src={product.image_url || 'https://via.placeholder.com/500'}
            alt={product.name}
            style={{ width: '100%', borderRadius: '8px' }}
          />
        </div>
        <div>
          <h1>{product.name}</h1>
          <p style={{ fontSize: '24px', color: '#FF9900', fontWeight: 'bold' }}>
            ₹{product.price}
          </p>
          <p style={{ color: '#666', lineHeight: '1.6', marginTop: '16px' }}>
            {product.description}
          </p>
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button
              onClick={handleAddToCart}
              style={{
                padding: '12px 24px',
                backgroundColor: '#FF9900',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Add to Cart
            </button>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#E5E7EB',
                color: '#111827',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Go Back
            </button>
          </div>
          <div style={{ marginTop: '32px', borderTop: '1px solid #E5E7EB', paddingTop: '24px' }}>
            <h3>Product Details</h3>
            <dl>
              <dt style={{ fontWeight: '600', marginTop: '12px' }}>Category</dt>
              <dd style={{ margin: '4px 0 0 0', color: '#666' }}>{product.category}</dd>
              <dt style={{ fontWeight: '600', marginTop: '12px' }}>Stock</dt>
              <dd style={{ margin: '4px 0 0 0', color: '#666' }}>{product.stock} available</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
