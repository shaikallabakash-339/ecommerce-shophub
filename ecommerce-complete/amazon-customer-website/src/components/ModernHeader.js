import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="fashion-header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="fashion-logo">
          <span className="logo-icon">👗</span>
          <span className="logo-text">FashionHub</span>
        </Link>

        {/* Search Bar */}
        <form className="search-container" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Search fashion, clothes, styles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn">🔍</button>
        </form>

        {/* Navigation */}
        <nav className="nav-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/browse?gender=Men" className="nav-link">Men</Link>
          <Link to="/browse?gender=Women" className="nav-link">Women</Link>
          <Link to="/browse?gender=Kids" className="nav-link">Kids</Link>
          <Link to="/browse?onSale=true" className="nav-link sale-link">🔥 Sale</Link>
        </nav>

        {/* Actions */}
        <div className="header-actions">
          <Link to="/cart" className="action-btn cart-btn">
            🛒 Cart
          </Link>

          {isAuthenticated ? (
            <div className="user-menu">
              <button
                className="action-btn user-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                👤 Account
              </button>
              {isMenuOpen && (
                <div className="dropdown-menu">
                  <p className="user-name">Hi, {user?.firstName || 'User'}</p>
                  <Link to="/dashboard">My Orders</Link>
                  <Link to="/profile">Profile</Link>
                  <button onClick={() => { logout(); setIsMenuOpen(false); }}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="action-btn login-btn">
              🔐 Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
