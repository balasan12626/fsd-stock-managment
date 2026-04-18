import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import GlobalCommandBar from './components/GlobalCommandBar';
import VerificationBanner from './components/VerificationBanner';

import SellerRegister from './pages/SellerRegister';
import SellerLogin from './pages/SellerLogin';
import SellerDashboard from './pages/SellerDashboard';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';
import SellerAnalytics from './pages/SellerAnalytics';
import TransactionHistory from './pages/TransactionHistory';
import SellerReports from './pages/SellerReports';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

// Customer Pages
import StoreHome from './pages/customer/StoreHome';
import ProductDetails from './pages/customer/ProductDetails';
import CartPage from './pages/customer/CartPage';
import CustomerLogin from './pages/customer/CustomerLogin';
import CustomerSignup from './pages/customer/CustomerSignup';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderManagement from './pages/OrderManagement';
import LandingPage from './pages/LandingPage';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <GlobalCommandBar />
                    <VerificationBanner />
                    <Routes>
                        {/* Main Entry Point */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/links" element={<LandingPage />} />
                        <Route path="/link" element={<LandingPage />} />

                        {/* Customer / Shop Routes */}
                        <Route path="/shop" element={<StoreHome />} />
                        <Route path="/shop/product/:id" element={<ProductDetails />} />
                        <Route path="/shop/login" element={<CustomerLogin />} />
                        <Route path="/shop/signup" element={<CustomerSignup />} />
                        <Route
                            path="/shop/cart"
                            element={
                                <ProtectedRoute requiredRole="customer">
                                    <CartPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/shop/checkout"
                            element={
                                <ProtectedRoute requiredRole="customer">
                                    <CheckoutPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/shop/orders"
                            element={
                                <ProtectedRoute requiredRole="customer">
                                    <OrderManagement />
                                </ProtectedRoute>
                            }
                        />

                        {/* Redirects for legacy/typo routes */}
                        <Route path="/seller/login" element={<Navigate to="/sell/login" replace />} />

                        {/* Seller Routes */}
                        <Route path="/sell/register" element={<SellerRegister />} />
                        <Route path="/sell/login" element={<SellerLogin />} />
                        <Route
                            path="/sell/dashboard"
                            element={
                                <ProtectedRoute requiredRole="seller">
                                    <SellerDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/sell/add-product"
                            element={
                                <ProtectedRoute requiredRole="seller">
                                    <AddProduct />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/sell/edit-product"
                            element={
                                <ProtectedRoute requiredRole="seller">
                                    <EditProduct />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/sell/transactions"
                            element={
                                <ProtectedRoute requiredRole="seller">
                                    <TransactionHistory />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/sell/reports"
                            element={
                                <ProtectedRoute requiredRole="seller">
                                    <SellerReports />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/sell/orders"
                            element={
                                <ProtectedRoute requiredRole="seller">
                                    <OrderManagement />
                                </ProtectedRoute>
                            }
                        />

                        {/* Admin Routes */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/register" element={<AdminRegister />} />
                        <Route
                            path="/admin/dashboard"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/analytics"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <SellerAnalytics />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/orders"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <OrderManagement />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/superadmin/dashboard"
                            element={
                                <ProtectedRoute requiredRole="superadmin">
                                    <SuperAdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
