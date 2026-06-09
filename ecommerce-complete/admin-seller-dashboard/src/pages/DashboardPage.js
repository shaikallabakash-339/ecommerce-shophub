import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const API_BASE = process.env.REACT_APP_API_URL || '/api';
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            <h3>Total Orders</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalOrders}</p>
          </div>
          <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            <h3>Total Revenue</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{stats.totalRevenue?.toFixed(2)}</p>
          </div>
          <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            <h3>Total Products</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalProducts}</p>
          </div>
          <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            <h3>Total Users</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalUsers}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
