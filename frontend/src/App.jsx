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

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Navigate to="/sell/login" replace />} />
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
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
