import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { customerAPI } from '../services/api';
import {
    ShoppingBag,
    LogOut,
    User,
    Search,
    ShoppingCart,
    FileText,
    Bell,
    Settings,
    Menu,
    Package,
    Sun,
    Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const CustomerNavbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [cartCount, setCartCount] = React.useState(0);
    const [searchQuery, setSearchQuery] = React.useState('');

    const fetchCartCount = async () => {
        if (!isAuthenticated()) {
            setCartCount(0);
            return;
        }
        try {
            const res = await customerAPI.cart.get();
            const count = res.data.reduce((total, item) => total + item.quantity, 0);
            setCartCount(count);
        } catch (err) {
            console.error('Cart fetch failed:', err);
            if (err.response?.status === 401) {
                setCartCount(0);
            }
        }
    };

    React.useEffect(() => {
        fetchCartCount();

        // BUG FIX #4: Real-time synchronization bus
        const interval = setInterval(fetchCartCount, 15000); // Poll as fallback every 15s

        window.addEventListener('cart-updated', fetchCartCount);
        return () => {
            window.removeEventListener('cart-updated', fetchCartCount);
            clearInterval(interval);
        };
    }, [isAuthenticated()]);

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            // BUG FIX #4: Update URL with search parameters
            navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/shop/login');
    };

    return (
        <nav className="h-24 sticky top-0 z-[100] transition-all duration-500 glass-panel border-b border-glass">
            <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-8">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Package className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black tracking-tight hidden sm:block">
                        a6b<span className="text-accent-primary">Stock</span>
                    </span>
                </Link>

                {/* Search Bar - BUG FIX #4: Implemented URL-synced search */}
                <div className="flex-1 max-w-2xl hidden md:flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-glass focus-within:border-accent-primary focus-within:bg-white/10 transition-all group">
                    <Search className="w-5 h-5 text-secondary group-focus-within:text-accent-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search for hardware, gadgets, accessories..."
                        className="bg-transparent border-none outline-none text-sm w-full placeholder:text-secondary text-white"
                        onKeyDown={handleSearch}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 sm:gap-6">
                    <button
                        onClick={toggleTheme}
                        className="p-3 rounded-2xl bg-white/5 border border-glass hover:bg-white/10 transition-all text-secondary hover:text-primary"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <Link to="/shop/orders" className="p-3 rounded-2xl bg-white/5 border border-glass hover:bg-white/10 transition-all text-secondary hover:text-primary relative hidden sm:flex">
                        <FileText className="w-5 h-5" />
                    </Link>

                    {/* BUG FIX #3: Real-time Cart Count */}
                    <Link to="/shop/cart" className="p-3 rounded-2xl bg-white/5 border border-glass hover:bg-white/10 transition-all text-secondary hover:text-primary relative flex">
                        <ShoppingCart className="w-5 h-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 border-2 border-primary animate-fade-in">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    <div className="h-10 w-px bg-glass mx-2 hidden sm:block" />

                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="hidden lg:block text-right">
                                <p className="text-xs font-bold text-primary">{user.name}</p>
                                <p className="text-[10px] text-secondary uppercase tracking-widest font-black">Customer</p>
                            </div>
                            <div className="relative group">
                                <button className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center border-2 border-white/10 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform overflow-hidden">
                                    <User className="text-white w-6 h-6" />
                                </button>

                                <div className="absolute right-0 mt-4 w-48 premium-card p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[110]">
                                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-accent-danger/10 text-accent-danger text-sm font-bold transition-all">
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/shop/login" className="text-sm font-bold text-secondary hover:text-primary transition-colors hidden sm:block">Login</Link>
                            <Link to="/shop/signup" className="btn-primary py-3 px-6 text-sm">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default CustomerNavbar;
