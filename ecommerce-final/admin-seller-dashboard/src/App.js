import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Dashboard Page
const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/admin/dashboard/stats`)
      .then(res => setStats(res.data))
      .catch(err => console.error('Error fetching stats:', err));
  }, []);

  return (
    <div className="page">
      <h1>Dashboard</h1>
      {stats ? (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-value">₹{stats.totalRevenue?.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Total Products</h3>
            <p className="stat-value">{stats.totalProducts}</p>
          </div>
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
          </div>
        </div>
      ) : (
        <p>Loading statistics...</p>
      )}
    </div>
  );
};

// Products Page
const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: ''
  });

  useEffect(() => {
    axios.get(`${API_URL}/products`)
      .then(res => setProducts(res.data.products || []))
      .catch(err => console.error('Error fetching products:', err));
  }, []);

  const handleAddProduct = (e) => {
    e.preventDefault();
    axios.post(`${API_URL}/admin/products`, formData)
      .then(res => {
        setProducts([...products, res.data]);
        setFormData({ name: '', description: '', price: '', category: '', stock: '' });
        alert('Product added successfully');
      })
      .catch(err => alert('Error adding product: ' + err.message));
  };

  return (
    <div className="page">
      <h1>Manage Products</h1>
      
      <form onSubmit={handleAddProduct} className="form">
        <input
          type="text"
          placeholder="Product Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={(e) => setFormData({...formData, price: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          required
        />
        <input
          type="number"
          placeholder="Stock"
          value={formData.stock}
          onChange={(e) => setFormData({...formData, stock: e.target.value})}
          required
        />
        <button type="submit">Add Product</button>
      </form>

      <h2>Existing Products</h2>
      {products.length === 0 ? (
        <p>No products yet</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>₹{product.price}</td>
                <td>{product.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Offers Page
const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [formData, setFormData] = useState({
    product_id: '',
    discount_percent: '',
    title: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    axios.get(`${API_URL}/admin/offers`)
      .then(res => setOffers(res.data))
      .catch(err => console.error('Error fetching offers:', err));
  }, []);

  const handleAddOffer = (e) => {
    e.preventDefault();
    axios.post(`${API_URL}/admin/offers`, formData)
      .then(res => {
        setOffers([...offers, res.data]);
        setFormData({ product_id: '', discount_percent: '', title: '', start_date: '', end_date: '' });
        alert('Offer created successfully');
      })
      .catch(err => alert('Error creating offer: ' + err.message));
  };

  return (
    <div className="page">
      <h1>Create Sales Offers</h1>
      
      <form onSubmit={handleAddOffer} className="form">
        <input
          type="text"
          placeholder="Offer Title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
        <input
          type="number"
          placeholder="Product ID"
          value={formData.product_id}
          onChange={(e) => setFormData({...formData, product_id: e.target.value})}
          required
        />
        <input
          type="number"
          placeholder="Discount %"
          value={formData.discount_percent}
          onChange={(e) => setFormData({...formData, discount_percent: e.target.value})}
          required
        />
        <input
          type="date"
          value={formData.start_date}
          onChange={(e) => setFormData({...formData, start_date: e.target.value})}
          required
        />
        <input
          type="date"
          value={formData.end_date}
          onChange={(e) => setFormData({...formData, end_date: e.target.value})}
          required
        />
        <button type="submit">Create Offer</button>
      </form>

      <h2>Active Offers</h2>
      {offers.length === 0 ? (
        <p>No active offers</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Product</th>
              <th>Discount</th>
              <th>Start Date</th>
              <th>End Date</th>
            </tr>
          </thead>
          <tbody>
            {offers.map(offer => (
              <tr key={offer.id}>
                <td>{offer.title}</td>
                <td>{offer.product_name}</td>
                <td>{offer.discount_percent}%</td>
                <td>{offer.start_date}</td>
                <td>{offer.end_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Main App
function App() {
  return (
    <Router>
      <header className="admin-header">
        <h1>ShopHub Admin</h1>
        <nav className="admin-nav">
          <Link to="/">Dashboard</Link>
          <Link to="/products">Products</Link>
          <Link to="/offers">Offers</Link>
        </nav>
      </header>

      <main className="admin-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/offers" element={<OffersPage />} />
        </Routes>
      </main>

      <footer className="admin-footer">
        <p>&copy; 2024 ShopHub Admin. All rights reserved.</p>
      </footer>
    </Router>
  );
}

export default App;
