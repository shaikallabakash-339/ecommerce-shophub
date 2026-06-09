import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/OrdersPage.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="orders-container">
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven&apos;t placed any orders yet.</p>
          <Link to="/" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order.id}</h3>
                  <p className="order-date">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="order-amount">
                  <p className="price">₹{order.total_amount.toFixed(2)}</p>
                  <span className={`status ${order.status}`}>{order.status.toUpperCase()}</span>
                </div>
              </div>

              <div className="order-footer">
                <Link to={`/order/${order.id}/track`} className="btn btn-secondary">
                  Track Order
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
