import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../styles/Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartItems } = useCart();

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>ShopHub</h1>
        </Link>

        <nav className="nav-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/cart" className="nav-link cart-link">
            Cart ({cartItems.length})
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/orders" className="nav-link">Orders</Link>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <button onClick={logout} className="nav-link logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Sign In</Link>
              <Link to="/register" className="nav-link register-link">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
