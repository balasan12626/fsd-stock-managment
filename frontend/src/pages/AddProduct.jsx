import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
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
    AlertCircle,
    Loader2,
    Upload,
    ChevronRight,
    Search
} from 'lucide-react';

const AddProduct = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        quantity: '',
        category: 'Processors',
        expiryDate: '',
    });
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const categories = ['Processors', 'Graphics Cards', 'Storage', 'Peripherals', 'Memory', 'Motherboards'];

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
                    Back to Control Center
                </button>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-5xl font-black tracking-tight uppercase italic">
                            Deploy <span className="text-accent-primary">New Unit</span>
                        </h1>
                        <p className="text-secondary mt-2">Initialize new hardware asset into the global inventory.</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
                        <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
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
                            {/* Designation */}
                            <div className="space-y-4">
                                <label className="text-xs font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-3">
                                    <Target className="w-4 h-4 text-accent-primary" />
                                    System Designation *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-6 py-4 bg-primary border border-glass rounded-2xl focus:border-accent-primary outline-none text-lg font-bold transition-all"
                                    placeholder="e.g., Quantum X-8 Processor"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-4">
                                <label className="text-xs font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-accent-secondary" />
                                    Technical Specs
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="5"
                                    className="w-full px-6 py-4 bg-primary border border-glass rounded-2xl focus:border-accent-secondary outline-none transition-all resize-none"
                                    placeholder="Detailed technical specifications and condition..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Price */}
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-3">
                                        <DollarSign className="w-4 h-4 text-accent-success" />
                                        Market Value (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-6 py-4 bg-primary border border-glass rounded-2xl focus:border-accent-success outline-none font-black text-xl"
                                        placeholder="0.00"
                                    />
                                </div>

                                {/* Stock */}
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-3">
                                        <Hash className="w-4 h-4 text-accent-warning" />
                                        Unit Capacity *
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-6 py-4 bg-primary border border-glass rounded-2xl focus:border-accent-warning outline-none font-black text-xl"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Meta & Media */}
                    <div className="space-y-8">
                        {/* Meta Info */}
                        <div className="premium-card p-8 space-y-6">
                            <div className="space-y-4">
                                <label className="text-xs font-black text-secondary uppercase tracking-widest">Classification</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-primary border border-glass rounded-xl outline-none focus:border-accent-primary font-bold text-sm cursor-pointer"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-secondary uppercase tracking-widest">Warranty Expire</label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-primary border border-glass rounded-xl outline-none focus:border-accent-primary font-bold text-sm"
                                />
                            </div>
                        </div>

                        {/* Media Upload */}
                        <div className="premium-card p-8 space-y-6">
                            <label className="text-xs font-black text-secondary uppercase tracking-widest">Visual Assets</label>

                            <label className="flex flex-col items-center justify-center gap-4 py-10 rounded-2xl border-2 border-dashed border-glass hover:border-accent-primary hover:bg-accent-primary/5 transition-all cursor-pointer group">
                                <div className="p-3 bg-white/5 border border-glass rounded-xl group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6 text-accent-primary" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-secondary group-hover:text-primary">Upload Media</span>
                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>

                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-3 gap-3">
                                    {imagePreviews.map((p, i) => (
                                        <div key={i} className="aspect-square rounded-lg border border-glass overflow-hidden">
                                            <img src={p} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Action */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-5 flex items-center justify-center gap-3 relative overflow-hidden group shadow-xl shadow-blue-500/20"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
                            <span className="text-lg font-black italic uppercase tracking-tighter">
                                {loading ? 'Initializing...' : 'Deploy Asset'}
                            </span>
                            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        </button>
                    </div>
                </form>

                <p className="text-center text-[10px] font-bold text-secondary uppercase tracking-[0.4em]">
                    Encrypted Asset Deployment Protocol v1.4.2
                </p>
            </div>
        </div>
    );
};

export default AddProduct;
