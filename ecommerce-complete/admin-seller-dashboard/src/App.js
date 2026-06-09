import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import OffersPage from './pages/OffersPage';
import LoginPage from './pages/LoginPage';
import { useAdminAuth } from './context/AdminAuthContext';
import './App.css';

function App() {
  const { isAuthenticated } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <div className="admin-app">
        {isAuthenticated ? (
          <>
            <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <div className="admin-container">
              <AdminSidebar isOpen={sidebarOpen} />
              <main className="admin-content">
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/offers" element={<OffersPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </main>
            </div>
          </>
        ) : (
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
