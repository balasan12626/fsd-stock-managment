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
};

export const productAPI = {
    add: (formData) => api.post('/product/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (data) => api.put('/product/update', data),
    delete: (productId) => api.delete(`/product/delete/${productId}`),
    getSellerProducts: () => api.get('/product/seller-products'),
};

export default api;
