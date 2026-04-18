import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    BarChart3,
    History,
    Settings,
    LogOut,
    Menu,
    X,
    Sun,
    Moon,
    Bell,
    Search,
    User,
    ChevronRight,
    ShoppingBag
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const PortalLayout = ({ children, menuItems, userType = 'Seller' }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    return (
        <div className="min-h-screen bg-primary text-primary flex overflow-hidden lg:pl-0">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 glass-panel border-r border-glass transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-full flex flex-col p-6">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="w-10 h-10 bg-accent-primary rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Package className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight uppercase">StockSync</span>
                    </div>

                    {/* Menu */}
                    <nav className="flex-1 space-y-2">
                        {menuItems.map((item, idx) => (
                            <Link
                                key={idx}
                                to={item.path}
                                className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                                {location.pathname === item.path && <ChevronRight className="ml-auto w-4 h-4" />}
                            </Link>
                        ))}
                    </nav>

                    {/* Bottom Section */}
                    <div className="mt-auto space-y-2 pt-6 border-t border-glass">
                        <div className="sidebar-item" onClick={toggleTheme}>
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </div>
                        <Link to="/links" className="sidebar-item text-accent-danger hover:bg-accent-danger/10 hover:text-accent-danger">
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sign Out</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-20 glass-panel border-b border-glass flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            className="p-2 rounded-xl border border-glass lg:hidden"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            {isSidebarOpen ? <X /> : <Menu />}
                        </button>
                        <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-glass">
                            <Search className="w-4 h-4 text-secondary" />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="bg-transparent border-none outline-none text-sm w-64"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden lg:block text-right">
                            <p className="text-sm font-bold">{userType} Portal</p>
                            <p className="text-xs text-secondary">Active Session</p>
                        </div>
                        <div className="relative group">
                            <button className="p-2.5 rounded-2xl bg-white/5 border border-glass hover:bg-white/10 transition-all relative">
                                <Bell className="w-5 h-5 text-secondary group-hover:text-primary" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-accent-primary rounded-full" />
                            </button>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center border-2 border-white/10 shadow-lg shadow-blue-500/20">
                            <User className="text-white w-6 h-6" />
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-accent-primary/5 rounded-full blur-[100px] -z-10" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-secondary/5 rounded-full blur-[100px] -z-10" />

                    {children}
                </div>
            </main>
        </div>
    );
};

export default PortalLayout;
