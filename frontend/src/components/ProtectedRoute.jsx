import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, getRole } = useAuth();
    const location = useLocation();
    const role = getRole();

    if (!isAuthenticated()) {
        // Redirect to appropriate login page based on the current path
        const loginPath = location.pathname.startsWith('/admin') ? '/admin/login' : '/sell/login';
        return <Navigate to={loginPath} replace />;
    }

    if (adminOnly && role !== 'admin') {
        return <Navigate to="/sell/login" replace />;
    }

    return children;
};

export default ProtectedRoute;

