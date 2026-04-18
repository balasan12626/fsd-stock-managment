import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { productAPI } from '../services/api';
import {
    ArrowLeft,
    Zap,
    Edit3,
    DollarSign,
    Hash,
    Calendar,
    FileText,
    Target,
    AlertCircle,
    Package,
    Loader2,
    ShieldAlert
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
        category: product?.category || 'Processors',
        expiryDate: product?.expiryDate || '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const categories = ['Processors', 'Graphics Cards', 'Storage', 'Peripherals', 'Memory', 'Motherboards'];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.title || !formData.price || !formData.quantity) {
            setError('Please fill in all mandatory parameters.');
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
            setError(err.response?.data?.message || 'Update failed. Network unstable.');
        } finally {
            setLoading(false);
        }
    };

    if (!product) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center p-6">
                <div className="premium-card p-12 text-center max-w-sm border-accent-danger/20">
                    <ShieldAlert className="w-16 h-16 text-accent-danger mx-auto mb-6" />
                    <h2 className="text-2xl font-black italic tracking-tighter mb-4">Data Link Lost</h2>
                    <p className="text-secondary mb-8 text-xs font-bold uppercase tracking-widest">
                        Target unit parameters could not be retrieved.
                    </p>
                    <button
                        onClick={() => navigate('/sell/dashboard')}
                        className="btn-primary w-full"
                    >
                        Return to Control
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary text-primary selection:bg-accent-primary/30 cosmic-grid py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-10">
                {/* Top Navigation */}
                <button
                    onClick={() => navigate('/sell/dashboard')}
                    className="flex items-center gap-3 text-secondary hover:text-primary transition-colors font-bold group"
                >
                    <div className="p-2 rounded-xl bg-white/5 border border-glass group-hover:border-accent-primary transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    Abort Modification
                </button>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-5xl font-black tracking-tight uppercase italic">
                            Reconfigure <span className="text-accent-primary">Asset</span>
                        </h1>
                        <p className="text-secondary mt-2 uppercase tracking-widest text-[10px] font-black">
                            ID: {product.productId.slice(0, 12)}...
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent-secondary animate-pulse" />
                        <div className="w-2 h-2 rounded-full bg-accent-secondary animate-pulse" style={{ animationDelay: '0.2s' }} />
                    </div>
                </div>

                {error && (
                    <div className="premium-card p-6 border-accent-danger bg-accent-danger/5 flex items-center gap-4 animate-shake">
                        <AlertCircle className="w-6 h-6 text-accent-danger" />
                        <p className="font-bold text-accent-danger uppercase text-xs tracking-widest">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Core Data */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="premium-card p-10 space-y-8">
                            <div className="space-y-4">
                                <label className="text-xs font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-3">
                                    <Package className="w-4 h-4 text-accent-primary" />
                                    Unit Designation *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-6 py-4 bg-primary border border-glass rounded-2xl focus:border-accent-primary outline-none text-lg font-bold transition-all"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-accent-secondary" />
                                    Technical Manifest
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="5"
                                    className="w-full px-6 py-4 bg-primary border border-glass rounded-2xl focus:border-accent-secondary outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-3">
                                        <DollarSign className="w-4 h-4 text-accent-success" />
                                        Unit Value (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-6 py-4 bg-primary border border-glass rounded-2xl focus:border-accent-success outline-none font-black text-xl"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-3">
                                        <Hash className="w-4 h-4 text-accent-warning" />
                                        Loadout Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-6 py-4 bg-primary border border-glass rounded-2xl focus:border-accent-warning outline-none font-black text-xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Meta & Current Media */}
                    <div className="space-y-8">
                        <div className="premium-card p-8 space-y-6">
                            <div className="space-y-4">
                                <label className="text-xs font-black text-secondary uppercase tracking-widest">Classification</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-primary border border-glass rounded-xl outline-none focus:border-accent-primary font-bold text-sm"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-secondary uppercase tracking-widest">Expiration</label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-primary border border-glass rounded-xl outline-none focus:border-accent-primary font-bold text-sm"
                                />
                            </div>
                        </div>

                        {/* Current Visuals */}
                        {product.imageUrls && product.imageUrls.length > 0 && (
                            <div className="premium-card p-8 space-y-4">
                                <label className="text-xs font-black text-secondary uppercase tracking-widest flex items-center gap-2">
                                    <Target className="w-4 h-4 text-accent-primary" />
                                    Active Visuals
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {product.imageUrls.map((url, i) => (
                                        <div key={i} className="aspect-square rounded-xl border border-glass overflow-hidden bg-primary p-1">
                                            <img src={url} className="w-full h-full object-cover rounded-lg" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-5 flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Edit3 className="w-6 h-6" />}
                            <span className="text-lg font-black italic uppercase tracking-tighter">
                                {loading ? 'Syncing...' : 'Commit Changes'}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProduct;
