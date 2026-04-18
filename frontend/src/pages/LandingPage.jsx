import React from 'react';
import { Link } from 'react-router-dom';
import {
    Layout,
    User,
    ShoppingBag,
    ShieldCheck,
    ArrowRight,
    LogIn,
    UserPlus,
    Activity,
    Package,
    ArrowUpRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
    const { theme } = useTheme();

    const sections = [
        {
            title: 'Customer Storefront',
            icon: <ShoppingBag className="w-10 h-10 text-blue-500" />,
            description: 'A premium shopping experience with AI-powered recommendations and seamless checkout.',
            badge: 'Portal v2.0',
            links: [
                { path: '/shop', label: 'Enter Store', primary: true },
                { path: '/shop/login', label: 'Login', icon: <LogIn className="w-4 h-4" /> },
            ],
            features: ['Live Inventory', 'Secure Payments', 'Order Tracking'],
            glow: 'rgba(59, 130, 246, 0.2)'
        },
        {
            title: 'Seller Command',
            icon: <Activity className="w-10 h-10 text-purple-500" />,
            description: 'Advanced inventory management with AI forecasting and deep sales analytics.',
            badge: 'BETA AI',
            links: [
                { path: '/sell/dashboard', label: 'Launch Dashboard', primary: true },
                { path: '/sell/login', label: 'Login', icon: <LogIn className="w-4 h-4" /> },
            ],
            features: ['Demand Forecast', 'Sales Analytics', 'Product Management'],
            glow: 'rgba(139, 92, 246, 0.2)'
        },
        {
            title: 'Admin Master',
            icon: <ShieldCheck className="w-10 h-10 text-emerald-500" />,
            description: 'Full system control. Monitor performance, manage users, and audit operations.',
            badge: 'Restricted',
            links: [
                { path: '/admin/dashboard', label: 'System Overview', primary: true },
                { path: '/admin/login', label: 'Admin Login', icon: <LogIn className="w-4 h-4" /> },
            ],
            features: ['System Health', 'User Management', 'Admin Controls'],
            glow: 'rgba(16, 185, 129, 0.2)'
        }
    ];

    return (
        <div className="min-h-screen bg-primary text-primary selection:bg-accent-primary/30 relative overflow-hidden cosmic-grid">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent-secondary/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

            <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-24">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Package className="text-white w-7 h-7" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">a6b<span className="text-accent-primary">Stock</span> AI</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="https://github.com/balasan12626/fsd-stock-managment" target="_blank" className="text-secondary hover:text-primary font-medium transition-colors">Documentation</a>
                        <button className="btn-primary">Get Started</button>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="text-center mb-24 space-y-6">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-glass text-accent-primary text-sm font-semibold mb-4 animate-fade-in">
                        Powered by AI Predictions ✨
                    </div>
                    <h1 className="text-7xl md:text-8xl font-black tracking-tight leading-[1.1] animate-slide-up">
                        The Next Generation<br />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                            Inventory System
                        </span>
                    </h1>
                    <p className="text-secondary text-xl max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        Transform your business with real-time stock tracking, AI-powered demand forecasting,
                        and a seamless multi-vendor ecosystem.
                    </p>
                </div>

                {/* Portals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {sections.map((section, idx) => (
                        <div
                            key={idx}
                            className="premium-card p-10 group relative flex flex-col h-full"
                        >
                            <div className="absolute top-0 right-0 p-6">
                                <span className="px-3 py-1 rounded-full bg-white/5 border border-glass text-xs font-bold text-secondary tracking-widest uppercase">
                                    {section.badge}
                                </span>
                            </div>

                            <div className="mb-8 inline-flex p-4 rounded-3xl bg-white/5 border border-glass group-hover:scale-110 transition-transform duration-300">
                                {section.icon}
                            </div>

                            <h2 className="text-2xl font-bold mb-4 group-hover:text-accent-primary transition-colors">
                                {section.title}
                            </h2>
                            <p className="text-secondary mb-8 leading-relaxed">
                                {section.description}
                            </p>

                            <div className="mt-auto space-y-6">
                                <ul className="space-y-3">
                                    {section.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-secondary">
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <div className="space-y-3">
                                    {section.links.map((link, lIdx) => (
                                        <Link
                                            key={lIdx}
                                            to={link.path}
                                            className={`flex items-center justify-between w-full px-5 py-4 rounded-2xl transition-all duration-300 ${link.primary
                                                ? 'bg-accent-primary text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5'
                                                : 'bg-white/5 border border-glass hover:bg-white/10'
                                                }`}
                                        >
                                            <span className="font-bold">{link.label}</span>
                                            {link.primary ? <ArrowRight className="w-5 h-5" /> : link.icon}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Status Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 py-10 border-t border-glass">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 text-secondary text-sm">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Systems Operational
                        </div>
                        <div className="flex items-center gap-2 text-secondary text-sm">
                            <Activity className="w-4 h-4 text-accent-primary" />
                            AI Prediction Engine Active
                        </div>
                    </div>
                    <div className="text-secondary text-sm font-medium">
                        © 2026 a6b Stock Management System. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;

