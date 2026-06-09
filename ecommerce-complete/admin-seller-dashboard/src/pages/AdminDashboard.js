import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const API_BASE = process.env.REACT_APP_API_URL || '/api';
  const { user, logout } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    discountPercent: '0',
    gender: 'Men',
    productType: 'Shirt',
    sizes: [],
    ageGroup: '18-40',
    stock: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE}/products?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSizeToggle = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const productData = { ...formData };

      // If image is selected, upload to Cloudinary
      if (imageFile) {
        const formDataImage = new FormData();
        formDataImage.append('file', imageFile);

        // In real implementation, this would upload to Cloudinary
        // For now, we'll use a data URL
        productData.image_url = imagePreview;
      }

      const response = await axios.post(
        `${API_BASE}/admin/products`,
        productData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Product added successfully!');
      setFormData({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        discountPercent: '0',
        gender: 'Men',
        productType: 'Shirt',
        sizes: [],
        ageGroup: '18-40',
        stock: ''
      });
      setImagePreview(null);
      setImageFile(null);
      loadProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_BASE}/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Product deleted successfully!');
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const sizes = {
    'Shirt': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'Jeans': ['28', '30', '32', '34', '36', '38'],
    'Saree': ['Free Size'],
    'Top': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'Bra': ['28', '30', '32', '34', '36', '38', '40', '42', '44', '45'],
    'Dress': ['4Y', '6Y', '8Y', '10Y', '12Y', '14Y'],
    'T-Shirt': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'Shorts': ['S', 'M', 'L', 'XL'],
    'Leggings': ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <h1>👔 FashionHub Admin Panel</h1>
        <div className="header-info">
          <span>{user?.email}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Products ({products.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          ➕ Add Product
        </button>
      </div>

      <div className="admin-content">
        {/* Add Product Form */}
        {activeTab === 'add' && (
          <section className="add-product-section">
            <h2>Add New Product</h2>
            <form onSubmit={handleAddProduct} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Premium Cotton Shirt"
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option>Men</option>
                    <option>Women</option>
                    <option>Kids</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Product Type</label>
                  <select
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                  >
                    {Object.keys(sizes).map(type => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Age Group</label>
                  <input
                    type="text"
                    value={formData.ageGroup}
                    onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                    placeholder="e.g., 18-40"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>Original Price (₹)</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>Discount %</label>
                  <input
                    type="number"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label>Available Sizes</label>
                <div className="sizes-grid">
                  {sizes[formData.productType]?.map(size => (
                    <label key={size} className="size-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.sizes.includes(size)}
                        onChange={() => handleSizeToggle(size)}
                      />
                      {size}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Product Image</label>
                <div className="image-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    id="image-input"
                  />
                  <label htmlFor="image-input" className="upload-label">
                    📸 Choose Image
                  </label>
                </div>
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>

              <button type="submit" className="submit-btn">✅ Add Product</button>
            </form>
          </section>
        )}

        {/* Products List */}
        {activeTab === 'products' && (
          <section className="products-list-section">
            <h2>Product Inventory</h2>
            {loading ? (
              <p>Loading...</p>
            ) : products.length > 0 ? (
              <div className="products-table">
                <div className="table-header">
                  <div className="col-image">Image</div>
                  <div className="col-name">Name</div>
                  <div className="col-category">Category</div>
                  <div className="col-price">Price</div>
                  <div className="col-stock">Stock</div>
                  <div className="col-actions">Actions</div>
                </div>
                {products.map(product => (
                  <div key={product.id} className="table-row">
                    <div className="col-image">
                      <img src={product.image_url || 'https://via.placeholder.com/50'} alt={product.name} />
                    </div>
                    <div className="col-name">{product.name}</div>
                    <div className="col-category">{product.gender}</div>
                    <div className="col-price">₹{product.price}</div>
                    <div className="col-stock">
                      <span className={product.stock > 0 ? 'in-stock' : 'out-stock'}>
                        {product.stock}
                      </span>
                    </div>
                    <div className="col-actions">
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No products found. Add one now!</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
