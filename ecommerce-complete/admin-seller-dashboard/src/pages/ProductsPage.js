import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: '', stock: '' });
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/admin/products`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({ name: '', description: '', price: '', category: '', stock: '' });
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <div>
      <h1>Products Management</h1>
      <form onSubmit={handleAddProduct} style={{ marginBottom: '24px', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
        <input
          type="text"
          placeholder="Product Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #E5E7EB' }}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #E5E7EB' }}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #E5E7EB' }}
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #E5E7EB' }}
          required
        />
        <input
          type="number"
          placeholder="Stock"
          value={formData.stock}
          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
          style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #E5E7EB' }}
          required
        />
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#FF9900', color: 'white', border: 'none', borderRadius: '4px' }}>
          Add Product
        </button>
      </form>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#F9FAFB' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>Product</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>Category</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>Price</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>{product.name}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>{product.category}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>₹{product.price}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>{product.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsPage;
