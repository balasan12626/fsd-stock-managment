import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { customerAPI } from '../../services/api';
import CustomerNavbar from '../../components/CustomerNavbar';
import {
    Trash2,
    ArrowRight,
    ShoppingBag,
    CreditCard,
    ShieldCheck,
    ArrowLeft,
    Minus,
    Plus,
    Zap,
    TrendingUp,
    ShieldAlert
} from 'lucide-react';

const CartPage = () => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const res = await customerAPI.cart.get();
            setCart(res.data);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) navigate('/shop/login');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        try {
            const res = await customerAPI.cart.remove(productId);
            setCart(res.data.cart || []);
            // BUG FIX #3: Trigger navbar update
            window.dispatchEvent(new CustomEvent('cart-updated'));
        } catch (err) {
            console.error('Failed to remove item');
        }
    };

    const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    return (
        <div className="min-h-screen bg-primary text-primary selection:bg-accent-primary/30 pb-32 cosmic-grid">
            <CustomerNavbar />

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div className="animate-slide-up">
                        <button
                            onClick={() => navigate('/shop')}
                            className="flex items-center gap-2 text-secondary hover:text-accent-primary mb-4 transition-all font-black uppercase tracking-widest text-[10px]"
                        >
                            <ArrowLeft className="w-4 h-4" /> Continue Shopping
                        </button>
                        <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">
                            Deployment <span className="text-accent-primary">Manifest</span>
                        </h1>
                        <p className="text-secondary mt-2 uppercase tracking-[0.2em] font-bold text-[10px]">Review your hardware selection for mission-critical operations.</p>
                    </div>
                    {cart.length > 0 && (
                        <div className="flex items-center gap-4 animate-fade-in">
                            <span className="text-secondary text-xs font-black uppercase tracking-widest">Active Units: {cart.length}</span>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-secondary font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Syncing Manifest...</p>
                    </div>
                ) : cart.length === 0 ? (
                    <div className="premium-card p-32 text-center flex flex-col items-center justify-center gap-10 bg-white/[0.02]">
                        <div className="w-40 h-40 rounded-full bg-white/5 border border-glass flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-accent-primary/10 rounded-full blur-[40px] animate-pulse" />
                            <ShoppingBag className="w-16 h-16 text-secondary opacity-20 relative z-10" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black italic uppercase italic tracking-tighter">Manifest Empty</h2>
                            <p className="text-secondary text-xs uppercase tracking-widest max-w-xs mx-auto">No hardware assets selected for deployment. Return to inventory to proceed.</p>
                        </div>
                        <button
                            onClick={() => navigate('/shop')}
                            className="btn-primary py-4 px-12 group"
                        >
                            <span className="flex items-center gap-3">
                                <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-black italic uppercase tracking-widest">Open Inventory</span>
                            </span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-6">
                            {cart.map((item, idx) => (
                                <div key={idx} className="premium-card p-8 group flex flex-col sm:flex-row gap-8 items-center border-glass hover:bg-white/[0.03] transition-all relative overflow-hidden">
                                    {/* Item ID/Tag */}
                                    <div className="absolute top-0 right-0 px-4 py-1.5 bg-accent-primary/5 border-b border-l border-glass text-[10px] font-black uppercase tracking-widest text-secondary rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                        ID-{item.productId?.slice(0, 8)}
                                    </div>

                                    <div className="w-32 h-32 bg-primary rounded-2xl overflow-hidden border border-glass shrink-0 p-1 group-hover:border-accent-primary transition-all">
                                        {item.imageUrls?.[0] ? (
                                            <img src={item.imageUrls[0]} className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center opacity-10"><Box className="w-10 h-10" /></div>
                                        )}
                                    </div>

                                    <div className="flex-grow space-y-4 text-center sm:text-left">
                                        <div className="space-y-1">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <h3 className="text-2xl font-black italic uppercase italic tracking-tighter text-primary truncate max-w-md">{item.title}</h3>
                                                <button
                                                    onClick={() => handleRemove(item.productId)}
                                                    className="p-3 rounded-xl bg-accent-danger/10 text-accent-danger hover:bg-accent-danger hover:text-white transition-all w-fit mx-auto sm:mx-0"
                                                    title="Eject Item"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-center sm:justify-start gap-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-secondary">{item.seller?.companyName || 'Verified Vendor'}</span>
                                                <span className="w-1 h-1 rounded-full bg-glass" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-accent-success">Standard Node</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 pt-4 border-t border-glass">
                                            <div className="flex items-center gap-4 bg-primary rounded-xl border border-glass p-1">
                                                <button className="p-2 rounded-lg hover:bg-white/5 text-secondary"><Minus className="w-4 h-4" /></button>
                                                <span className="w-10 text-center text-sm font-black italic">{item.quantity}</span>
                                                <button className="p-2 rounded-lg hover:bg-white/5 text-accent-primary"><Plus className="w-4 h-4" /></button>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-50 mb-1">Unit Valuation</p>
                                                <p className="text-3xl font-black text-accent-primary italic">
                                                    <span className="text-lg mr-1 opacity-50 not-italic">₹</span>
                                                    {(parseFloat(item.price) * item.quantity).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Deployment Summary */}
                        <div className="lg:col-span-1">
                            <div className="premium-card p-10 space-y-10 sticky top-32 bg-gradient-to-br from-white/[0.02] to-transparent border-accent-primary/20">
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black italic uppercase italic tracking-tighter">Manifest <span className="text-accent-primary">Total</span></h3>
                                    <div className="w-20 h-1 bg-accent-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-secondary">
                                        <span>Assets Value</span>
                                        <span className="text-primary tracking-tighter text-lg italic">₹{total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-secondary">
                                        <span>Node Logistics</span>
                                        <span className="text-accent-success italic">FREE DISPATCH</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-secondary">
                                        <span>System Tax</span>
                                        <span className="text-primary tracking-tighter text-lg italic">₹0</span>
                                    </div>

                                    <div className="pt-10 border-t border-glass space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-secondary">Total Deployment Cost</p>
                                        <div className="flex items-baseline justify-between pt-2">
                                            <span className="text-lg font-black italic text-accent-primary opacity-50 mr-2">INR</span>
                                            <span className="text-6xl font-black text-primary tracking-tighter italic shadow-text">₹{total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <button
                                        onClick={() => navigate('/shop/checkout')}
                                        className="w-full btn-primary py-6 flex items-center justify-center gap-4 group shadow-blue-500/20"
                                    >
                                        <Zap className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
                                        <span className="text-xl font-black italic uppercase tracking-widest">Execute Checkout</span>
                                    </button>

                                    <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-50">
                                        <ShieldCheck className="w-4 h-4 text-accent-success" />
                                        Secure Transaction Protocol v.82
                                    </div>
                                </div>

                                <div className="premium-card p-6 bg-accent-success/5 border-accent-success/20 flex gap-4 items-center">
                                    <ShieldCheck className="w-6 h-6 text-accent-success" />
                                    <div className="flex-1">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest">Safe Checkout Active</h4>
                                        <p className="text-[9px] font-bold text-secondary uppercase tracking-tight">End-to-end encryption enabled for this node.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .shadow-text {
                    text-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
                }
            ` }} />
        </div>
    );
};

export default CartPage;
