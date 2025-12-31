import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [sellerId, setSellerId] = useState(localStorage.getItem('sellerId'));
    const [seller, setSeller] = useState(() => {
        const savedSeller = localStorage.getItem('seller');
        return savedSeller ? JSON.parse(savedSeller) : null;
    });

    const login = (newToken, newSellerId, sellerData) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('sellerId', newSellerId);
        if (sellerData) {
            localStorage.setItem('seller', JSON.stringify(sellerData));
            setSeller(sellerData);
        }
        setToken(newToken);
        setSellerId(newSellerId);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('sellerId');
        localStorage.removeItem('seller');
        setToken(null);
        setSellerId(null);
        setSeller(null);
    };

    const isAuthenticated = () => !!token;

    return (
        <AuthContext.Provider value={{ token, sellerId, seller, login, logout, isAuthenticated }}>
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
