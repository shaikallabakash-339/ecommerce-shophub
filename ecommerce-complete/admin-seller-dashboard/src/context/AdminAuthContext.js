import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');
    
    if (token && userData) {
      const user = JSON.parse(userData);
      if (user.isAdmin) {
        setUser(user);
        setIsAuthenticated(true);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const { user, token } = response.data;

      if (!user.isAdmin) {
        throw new Error('Admin access required');
      }

      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
