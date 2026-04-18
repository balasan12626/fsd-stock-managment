import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [userId, setUserId] = useState(localStorage.getItem('userId'));
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = (newToken, newUserId, userData) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('userId', newUserId);
        if (userData) {
            // Ensure userData has a role even if derived from sellerId
            const finalUser = {
                ...userData,
                role: userData.role || (userData.sellerId ? 'seller' : 'customer')
            };
            localStorage.setItem('user', JSON.stringify(finalUser));
            setUser(finalUser);
        }
        setToken(newToken);
        setUserId(newUserId);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('user');
        localStorage.removeItem('sellerId'); // Cleanup legacy
        localStorage.removeItem('seller');   // Cleanup legacy
        setToken(null);
        setUserId(null);
        setUser(null);
    };

    const isAuthenticated = () => !!token || !!localStorage.getItem('token');

    const getRole = () => {
        if (user?.role) return user.role;
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                if (parsed.role) return parsed.role;
                // Heuristic fallback if role is missing but ID is present
                if (parsed.sellerId) return 'seller';
                if (parsed.adminId) return 'admin';
                if (parsed.customerId) return 'customer';
            } catch (e) {
                return null;
            }
        }
        return null;
    };
    
    // Explicitly check for portals
    const isAdmin = () => ['admin', 'superadmin'].includes(getRole());
    const isSeller = () => getRole() === 'seller';
    const isCustomer = () => getRole() === 'customer';

    return (
        <AuthContext.Provider value={{ token, userId, user, login, logout, isAuthenticated, getRole, isAdmin, isSeller, isCustomer }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

