import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verify: () => api.get('/auth/verify'),
};

// Products API
export const productsAPI = {
  list: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories/list'),
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart/add', data),
  update: (id, data) => api.put(`/cart/${id}`, data),
  remove: (id) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart'),
};

// Orders API
export const ordersAPI = {
  list: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  track: (id) => api.get(`/orders/${id}/track`),
  createReturn: (id, data) => api.post(`/orders/${id}/return`, data),
};

// Payments API
export const paymentsAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify-payment', data),
  getStatus: (razorpayOrderId) => api.get(`/payments/status/${razorpayOrderId}`),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getAddresses: () => api.get('/user/addresses'),
  addAddress: (data) => api.post('/user/addresses', data),
  updateAddress: (id, data) => api.put(`/user/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/user/addresses/${id}`),
  getWishlist: () => api.get('/user/wishlist'),
  addWishlist: (data) => api.post('/user/wishlist', data),
  removeWishlist: (id) => api.delete(`/user/wishlist/${id}`),
  changePassword: (data) => api.post('/user/change-password', data),
};

// Admin API
export const adminAPI = {
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  createOffer: (data) => api.post('/admin/sales-offers', data),
  getOffers: () => api.get('/admin/sales-offers'),
  updateOffer: (id, data) => api.put(`/admin/sales-offers/${id}`, data),
  getStats: () => api.get('/admin/stats'),
  getOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
};

// Upload API
export const uploadAPI = {
  uploadImage: (data) => api.post('/uploads/image', data),
  uploadVideo: (data) => api.post('/uploads/video', data),
  uploadBatch: (data) => api.post('/uploads/batch', data),
  deleteFile: (blobName) => api.delete(`/uploads/${encodeURIComponent(blobName)}`),
  getUploadToken: (filename) => api.get(`/uploads/token/${filename}`),
};

export default api;
