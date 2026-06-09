import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_API_URL || '/api';
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="user-info">
          <h1>Welcome back, {user?.firstName}!</h1>
          <p>Email: {user?.email}</p>
        </div>
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <section className="dashboard-section">
          <h2>Recent Orders</h2>
          {loading ? (
            <div className="loading">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="no-data">
              <p>No orders yet. Start shopping!</p>
              <Link to="/" className="btn btn-primary">Shop Now</Link>
            </div>
          ) : (
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>₹{order.total_amount.toFixed(2)}</td>
                      <td><span className={`status ${order.status}`}>{order.status}</span></td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/order/${order.id}/track`} className="link">
                          Track
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="section-footer">
            <Link to="/orders" className="btn btn-secondary">View All Orders</Link>
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Account Settings</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <h3>Profile Information</h3>
              <p>View and edit your profile</p>
              <button className="btn btn-secondary">Edit Profile</button>
            </div>
            <div className="setting-item">
              <h3>Addresses</h3>
              <p>Manage your saved addresses</p>
              <button className="btn btn-secondary">Manage Addresses</button>
            </div>
            <div className="setting-item">
              <h3>Wishlist</h3>
              <p>View your saved items</p>
              <button className="btn btn-secondary">View Wishlist</button>
            </div>
            <div className="setting-item">
              <h3>Returns</h3>
              <p>Manage your returns</p>
              <button className="btn btn-secondary">View Returns</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
