import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import {
    Plus,
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
    DollarSign
} from 'lucide-react';

const SellerDashboard = () => {
    const navigate = useNavigate();
    const { logout, seller } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProducts();
    }, []);

    const showStatus = (type, text) => {
        setStatusMessage({ type, text });
        setTimeout(() => setStatusMessage({ type: '', text: '' }), 5000);
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productAPI.getSellerProducts();
            setProducts(response.data);
        } catch (err) {
            showStatus('error', 'CORE LINK FAILURE: Failed to sync with product grid.');
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
                        <div className="glass-card rounded-[2rem] p-8 sticky top-32 shadow-2xl relative overflow-hidden group">
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
                                    className="w-full py-4 text-white font-black tracking-[0.15em] text-[10px] uppercase rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                    style={{ background: 'linear-gradient(90deg, var(--accent-cyan), #0ea5e9)' }}
                                >
                                    <Plus className="w-4 h-4" />
                                    New Product
                                </button>
                                <button
                                    onClick={fetchProducts}
                                    className="w-full py-4 rounded-xl font-black tracking-[0.15em] text-[9px] uppercase transition-all flex items-center justify-center gap-2"
                                    style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-secondary)' }}
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-10">
                        {/* Summary Block */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: "Total Revenue", val: `$${totalValue.toLocaleString()}`, icon: DollarSign, color: "cyan" },
                                { label: "Active Products", val: totalProducts.toString(), icon: Package, color: "magenta" },
                                { label: "Total Orders", val: "18", icon: Activity, color: "purple" }
                            ].map((stat, i) => (
                                <div key={i} className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[50px]" style={{
                                        background: `radial-gradient(circle, var(--accent-${stat.color === 'cyan' ? 'cyan' : stat.color === 'magenta' ? 'magenta' : 'primary'}) 0%, transparent 70%)`,
                                        opacity: 0.15
                                    }}></div>

                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                                            <div className="p-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                                                <stat.icon className="w-4 h-4" style={{ color: stat.color === 'cyan' ? 'var(--accent-cyan)' : stat.color === 'magenta' ? 'var(--accent-magenta)' : 'var(--accent-primary)' }} />
                                            </div>
                                        </div>
                                        <h3 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{stat.val}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Inventory Grid */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl" style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
                                        <Package className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <h3 className="text-sm font-black tracking-wider uppercase" style={{ color: 'var(--text-primary)' }}>Product Inventory</h3>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-6">
                                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin glow-cyan"></div>
                                    <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.5em] animate-pulse">Syncing Linked Nodes...</p>
                                </div>
                            ) : products.length === 0 ? (
                                <div className="glass-effect rounded-[3rem] p-32 text-center border-2 border-dashed border-white/5 group">
                                    <Package className="w-24 h-24 text-slate-800 mx-auto mb-10 group-hover:scale-110 transition-transform" />
                                    <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Repository Null</h4>
                                    <p className="text-slate-500 mb-12 max-w-sm mx-auto font-bold uppercase tracking-widest text-[11px] leading-relaxed">No hardware assets detected in the current sector. Initialize deployment protocol.</p>
                                    <button
                                        onClick={() => navigate('/sell/add-product')}
                                        className="px-14 py-5 bg-white/5 border border-cyan-500/30 text-cyan-400 font-black uppercase tracking-[0.3em] text-[12px] rounded-2xl hover:bg-cyan-500 hover:text-slate-950 transition-all glow-cyan"
                                    >
                                        Execute Initialization
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-10">
                                    {products.map((p) => (
                                        <div
                                            key={p.productId}
                                            className="glass-effect rounded-[3rem] p-8 group hover:border-cyan-500/50 transition-all duration-700 relative flex flex-col bg-slate-900/40"
                                        >
                                            <div className="aspect-[4/3] bg-slate-950 rounded-[2rem] mb-8 overflow-hidden border border-white/5 relative group/img">
                                                {p.imageUrls?.[0] ? (
                                                    <img src={p.imageUrls[0]} alt={p.title} className="w-full h-full object-cover opacity-80 group-hover/img:scale-105 group-hover/img:opacity-100 transition-all duration-1000" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-white/5"><Package className="w-16 h-16 text-slate-700" /></div>
                                                )}
                                                <div className="absolute top-4 left-4 px-4 py-1.5 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 text-[10px] font-black tracking-widest text-cyan-400 uppercase italic">
                                                    ID: {p.productId.slice(0, 8)}
                                                </div>
                                            </div>

                                            <div className="space-y-6 flex-grow flex flex-col">
                                                <div className="flex-grow">
                                                    <p className="text-[10px] font-black tracking-[0.4em] text-cyan-700 uppercase mb-3 italic">Hardware Class</p>
                                                    <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter line-clamp-2 leading-tight mb-8">{p.title}</h4>

                                                    <div className="flex justify-between items-end bg-black/20 p-6 rounded-2xl border border-white/5">
                                                        <div>
                                                            <p className="text-[10px] font-black tracking-[0.2em] text-slate-600 uppercase mb-1">Credit Value</p>
                                                            <p className="text-4xl font-black text-white tracking-tighter">
                                                                <span className="text-cyan-500 font-light text-2xl">$</span>{parseFloat(p.price).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 glow-cyan">
                                                            <Target className="w-7 h-7" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-8 border-t border-white/5 space-y-8">
                                                    <div className="flex justify-between items-center text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase italic">
                                                        <span>Loadout: {p.quantity} Units</span>
                                                        <span className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-cyan-500 glow-cyan"></div>
                                                            SYNCHRONIZED
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <button
                                                            onClick={() => handleEdit(p)}
                                                            className="flex items-center justify-center gap-3 py-5 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-[11px] font-black tracking-[0.3em] uppercase text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-all active:scale-95 shadow-lg"
                                                            disabled={actionLoading}
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                            Modify
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(p.productId)}
                                                            className="flex items-center justify-center gap-3 py-5 bg-red-500/5 border border-red-500/20 rounded-2xl text-[11px] font-black tracking-[0.3em] uppercase text-red-500/70 hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                                            disabled={actionLoading}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Dispose
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .clip-path-inner { clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px), 0 18px); }
                .octagon-card { clip-path: polygon(19px 0, calc(100% - 19px) 0, 100% 19px, 100% calc(100% - 19px), calc(100% - 19px) 100%, 19px 100%, 0 calc(100% - 19px), 0 19px); background: linear-gradient(135deg, rgba(34, 211, 238, 0.4), rgba(217, 70, 239, 0.4)); }
                @keyframes pulse-slow { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } }
                .animate-pulse-slow { animation: pulse-slow 4s infinite ease-in-out; }
            `}} />
        </div>
    );
};

export default SellerDashboard;
