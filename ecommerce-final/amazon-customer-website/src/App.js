import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Pages
const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/products`)
      .then(res => {
        setProducts(res.data.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page">
      <h1>Products</h1>
      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products available</p>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p className="price">₹{product.price}</p>
              <p>Stock: {product.stock}</p>
              <button>Add to Cart</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CartPage = () => (
  <div className="page">
    <h1>Shopping Cart</h1>
    <p>Your cart is empty</p>
  </div>
);

const CheckoutPage = () => (
  <div className="page">
    <h1>Checkout</h1>
    <p>Proceed with payment</p>
  </div>
);

const DashboardPage = () => (
  <div className="page">
    <h1>My Orders</h1>
    <p>You haven't placed any orders yet</p>
  </div>
);

const LoginPage = () => (
  <div className="page">
    <h1>Login</h1>
    <form>
      <input type="email" placeholder="Email" required />
      <input type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  </div>
);

// Main App
function App() {
  return (
    <Router>
      <header className="header">
        <h1>ShopHub</h1>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/dashboard">My Orders</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>&copy; 2024 ShopHub. All rights reserved.</p>
      </footer>
    </Router>
  );
}

export default App;
