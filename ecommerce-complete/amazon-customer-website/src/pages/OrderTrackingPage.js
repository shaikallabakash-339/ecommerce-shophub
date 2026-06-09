import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/OrderTrackingPage.css';

const OrderTrackingPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [statusTimeline, setStatusTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchOrderTracking();
  }, [id]);

  const fetchOrderTracking = async () => {
    try {
      const response = await axios.get(`${API_BASE}/orders/${id}/track`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(response.data.order);
      setStatusTimeline(response.data.statusTimeline);
    } catch (error) {
      console.error('Error fetching order tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (!order) {
    return <div className="error">Order not found</div>;
  }

  return (
    <div className="tracking-container">
      <h1>Track Order #{order.id}</h1>

      <div className="tracking-content">
        <div className="timeline">
          <h2>Order Status</h2>
          <div className="status-timeline">
            {statusTimeline.map((status, index) => (
              <div key={index} className={`timeline-item ${status.completed ? 'completed' : ''}`}>
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <p className="timeline-status">{status.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-details">
          <h2>Order Details</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Order Date:</span>
              <span className="value">{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <span className="label">Order Total:</span>
              <span className="value">₹{order.total_amount.toFixed(2)}</span>
            </div>
            <div className="detail-item">
              <span className="label">Status:</span>
              <span className={`value status-badge ${order.status}`}>{order.status.toUpperCase()}</span>
            </div>
            <div className="detail-item">
              <span className="label">Payment ID:</span>
              <span className="value">{order.razorpay_payment_id || 'Processing...'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
