import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { productAPI } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import {
    ArrowLeft,
    Zap,
    Edit3,
    DollarSign,
    Hash,
    Calendar,
    FileText,
    Target,
    Hexagon,
    AlertCircle,
    Package
} from 'lucide-react';

const EditProduct = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const product = location.state?.product;

    const [formData, setFormData] = useState({
        productId: product?.productId || '',
        title: product?.title || '',
        description: product?.description || '',
        price: product?.price || '',
        quantity: product?.quantity || '',
        expiryDate: product?.expiryDate || '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.title || !formData.price || !formData.quantity) {
            setError('System Error: Mandatory parameters missing (Designation, Value, or Loadout)');
            return;
        }

        setLoading(true);
        try {
            const submissionData = {
                ...formData,
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity)
            };

            await productAPI.update(submissionData);
            navigate('/sell/dashboard');
        } catch (err) {
            console.error('Update Product Error:', err);
            setError(err.response?.data?.message || 'Update failed. Communication link unstable.');
        } finally {
            setLoading(false);
        }
    };

    if (!product) {
        return (
            <div className="min-h-screen cosmic-grid flex items-center justify-center p-6">
                <div className="glass-effect rounded-[2rem] p-12 text-center max-w-sm border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                    <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4 text-center">Data Link Lost</h2>
                    <p className="text-slate-500 mb-8 font-bold uppercase tracking-widest text-[10px] text-center">Target unit parameters could not be retrieved from the main console.</p>
                    <button
                        onClick={() => navigate('/sell/dashboard')}
                        className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black tracking-[0.2em] text-[10px] uppercase hover:bg-cyan-500 hover:text-slate-950 transition-all"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen cosmic-grid py-12 px-4 relative overflow-hidden">
            {/* Theme Toggle */}
            <div className="fixed top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            {/* Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, var(--accent-cyan) 0%, transparent 70%)', opacity: 0.1 }}></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, var(--accent-magenta) 0%, transparent 70%)', opacity: 0.1 }}></div>

            <div className="max-w-3xl mx-auto relative z-10">
                <button
                    onClick={() => navigate('/sell/dashboard')}
                    className="flex items-center gap-3 transition-all group px-4 py-2 rounded-xl border border-transparent hover:border-cyan-500/10" style={{ color: 'var(--text-muted)', background: 'transparent' }}
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold tracking-[0.2em] uppercase italic">Abort Modification</span>
                </button>

                <div className="octagon-card p-1 pb-1">
                    <div className="bg-[#0f172a] clip-path-inner p-8 md:p-12 relative overflow-hidden">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-white/5">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 glow-cyan">
                                    <Edit3 className="w-10 h-10 text-cyan-400" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                                        Modify <span className="text-cyan-400">Unit</span>
                                    </h1>
                                    <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase mt-1">Reconfiguring ID: {product.productId.slice(0, 8)}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-cyan-500 glow-cyan"></div>
                                <div className="w-3 h-3 rounded-full bg-magenta-500 glow-magenta"></div>
                                <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/5 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl mb-10 backdrop-blur-md animate-fade-in text-xs font-bold uppercase tracking-widest flex items-center gap-4">
                                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                <span>Core Error: {error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-10">
                            {/* Product Title */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3 italic">
                                    <Package className="w-4 h-4 text-cyan-500" />
                                    Unit Designation *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-6 py-5 bg-white/5 border border-white/10 text-white rounded-2xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-600 transition-all outline-none font-medium text-lg hover:bg-white/[0.07]"
                                    placeholder="Update unit name..."
                                />
                            </div>

                            {/* Description Field */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3 italic">
                                    <FileText className="w-4 h-4 text-magenta-500" />
                                    Unit Specifications
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-6 py-5 bg-white/5 border border-white/10 text-white rounded-2xl focus:ring-1 focus:ring-magenta-500 focus:border-magenta-500 placeholder-slate-600 transition-all outline-none font-medium hover:bg-white/[0.07] resize-none"
                                    placeholder="Re-write specifications data..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Price Field */}
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3 italic">
                                        <DollarSign className="w-4 h-4 text-cyan-500" />
                                        Unit Market Value (!) *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full px-6 py-5 bg-white/5 border border-white/10 text-white rounded-2xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-600 transition-all outline-none font-bold text-xl hover:bg-white/[0.07]"
                                            placeholder="0.00"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-slate-900 border border-white/10 rounded-xl glow-cyan">
                                            <Calendar className="w-5 h-5 text-cyan-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Quantity Field */}
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3 italic">
                                        <Hash className="w-4 h-4 text-magenta-500" />
                                        Unit Quantity Loadout *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            className="w-full px-6 py-5 bg-white/5 border border-white/10 text-white rounded-2xl focus:ring-1 focus:ring-magenta-500 focus:border-magenta-500 placeholder-slate-600 transition-all outline-none font-bold text-xl hover:bg-white/[0.07]"
                                            placeholder="0"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                            <Zap className="w-5 h-5 text-magenta-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expiry Date */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3 italic">
                                    <Calendar className="w-4 h-4 text-cyan-500" />
                                    Expiration Timestamp
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleChange}
                                        className="w-full px-6 py-5 bg-white/5 border border-white/10 text-white rounded-2xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none cursor-pointer hover:bg-white/[0.07] appearance-none"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <Hexagon className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            {/* Current Images Display */}
                            {product.imageUrls && product.imageUrls.length > 0 && (
                                <div className="space-y-6">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3 italic">
                                        <Target className="w-4 h-4 text-magenta-500" />
                                        Active Visual Units
                                    </label>
                                    <div className="grid grid-cols-5 gap-4 animate-fade-in">
                                        {product.imageUrls.map((url, index) => (
                                            <div key={index} className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 group/img">
                                                <img src={url} alt="Unit" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-cyan-500/10 opacity-60"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Update Button */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full relative py-6 group overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-magenta-600 rounded-3xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="absolute inset-0 animate-shimmer"></div>

                                    <span className="relative flex items-center justify-center gap-4">
                                        {loading ? (
                                            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <Zap className="w-6 h-6 text-white" />
                                        )}
                                        <span className="text-white font-black text-xl italic tracking-tighter uppercase">
                                            {loading ? 'Reconfiguring...' : 'Commit Modifications'}
                                        </span>
                                    </span>
                                </button>
                                <p className="text-center text-[10px] font-bold text-slate-600 tracking-[0.4em] uppercase mt-6">Secure Sync Protocol Active</p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .clip-path-inner {
                    clip-path: polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px);
                }
                .octagon-card {
                    clip-path: polygon(15px 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0 calc(100% - 15px), 0 15px);
                    background: linear-gradient(135deg, rgba(34, 211, 238, 0.4), rgba(217, 70, 239, 0.4));
                }
            `}} />
        </div>
    );
};

export default EditProduct;
