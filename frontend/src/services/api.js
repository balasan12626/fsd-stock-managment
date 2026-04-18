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

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('[AUTH] Session expired. Redirecting to login.');
            localStorage.clear();
            const portal = window.location.pathname.split('/')[1];
            const loginPath = portal === 'admin' ? '/admin/login' : (portal === 'sell' ? '/sell/login' : '/shop/login');
            window.location.href = `${loginPath}?error=session_expired`;
        }
        return Promise.reject(error);
    }
);

export const sellerAPI = {
    register: (formData) => api.post('/seller/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    login: (data) => api.post('/seller/login', data),
    getProfile: () => api.get('/seller/profile'),
    getReport: () => api.get('/analytics/report'),
    getForecast: (days = 30) => api.get(`/analytics/forecast?days=${days}`),
    getOrders: (sellerId) => api.get(`/seller/orders/${sellerId}`),
};

export const productAPI = {
    add: (formData) => api.post('/product/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    bulkAdd: (products) => api.post('/seller/products/bulk', { products }),
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
    getAllOrders: () => api.get('/admin/orders'),
    getAllCustomers: () => api.get('/admin/customers'),
    deleteCustomer: (email) => api.delete(`/admin/customers/${email}`),
    deleteSeller: (sellerId) => api.delete(`/admin/sellers/${sellerId}`),
};

export const customerAPI = {
    register: (data) => api.post('/customer/register', data),
    login: (data) => api.post('/customer/login', data),
    verifyEmail: (email) => api.post('/customer/verify-email', { email }),
    getProducts: () => api.get('/customer/products'),

    getProductDetails: (id) => api.get(`/customer/products/${id}`),
    cart: {
        get: () => api.get('/customer/cart'),
        add: (product, quantity) => api.post('/customer/cart', { product, quantity }),
        remove: (id) => api.delete(`/customer/cart/${id}`),
    },
    orders: {
        create: (data) => api.post('/customer/orders', data),
        get: () => api.get('/customer/orders'),
        updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status })
    },
    reviews: {
        get: (productId) => api.get(`/customer/products/${productId}/reviews`),
        add: (productId, data) => api.post(`/customer/products/${productId}/reviews`, data),
        update: (productId, reviewId, data) => api.put(`/customer/products/${productId}/reviews/${reviewId}`, data),
        delete: (productId, reviewId) => api.delete(`/customer/products/${productId}/reviews/${reviewId}`),
    }
};

export const publicAPI = {
    getStats: () => api.get('/public/stats'),
    getRecommendations: (productId, category) => api.get(`/public/recommend/${productId}`, { params: { category } })
};


export default api;

