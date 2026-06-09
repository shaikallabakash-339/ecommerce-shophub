import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [formData, setFormData] = useState({ productId: '', discountPercent: '', title: '', startDate: '', endDate: '' });
  const API_BASE = process.env.REACT_APP_API_URL || '/api';
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/offers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOffers(response.data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const handleAddOffer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/admin/offers`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({ productId: '', discountPercent: '', title: '', startDate: '', endDate: '' });
      fetchOffers();
    } catch (error) {
      console.error('Error adding offer:', error);
    }
  };

  return (
    <div>
      <h1>Sales Offers Management</h1>
      <form onSubmit={handleAddOffer} style={{ marginBottom: '24px', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
        <input
          type="text"
          placeholder="Offer Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #E5E7EB' }}
          required
        />
        <input
          type="number"
          placeholder="Product ID"
          value={formData.productId}
          onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
          style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #E5E7EB' }}
          required
        />
        <input
          type="number"
          placeholder="Discount %"
          value={formData.discountPercent}
          onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
          style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #E5E7EB' }}
          required
        />
        <input
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #E5E7EB' }}
          required
        />
        <input
          type="date"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #E5E7EB' }}
          required
        />
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#FF9900', color: 'white', border: 'none', borderRadius: '4px' }}>
          Add Offer
        </button>
      </form>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#F9FAFB' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>Title</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>Discount</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>Product</th>
            </tr>
          </thead>
          <tbody>
            {offers.map(offer => (
              <tr key={offer.id}>
                <td style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>{offer.title}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>{offer.discount_percent}%</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>{offer.product_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OffersPage;
