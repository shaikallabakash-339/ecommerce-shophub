import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/CartPage.css';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some products to get started!</p>
          <Link to="/" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="cart-container">
      <h1>Shopping Cart</h1>
      
      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.imageUrl || 'https://via.placeholder.com/100'} alt={item.name} />
              
              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="price">₹{item.price}</p>
                <p className="description">{item.description?.substring(0, 100)}...</p>
              </div>

              <div className="item-quantity">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                />
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>

              <div className="item-total">
                <p>₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>

              <button
                className="remove-btn"
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{getTotalPrice().toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>₹50</span>
          </div>
          <div className="summary-row">
            <span>Tax:</span>
            <span>₹{(getTotalPrice() * 0.18).toFixed(2)}</span>
          </div>
          <div className="summary-total">
            <span>Total:</span>
            <span>₹{(getTotalPrice() + 50 + (getTotalPrice() * 0.18)).toFixed(2)}</span>
          </div>

          <button className="btn btn-primary" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
          <button className="btn btn-danger" onClick={clearCart}>
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
