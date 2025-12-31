import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import {
    ArrowLeft,
    Zap,

    PlusSquare,
    DollarSign,
    Hash,
    Calendar,
    FileText,
    Image as ImageIcon,
    FolderOpen,
    Target,
    Hexagon,
    AlertCircle
} from 'lucide-react';

const AddProduct = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        quantity: '',
        expiryDate: '',
    });
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }
        const validFiles = files.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                setError('Each image must be less than 5MB');
                return false;
            }
            return true;
        });
        setImages(validFiles);
        setImagePreviews(validFiles.map(file => URL.createObjectURL(file)));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.title || !formData.price || !formData.quantity) {
            setError('Please fill in all required fields (Title, Price, and Quantity)');
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            const submissionData = {
                ...formData,
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity)
            };

            Object.keys(submissionData).forEach(key => {
                if (submissionData[key]) data.append(key, submissionData[key]);
            });
            images.forEach(image => data.append('images', image));

            await productAPI.add(data);
            navigate('/sell/dashboard');
        } catch (err) {
            console.error('Add Product Error:', err);
            setError(err.response?.data?.message || 'Failed to add product. Please check all fields.');
        } finally {
            setLoading(false);
        }
    };

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
                    <span className="text-xs font-bold tracking-[0.2em] uppercase italic">Return to Base</span>
                </button>

                <div className="octagon-card p-1 pb-1">
                    <div className="bg-[#0f172a] clip-path-inner p-8 md:p-12 relative overflow-hidden">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-white/5">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 glow-cyan">
                                    <Target className="w-10 h-10 text-cyan-400" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                                        Deploy <span className="text-cyan-400">Unit</span>
                                    </h1>
                                    <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase mt-1">Product Manifest</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-cyan-500 glow-cyan"></div>
                                <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                                <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/5 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl mb-10 backdrop-blur-md animate-fade-in text-xs font-bold uppercase tracking-widest flex items-center gap-4">
                                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                <span>System Warning: {error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-10">
                            {/* Product Title */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <PlusSquare className="w-4 h-4 text-cyan-500" />
                                    Designation Name *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-6 py-5 bg-white/5 border border-white/10 text-white rounded-2xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-600 transition-all outline-none font-medium text-lg hover:bg-white/[0.07]"
                                    placeholder="Enter system designation..."
                                />
                            </div>

                            {/* Description Field */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-magenta-500" />
                                    Data Logs (Description)
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-6 py-5 bg-white/5 border border-white/10 text-white rounded-2xl focus:ring-1 focus:ring-magenta-500 focus:border-magenta-500 placeholder-slate-600 transition-all outline-none font-medium hover:bg-white/[0.07] resize-none"
                                    placeholder="Input unit data logs..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Price Field */}
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <DollarSign className="w-4 h-4 text-cyan-500" />
                                        Unit Value (!) *
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
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <Hash className="w-4 h-4 text-magenta-500" />
                                        Stock Loadout *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            required
                                            min="1"
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
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-cyan-500" />
                                    Expiration Timestamp
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={formData.expiryDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                                        className="w-full px-6 py-5 bg-white/5 border border-white/10 text-white rounded-2xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none cursor-pointer hover:bg-white/[0.07] appearance-none"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <Hexagon className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            {/* Images Section */}
                            <div className="space-y-6">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <ImageIcon className="w-4 h-4 text-magenta-500" />
                                    Visual Schematics (Max 5)
                                </label>

                                <label className="flex flex-col items-center justify-center gap-4 py-12 bg-white/5 border-2 border-dashed border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/5 rounded-3xl cursor-pointer transition-all active:scale-95 group">
                                    <div className="p-4 bg-slate-900 border border-white/10 rounded-2xl group-hover:scale-110 transition-transform">
                                        <FolderOpen className="w-8 h-8 text-cyan-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-bold text-sm tracking-widest uppercase">Select Media Units</p>
                                        <p className="text-slate-500 text-[10px] mt-1 font-medium">{images.length > 0 ? `${images.length} Units Loaded` : 'DRAG & DROP READY'}</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>

                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-5 gap-4 mt-6 animate-fade-in">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 group/img">
                                                <img src={preview} alt="Unit" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-cyan-500/20 opacity-0 group-hover/img:opacity-100 transition-opacity"></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Deploy Button */}
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
                                            {loading ? 'Processing...' : 'Deploy Manifest'}
                                        </span>
                                    </span>
                                </button>
                                <p className="text-center text-[10px] font-bold text-slate-600 tracking-[0.4em] uppercase mt-6">Secure Transaction Protocol-88X Enabled</p>
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
            `}} />
        </div>
    );
};

export default AddProduct;
