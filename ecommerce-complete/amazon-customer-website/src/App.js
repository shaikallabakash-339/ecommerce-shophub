import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={isAuthenticated ? <CheckoutPage /> : <Navigate to="/login" />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />
            <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
            <Route path="/orders" element={isAuthenticated ? <OrdersPage /> : <Navigate to="/login" />} />
            <Route path="/order/:id/track" element={isAuthenticated ? <OrderTrackingPage /> : <Navigate to="/login" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
