import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
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

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Navigate to="/sell/login" replace />} />

                        {/* Seller Routes */}
                        <Route path="/sell/register" element={<SellerRegister />} />
                        <Route path="/sell/login" element={<SellerLogin />} />
                        <Route
                            path="/sell/dashboard"
                            element={
                                <ProtectedRoute>
                                    <SellerDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/sell/add-product"
                            element={
                                <ProtectedRoute>
                                    <AddProduct />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/sell/edit-product"
                            element={
                                <ProtectedRoute>
                                    <EditProduct />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/sell/transactions"
                            element={
                                <ProtectedRoute>
                                    <TransactionHistory />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/sell/reports"
                            element={
                                <ProtectedRoute>
                                    <SellerReports />
                                </ProtectedRoute>
                            }
                        />

                        {/* Admin Routes */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/register" element={<AdminRegister />} />
                        <Route
                            path="/admin/dashboard"
                            element={
                                <ProtectedRoute adminOnly={true}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/analytics"
                            element={
                                <ProtectedRoute adminOnly={true}>
                                    <SellerAnalytics />
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
