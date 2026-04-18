import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, getRole } = useAuth();
    const location = useLocation();
    const role = getRole();
    const path = location.pathname;

    if (!isAuthenticated()) {
        const portal = location.pathname.split('/')[1];
        const loginMap = { admin: '/admin/login', sell: '/sell/login', shop: '/shop/login' };
        const loginPath = loginMap[portal] || '/shop/login';

        console.log(`[SECURITY] Unauthenticated attempt to ${location.pathname}. Redirecting to ${loginPath}`);
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // Role-based access control (Logged in but wrong role)
    const hasRequiredRole = role === requiredRole || (requiredRole === 'admin' && role === 'superadmin');

    if (requiredRole && !hasRequiredRole) {
        console.warn(`[AUTH] Unauthorized Access. Required: ${requiredRole}, Current: ${role}`);

        // Redirect to the user's appropriate portal if they are in the wrong place
        if (role === 'admin' || role === 'superadmin') {
            return <Navigate to="/admin/dashboard" replace />;
        }

        if (role === 'seller') {
            return <Navigate to="/sell/dashboard" replace />;
        }

        if (role === 'customer') {
            return <Navigate to="/shop" replace />;
        }

        return <Navigate to="/shop/login" replace />;
    }

    return children;
};

export default ProtectedRoute;

