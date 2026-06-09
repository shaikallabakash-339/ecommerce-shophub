import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/CheckoutPage.css';

const CheckoutPage = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_API_URL || '/api';
  const token = localStorage.getItem('authToken');

  const totalAmount = getTotalPrice() + 50 + (getTotalPrice() * 0.18);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');

      // Create order
      const orderResponse = await axios.post(
        `${API_BASE}/payments/create-order`,
        {
          amount: totalAmount,
          cartItems: cartItems
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { razorpayOrderId, key } = orderResponse.data;

      // Open Razorpay
      const options = {
        key: key,
        amount: totalAmount * 100,
        currency: 'INR',
        name: 'ShopHub',
        description: 'Order Payment',
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await axios.post(
              `${API_BASE}/payments/verify-payment`,
              {
                razorpayOrderId: razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            clearCart();
            navigate(`/order/${verifyResponse.data.orderId}/track`);
          } catch (err) {
            setError('Payment verification failed');
          }
        },
        prefill: {
          email: user.email,
          contact: '9999999999'
        },
        theme: {
          color: '#3399cc'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.error || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return <div className="checkout-empty">Your cart is empty. Add items to checkout.</div>;
  }

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>

      <div className="checkout-content">
        <div className="checkout-form">
          <h2>Delivery Address</h2>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" defaultValue={user.firstName} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Street Address</label>
              <input type="text" placeholder="Enter address" />
            </div>
            <div className="form-group">
              <label>City</label>
              <input type="text" placeholder="Enter city" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>State</label>
              <input type="text" placeholder="Enter state" />
            </div>
            <div className="form-group">
              <label>Postal Code</label>
              <input type="text" placeholder="Enter postal code" />
            </div>
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" placeholder="Enter phone number" />
          </div>
        </div>

        <div className="checkout-summary">
          <h2>Order Summary</h2>
          <div className="summary-items">
            {cartItems.map(item => (
              <div key={item.id} className="summary-item">
                <span>{item.name} x {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="summary-total">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{getTotalPrice().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>₹50</span>
            </div>
            <div className="summary-row">
              <span>Tax (18%):</span>
              <span>₹{(getTotalPrice() * 0.18).toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            className="btn btn-primary"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Pay with Razorpay'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
