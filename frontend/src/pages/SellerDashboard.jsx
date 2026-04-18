import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, sellerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import BulkUploadModal from '../components/BulkUploadModal';
import {
    Plus,
    Edit2,
    Edit3,
    Trash2,
    LogOut,
    Package,
    LayoutDashboard,
    Zap,
    Target,
    User,
    Settings,
    Activity,
    AlertTriangle,
    CheckCircle2,
    RefreshCw,
    DollarSign,
    BarChart3,
    ShoppingBag,
    UploadCloud
} from 'lucide-react';

const SellerDashboard = () => {
    const navigate = useNavigate();
    const { logout, user: seller } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    const [lowStockItems, setLowStockItems] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [showBulkModal, setShowBulkModal] = useState(false);

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const showStatus = (type, text) => {
        setStatusMessage({ type, text });
        setTimeout(() => setStatusMessage({ type: '', text: '' }), 5000);
    };

    const fetchDashboardData = async () => {
        setLoading(true);

        // 1. Fetch Products (Critical)
        try {
            const productsRes = await productAPI.getSellerProducts();
            setProducts(productsRes.data);
        } catch (err) {
            console.error('Product Fetch Error:', err);
            showStatus('error', 'CONNECTION ERROR: Could not retrieve hardware inventory.');
        }

        // 2. Fetch Analytics (Non-Critical)
        try {
            const reportRes = await sellerAPI.getReport();
            if (reportRes.data.success) {
                setLowStockItems(reportRes.data.report.lowStockItems);
                setRecentTransactions(reportRes.data.report.recentTransactions);
            }
        } catch (err) {
            console.error('Analytics Fetch Error:', err);
            showStatus('warning', 'ANALYTICS OFFLINE: Report module temporarily unavailable.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!productId) return;
        if (!window.confirm('⚠️ CRITICAL DISPOSAL PROTOCOL: Are you sure you want to permanently erase this hardware unit?')) return;

        try {
            setActionLoading(true);
            const response = await productAPI.delete(productId);
            setProducts(prev => prev.filter(p => p.productId !== productId));
            showStatus('success', 'DISPOSAL COMPLETE: Unit has been removed from matrix.');
        } catch (err) {
            console.error('Delete Protocol Failure:', err);
            showStatus('error', `SYSTEM ERROR: Disposal failed. ${err.response?.data?.message || 'Unknown error.'}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleEdit = (product) => {
        navigate('/sell/edit-product', { state: { product } });
    };

    const handleLogout = () => {
        logout();
        navigate('/sell/login');
    };

    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.price) * parseInt(p.quantity) || 0), 0);

    return (
        <div className="min-h-screen cosmic-grid selection:bg-cyan-500/30" style={{ color: 'var(--text-primary)' }}>
            {/* Notification Toast */}
            {statusMessage.text && (
                <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl backdrop-blur-xl animate-fade-in flex items-center gap-4 shadow-2xl`} style={{
                    background: statusMessage.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    border: statusMessage.type === 'error' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(34, 197, 94, 0.5)',
                    color: statusMessage.type === 'error' ? '#fca5a5' : '#86efac'
                }}>
                    {statusMessage.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    <span className="text-xs font-black uppercase tracking-[0.2em]">{statusMessage.text}</span>
                </div>
            )}

            {/* Top Navigation */}
            <nav className="backdrop-blur-2xl sticky top-0 z-50" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--glass-bg)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-22">
                        <div className="flex items-center gap-10">
                            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/sell/dashboard')}>
                                <div className="p-2.5 rounded-xl border glow-cyan" style={{ background: 'rgba(6, 182, 212, 0.1)', borderColor: 'rgba(6, 182, 212, 0.2)' }}>
                                    <Zap className="w-6 h-6 text-cyan-400" />
                                </div>
                                <span className="text-2xl font-black tracking-tighter uppercase italic" style={{ color: 'var(--text-primary)' }}>TECH<span className="text-cyan-400">VIBE</span></span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="pill-button group hidden md:flex">
                                <div className="w-8 h-4 bg-gradient-to-r from-cyan-400 to-magenta-400 rounded-full blur-[2px] opacity-70"></div>
                                <span className="text-[10px] uppercase font-black tracking-[0.2em]">PRO NODE</span>
                            </div>
                            <ThemeToggle />
                            <button
                                onClick={handleLogout}
                                className="p-3 rounded-xl transition-all border"
                                style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.1)', color: 'rgba(239, 68, 68, 0.6)' }}
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    {/* Profile Section */}
                    <div className="lg:col-span-1">
                        <div className="glass-card rounded-[2rem] p-8 sticky top-32 shadow-2xl relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px]" style={{ background: 'radial-gradient(circle, var(--accent-cyan) 0%, transparent 70%)', opacity: 0.1 }}></div>

                            <div className="relative mb-6 flex justify-center">
                                <div className="w-24 h-24 rounded-full p-1 animate-pulse-slow" style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-magenta))' }}>
                                    <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden border-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--bg-secondary)' }}>
                                        {seller?.logoUrl ? (
                                            <img src={seller.logoUrl} alt="Store" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
                                        )}
                                    </div>
                                </div>
                                <div className="absolute bottom-0 right-[calc(50%-1.5rem)] bg-green-500 w-5 h-5 rounded-full border-4 glow-cyan" style={{ borderColor: 'var(--bg-secondary)' }}></div>
                            </div>

                            <div className="text-center mb-8">
                                <h2 className="text-xl font-black italic tracking-tighter uppercase mb-1" style={{ color: 'var(--text-primary)' }}>{seller?.companyName || 'CORE_TECH'}</h2>
                                <p className="text-[8px] font-bold uppercase tracking-[0.3em] font-mono" style={{ color: 'var(--text-muted)' }}>UID: {seller?.sellerId?.slice(0, 10)}</p>

                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <span className="px-2 py-1 rounded-md bg-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase">Verified Seller</span>
                                </div>

                                <div className="mt-6 pt-6 space-y-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] uppercase font-black tracking-widest" style={{ color: 'var(--text-muted)' }}>Total Products</span>
                                        <span className="text-cyan-400 font-bold text-sm">{totalProducts}</span>
                                    </div>
                                    <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--input-bg)' }}>
                                        <div className="h-full bg-cyan-500 glow-cyan" style={{ width: '80%' }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/sell/add-product')}
                                    className="w-full py-4 rounded-xl font-black tracking-[0.15em] text-[10px] uppercase transition-all flex items-center justify-center gap-2 group/btn relative overflow-hidden"
                                    style={{ background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-primary))', color: 'white' }}
                                >
                                    <Plus className="w-4 h-4" />
                                    SYNC NEW HARDWARE
                                </button>
                                <button
                                    onClick={() => setShowBulkModal(true)}
                                    className="w-full py-4 rounded-xl font-black tracking-[0.15em] text-[10px] uppercase transition-all flex items-center justify-center gap-2 border border-accent-primary/30 hover:bg-accent-primary/10 text-accent-primary"
                                >
                                    <UploadCloud className="w-4 h-4" />
                                    MANIFEST UPLOAD
                                </button>
                                <button
                                    onClick={() => navigate('/sell/reports')}
                                    className="w-full py-4 rounded-xl font-black tracking-[0.15em] text-[10px] uppercase transition-all flex items-center justify-center gap-2 animate-pulse"
                                    style={{ background: 'var(--accent-magenta)', border: '1px solid var(--border-color)', color: 'white', boxShadow: '0 0 15px rgba(217, 70, 239, 0.3)' }}
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    PERFORMANCE HUB
                                </button>
                                <button
                                    onClick={() => navigate('/sell/transactions')}
                                    className="w-full py-4 rounded-xl font-black tracking-[0.15em] text-[10px] uppercase transition-all flex items-center justify-center gap-2"
                                    style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-secondary)' }}
                                >
                                    <Activity className="w-4 h-4" />
                                    Activity Log
                                </button>
                                <button
                                    onClick={fetchDashboardData}
                                    className="w-full py-4 rounded-xl font-black tracking-[0.15em] text-[10px] uppercase transition-all flex items-center justify-center gap-2"
                                    style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-secondary)' }}
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content: Inventory Manifest */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Search & Statistics Bar */}
                        <div className="glass-card rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center justify-between border-glass">
                            <div className="relative w-full md:w-96 group">
                                <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary group-focus-within:text-accent-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search inventory matrix..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-primary/50 border border-glass rounded-2xl pl-12 pr-4 py-3 text-xs outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 transition-all font-mono"
                                />
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategoryFilter(cat)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${categoryFilter === cat
                                            ? 'bg-accent-primary text-white shadow-lg shadow-blue-500/20'
                                            : 'bg-white/5 text-secondary hover:bg-white/10 border border-glass'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto glass-card rounded-3xl border-glass">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-secondary uppercase text-[10px] tracking-widest font-black">
                                        <th className="px-8 py-5">Product Details</th>
                                        <th className="px-8 py-5">Category</th>
                                        <th className="px-8 py-5">Price</th>
                                        <th className="px-8 py-5">Stock</th>
                                        <th className="px-8 py-5 text-right whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-glass">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.productId} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-glass bg-primary p-2">
                                                        <img
                                                            src={Array.isArray(product.images) ? product.images[0] : product.imageUrl || 'https://via.placeholder.com/150'}
                                                            alt={product.title}
                                                            className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-primary group-hover:text-accent-primary transition-colors">{product.title}</p>
                                                        <p className="text-xs text-secondary line-clamp-1">{product.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-glass text-xs font-bold text-secondary">
                                                    {product.category || 'General'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 font-black text-accent-primary">
                                                ₹{product.price?.toLocaleString()}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                                        <span className={parseInt(product.quantity) < 10 ? 'text-accent-danger' : 'text-secondary'}>
                                                            {product.quantity} In Stock
                                                        </span>
                                                        <span className="text-secondary/60">{product.soldQuantity || 0} Sold</span>
                                                    </div>
                                                    <div className="w-32 h-1.5 rounded-full bg-white/5 border border-glass overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${parseInt(product.quantity) < 10
                                                                ? 'bg-gradient-to-r from-accent-danger to-orange-500'
                                                                : 'bg-gradient-to-r from-accent-primary to-accent-secondary'
                                                                }`}
                                                            style={{ width: `${Math.min(100, (parseInt(product.quantity) / 100) * 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity translate-x-0 transition-all duration-300">
                                                    <button
                                                        onClick={() => navigate('/sell/edit-product', { state: { product } })}
                                                        className="p-2.5 rounded-xl bg-white/5 border border-glass text-accent-primary hover:bg-accent-primary hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.productId)}
                                                        className="p-2.5 rounded-xl bg-white/5 border border-glass text-accent-danger hover:bg-accent-danger hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredProducts.length === 0 && (
                                <div className="p-20 text-center flex flex-col items-center gap-4">
                                    <div className="p-5 rounded-full bg-white/5 border border-glass animate-float">
                                        <ShoppingBag className="w-12 h-12 text-secondary/30" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">No products found</h3>
                                        <p className="text-secondary">Try adjusting your search or add a new product.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <BulkUploadModal 
                isOpen={showBulkModal} 
                onClose={() => setShowBulkModal(false)} 
                onRefresh={fetchDashboardData}
            />
        </div>
    );
};


export default SellerDashboard;
