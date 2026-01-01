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
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
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

    const isAuthenticated = () => !!token;

    const getRole = () => user?.role || (user?.sellerId ? 'seller' : null);

    return (
        <AuthContext.Provider value={{ token, userId, user, login, logout, isAuthenticated, getRole }}>
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

