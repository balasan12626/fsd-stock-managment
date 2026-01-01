import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const sellerAPI = {
    register: (formData) => api.post('/seller/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    login: (data) => api.post('/seller/login', data),
    getProfile: () => api.get('/seller/profile'),
    getReport: () => api.get('/seller/report'),
};

export const productAPI = {
    add: (formData) => api.post('/product/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (data) => api.put('/product/update', data),
    delete: (productId) => api.delete(`/product/delete/${productId}`),
    getSellerProducts: () => api.get('/product/seller-products'),
    getTransactions: () => api.get('/transactions/seller'),
    createTransaction: (data) => api.post('/transactions', data),
};

export const adminAPI = {
    register: (data) => api.post('/admin/register', data),
    login: (data) => api.post('/admin/login', data),
    getProfile: () => api.get('/admin/profile'),
    getAllProducts: () => api.get('/admin/products'),
    getAllSellers: () => api.get('/admin/sellers'),
    getProductDetails: (productId) => api.get(`/admin/products/${productId}`),
    getStats: () => api.get('/admin/stats'),
    deleteProduct: (productId) => api.delete(`/admin/products/${productId}`),
    // Management
    getPendingAdmins: () => api.get('/admin/manage/all'),
    updateAdminStatus: (adminId, status) => api.put(`/admin/manage/status/${adminId}`, { status }),
    getPerformanceReport: () => api.get('/admin/reports/seller-performance'),
};

export default api;

