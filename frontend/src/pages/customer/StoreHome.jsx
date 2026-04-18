import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { customerAPI } from '../../services/api';
import CustomerNavbar from '../../components/CustomerNavbar';
import LiveStatsBanner from '../../components/LiveStatsBanner';
import ComparisonOverlay from '../../components/ComparisonOverlay';
import {
    Package,
    ArrowRight,
    Trophy,
    Star,
    ChevronRight,
    Zap,
    ShieldCheck,
    Truck,
    ArrowUpRight,
    Search,
    Filter,
    CheckCircle,
    X,
    ChevronDown,
    Layers
} from 'lucide-react';

const StoreHome = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [comparisonItems, setComparisonItems] = useState([]);

    const toggleComparison = (product) => {
        setComparisonItems(prev => {
            const exists = prev.find(p => p.productId === product.productId);
            if (exists) return prev.filter(p => p.productId !== product.productId);
            if (prev.length >= 4) return prev;
            return [...prev, product];
        });
    };
    const searchQuery = searchParams.get('search') || '';

    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await customerAPI.getProducts();
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // BUG FIX #4: Filter products based on both category AND search query from URL
    const filteredProducts = products.filter(p => {
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
        const matchesSearch = !searchQuery ||
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const newArrivals = products.slice(0, 5);

    useEffect(() => {
        if (newArrivals.length > 0) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % newArrivals.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [newArrivals.length]);

    const categories = ['All', 'Processors', 'Graphics Cards', 'Storage', 'Peripherals'];

    return (
        <div className="min-h-screen bg-primary text-primary selection:bg-accent-primary/30 cosmic-grid">
            <CustomerNavbar />
            <LiveStatsBanner />


            {/* Hero Section - High Performance Design */}
            <div className="relative pt-20 pb-32 overflow-hidden border-b border-glass">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-primary/10 rounded-full blur-[120px] -z-10 animate-pulse-slow" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-secondary/10 rounded-full blur-[120px] -z-10 animate-pulse-slow" style={{ animationDelay: '2s' }} />

                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 animate-slide-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-glass text-accent-primary text-xs font-black tracking-widest uppercase">
                            <Zap className="w-4 h-4" />
                            Next-Gen Hardware Hub
                        </div>
                        <h1 className="text-7xl md:text-8xl font-black tracking-tight italic leading-none uppercase">
                            Push Your <br />
                            <span className="bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                                Potential.
                            </span>
                        </h1>
                        <p className="text-secondary text-xl max-w-xl leading-relaxed">
                            Discover high-performance components and hardware from verified global sellers.
                            Built for professionals, gamers, and visionaries.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <button
                                onClick={() => document.getElementById('inventory').scrollIntoView({ behavior: 'smooth' })}
                                className="btn-primary px-10"
                            >
                                Shop Inventory
                            </button>
                            <button
                                onClick={() => document.getElementById('new-arrivals').scrollIntoView({ behavior: 'smooth' })}
                                className="px-8 py-4 rounded-2xl bg-white/5 border border-glass hover:bg-white/10 text-primary font-bold transition-all flex items-center gap-2"
                            >
                                New Arrivals
                                <ArrowUpRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* New Arrivals Carousel (Static in Hero, Slides on Right) */}
                    <div className="relative animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <div className="relative h-[450px] w-full max-w-md mx-auto group">
                            {/* Live Shadow Effect Container */}
                            <div className="absolute -inset-4 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700 rounded-[3rem]" />

                            <div className="relative h-full w-full premium-card overflow-hidden border border-glass p-1">
                                <div className="absolute inset-0 bg-primary/40 backdrop-blur-3xl" />

                                {newArrivals.length > 0 ? (
                                    <div className="relative h-full w-full">
                                        {newArrivals.map((product, index) => (
                                            <div
                                                key={product.productId}
                                                className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${index === currentSlide ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-full scale-95'}`}
                                            >
                                                <div className="h-full w-full flex flex-col p-8">
                                                    <div className="flex-1 flex items-center justify-center p-4">
                                                        {product.imageUrls?.[0] ? (
                                                            <img
                                                                src={product.imageUrls[0]}
                                                                alt={product.title}
                                                                className="max-h-full max-w-full object-contain drop-shadow-[0_20px_50px_rgba(59,130,246,0.3)]"
                                                            />
                                                        ) : (
                                                            <Package className="w-32 h-32 text-accent-primary/20" />
                                                        )}
                                                    </div>

                                                    <div className="mt-6 space-y-3 relative z-10">
                                                        <div className="flex items-center justify-between">
                                                            <span className="px-3 py-1 rounded-lg bg-accent-primary/20 border border-accent-primary/30 text-accent-primary text-[10px] font-black uppercase tracking-widest">
                                                                New Arrival
                                                            </span>
                                                            <span className="text-accent-primary font-black">₹{product.price?.toLocaleString()}</span>
                                                        </div>
                                                        <h3 className="text-2xl font-black italic uppercase tracking-tight line-clamp-1">{product.title}</h3>
                                                        <button
                                                            onClick={() => navigate(`/shop/product/${product.productId}`)}
                                                            className="w-full py-4 rounded-xl bg-white/5 border border-glass hover:bg-accent-primary text-white text-xs font-black tracking-widest uppercase transition-all"
                                                        >
                                                            Inspect Build
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Carousel Controls */}
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                                            {newArrivals.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentSlide(i)}
                                                    className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-8 bg-accent-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                                                />
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => setCurrentSlide((prev) => (prev - 1 + newArrivals.length) % newArrivals.length)}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-glass flex items-center justify-center text-white/40 hover:text-white hover:bg-accent-primary/40 transition-all opacity-0 group-hover:opacity-100 z-30"
                                        >
                                            <ChevronRight className="w-5 h-5 rotate-180" />
                                        </button>
                                        <button
                                            onClick={() => setCurrentSlide((prev) => (prev + 1) % newArrivals.length)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-glass flex items-center justify-center text-white/40 hover:text-white hover:bg-accent-primary/40 transition-all opacity-0 group-hover:opacity-100 z-30"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <div className="animate-spin w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full" />
                                    </div>
                                )}
                            </div>

                            {/* Floating Badge */}
                            <div className="absolute -bottom-6 -right-6 px-6 py-4 premium-card border-accent-primary animate-float z-40">
                                <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">Status</p>
                                <p className="text-lg font-black flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-accent-success animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    Sync Live
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Bar */}
            <div className="max-w-7xl mx-auto px-6 -mt-10 mb-20 relative z-20">
                <div className="premium-card grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-glass">
                    {[
                        { icon: <ShieldCheck className="w-8 h-8 text-accent-success" />, title: 'Verified Sellers', desc: 'Secure payment & escrow' },
                        { icon: <Truck className="w-8 h-8 text-accent-primary" />, title: 'Rapid Tech Logistics', desc: 'Same-day node dispatch' },
                        { icon: <Zap className="w-8 h-8 text-accent-warning" />, title: 'AI Optimized Price', desc: 'Real-time market tracking' },
                    ].map((feat, i) => (
                        <div key={i} className="p-8 flex items-center gap-6 hover:bg-white/[0.02] transition-colors">
                            {feat.icon}
                            <div>
                                <h4 className="font-bold">{feat.title}</h4>
                                <p className="text-secondary text-sm">{feat.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Success Stories Section */}
            <div className="max-w-7xl mx-auto px-6 mb-32">
                <div className="flex flex-col items-center text-center gap-4 mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <Trophy className="w-3 h-3" />
                        Hall of Tech
                    </div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter">Success <span className="text-accent-primary">Synchronizations</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { name: "Srinivasa T.", role: "High-Volume Seller", story: "Increased GPU sales by 3x after syncing with TechVibe's AI inventory alerts.", stat: "₹2.4L Revenue", rating: 5 },
                        { name: "Rahul M.", role: "Hardware Enthusiast", story: "Found rare RTX units at market price. The verification system is a game-changer.", stat: "12 Components", rating: 5 },
                        { name: "Global Tech Inc.", role: "B2B Partner", story: "The Admin dashboard gives us unparalleled visibility into our distributed hardware nodes.", stat: "99% Fulfillment", rating: 5 }
                    ].map((story, i) => (
                        <div key={i} className="premium-card p-10 space-y-6 relative overflow-hidden group hover:border-accent-primary/30 transition-all">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-accent-primary/10 transition-all" />
                             <div className="flex gap-1">
                                {[...Array(story.rating)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-500 fill-current" />)}
                             </div>
                             <p className="text-lg font-bold italic text-primary leading-relaxed">"{story.story}"</p>
                             <div className="pt-6 border-t border-glass flex items-center justify-between">
                                <div>
                                    <h4 className="font-black uppercase tracking-tight text-sm">{story.name}</h4>
                                    <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">{story.role}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-accent-primary uppercase tracking-widest leading-none">Status</p>
                                    <p className="text-xs font-bold text-white mt-1">{story.stat}</p>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feature Comparison Table */}
            <div className="max-w-5xl mx-auto px-6 mb-32">
                <div className="premium-card overflow-hidden border-glass">
                    <div className="p-8 bg-white/5 border-b border-glass text-center">
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter">Portal <span className="text-accent-primary">Capabilities</span></h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/[0.02]">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Capability</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-accent-success text-center">Customer</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-accent-primary text-center">Seller</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-accent-secondary text-center">Admin</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-glass">
                                {[
                                    { f: "Hardware Discovery", c: true, s: true, a: true },
                                    { f: "Unit Acquisition", c: true, s: false, a: false },
                                    { f: "Inventory Deployment", c: false, s: true, a: true },
                                    { f: "Real-time Analytics", c: false, s: true, a: true },
                                    { f: "AI Demand Forecast", c: false, s: true, a: true },
                                    { f: "Global System Control", c: false, s: false, a: true },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                                        <td className="px-8 py-5 font-bold text-sm text-secondary italic">{row.f}</td>
                                        <td className="px-8 py-5 text-center">{row.c ? <CheckCircle className="w-5 h-5 text-accent-success mx-auto" /> : <X className="w-5 h-5 text-slate-700 mx-auto" />}</td>
                                        <td className="px-8 py-5 text-center">{row.s ? <CheckCircle className="w-5 h-5 text-accent-primary mx-auto" /> : <X className="w-5 h-5 text-slate-700 mx-auto" />}</td>
                                        <td className="px-8 py-5 text-center">{row.a ? <CheckCircle className="w-5 h-5 text-accent-secondary mx-auto" /> : <X className="w-5 h-5 text-slate-700 mx-auto" />}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* New Arrivals Section - Multi-item Carousel */}
            <div id="new-arrivals" className="max-w-7xl mx-auto px-6 mb-32 group">
                <div className="flex items-center justify-between mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-[2px] bg-accent-primary" />
                            <span className="text-accent-primary text-[10px] font-black uppercase tracking-[0.3em]">Fresh Synchronizations</span>
                        </div>
                        <h2 className="text-4xl font-black italic uppercase tracking-tight">New Deployments</h2>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                const container = document.getElementById('arrivals-scroll');
                                container.scrollBy({ left: -400, behavior: 'smooth' });
                            }}
                            className="w-14 h-14 rounded-2xl bg-white/5 border border-glass hover:bg-white/10 flex items-center justify-center transition-all active:scale-90"
                        >
                            <ChevronRight className="w-6 h-6 rotate-180" />
                        </button>
                        <button
                            onClick={() => {
                                const container = document.getElementById('arrivals-scroll');
                                container.scrollBy({ left: 400, behavior: 'smooth' });
                            }}
                            className="w-14 h-14 rounded-2xl bg-white/5 border border-glass hover:bg-white/10 flex items-center justify-center transition-all active:scale-90"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div
                    id="arrivals-scroll"
                    className="flex gap-8 overflow-x-auto pb-12 hide-scrollbar snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {products.slice(0, 8).map((product) => (
                        <div
                            key={`new- ${product.productId} `}
                            className="min-w-[300px] md:min-w-[350px] snap-start"
                        >
                            <div className="premium-card p-6 h-full border border-glass group/card hover:border-accent-primary/50 relative overflow-hidden">
                                {/* Glow Effect on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />

                                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-primary mb-6 border border-glass relative">
                                    {product.imageUrls?.[0] ? (
                                        <img
                                            src={product.imageUrls[0]}
                                            alt={product.title}
                                            className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-12 h-12 text-secondary/20" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <div className="px-2 py-1 rounded-md bg-accent-success text-white text-[8px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20">
                                            LIVE NOW
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-black italic uppercase leading-none line-clamp-2 min-h-[2.5rem] group-hover/card:text-accent-primary transition-colors">
                                            {product.title}
                                        </h3>
                                        <div className="text-xl font-black text-accent-primary">₹{product.price?.toLocaleString()}</div>
                                    </div>

                                    <p className="text-secondary text-xs line-clamp-2 font-medium">
                                        {product.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-glass">
                                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest italic">{product.category}</span>
                                        <button
                                            onClick={() => navigate(`/shop/product/${product.productId}`)}
                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent-primary hover:gap-4 transition-all"
                                        >
                                            View Details
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div id="inventory" className="max-w-7xl mx-auto px-6 mb-32">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <h2 className="text-4xl font-black tracking-tight uppercase italic flex items-center gap-4">
                            <div className="w-2 h-10 bg-accent-primary rounded-full" />
                            Hardware Inventory
                        </h2>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all border ${activeCategory === cat
                                    ? 'bg-accent-primary text-white border-accent-primary shadow-lg shadow-blue-500/20'
                                    : 'bg-white/5 border-glass text-secondary hover:text-primary hover:bg-white/10'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-secondary font-bold uppercase tracking-widest text-xs animate-pulse">Scanning Global Nodes...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="premium-card p-32 text-center border-dashed border-2 flex flex-col items-center gap-6">
                        <Package className="w-16 h-16 text-secondary/20" />
                        <div>
                            <h3 className="text-2xl font-bold">No hardware units found</h3>
                            <p className="text-secondary">Try searching for different items.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredProducts.map(product => (
                            <div
                                key={product.productId}
                                className="premium-card p-4 group flex flex-col h-full hover:-translate-y-2 transition-transform duration-500"
                            >
                                {/* Image Container */}
                                <div className="aspect-square bg-primary rounded-2xl mb-6 overflow-hidden relative border border-glass">
                                    {product.imageUrls?.[0] ? (
                                        <img
                                            src={product.imageUrls[0]}
                                            alt={product.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-secondary/30">
                                            <Package className="w-16 h-16" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-sm shadow-xl">
                                        ₹{product.price?.toLocaleString()}
                                    </div>
                                    <div className="absolute bottom-4 left-4">
                                        <span className="px-2.5 py-1 rounded-lg bg-accent-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/40">
                                            {product.category || 'Gear'}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 px-2 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-white/5 border border-glass flex items-center justify-center text-[10px] uppercase font-bold text-accent-primary">
                                            {product.seller?.companyName?.[0] || 'S'}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary group-hover:text-accent-primary transition-colors">
                                            {product.seller?.companyName || 'Verified Partner'}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-black leading-tight line-clamp-2 min-h-[3rem] group-hover:text-accent-primary transition-colors">
                                        {product.title}
                                    </h3>

                                    <div className="flex items-center justify-between pt-4 mt-auto">
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={() => toggleComparison(product)}
                                                className={`p-2.5 rounded-xl border border-glass transition-all ${
                                                    comparisonItems.find(i => i.productId === product.productId) 
                                                        ? 'bg-accent-primary text-white border-accent-primary' 
                                                        : 'bg-white/5 text-slate-500 hover:text-white'
                                                }`}
                                            >
                                                <Layers className="w-5 h-5" />
                                            </button>
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-3 h-3 ${i < (product.rating || 4) ? 'text-accent-warning fill-current' : 'text-white/10'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-bold text-secondary">{product.rating || (4.0 + (product.productId.charCodeAt(0) % 10) / 10).toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/shop/product/${product.productId}`)}
                                            className="w-12 h-12 rounded-2xl bg-white/5 border border-glass hover:bg-accent-primary hover:text-white flex items-center justify-center text-primary transition-all group-hover:shadow-lg group-hover:shadow-blue-500/20"
                                        >
                                            <ArrowRight className="w-6 h-6" />
                                        </button>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FAQ Accordion Section */}
            <div className="max-w-4xl mx-auto px-6 mb-32">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter">System <span className="text-accent-primary">Intelligence</span> (FAQ)</h2>
                    <p className="text-secondary mt-2">Common queries from the hardware synchronization network.</p>
                </div>

                <div className="space-y-4">
                    {[
                        { q: "What is TechVibe (a6b Stock)?", a: "TechVibe is an AI-powered next-generation hardware marketplace that connects professional sellers with enthusiasts, gamers, and industry experts." },
                        { q: "How do I become a verified seller?", a: "Register via the /sell portal and submit your business credentials. Our admin node will verify your status within 24-48 hours." },
                        { q: "Is the AI Prediction Engine accurate?", a: "Our AI analysis core uses historical market data and trend seasonality to provide forecasting with approximately 85-92% historical accuracy." },
                        { q: "What payment methods are supported?", a: "We support all major secure digital transactions, including UPI, Credit/Debit cards, and secure Escrow services for large-scale hardware deployments." },
                    ].map((item, i) => (
                        <details key={i} className="premium-card group border-glass">
                            <summary className="px-8 py-6 cursor-pointer list-none flex justify-between items-center bg-white/[0.02] hover:bg-white/[0.04] transition-colors font-bold text-sm uppercase tracking-widest text-primary">
                                {item.q}
                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-glass flex items-center justify-center group-open:rotate-180 transition-transform">
                                    <ChevronDown className="w-4 h-4 text-accent-primary" />
                                </div>
                            </summary>
                            <div className="px-8 py-8 text-secondary text-sm leading-relaxed border-t border-glass bg-black/20">
                                {item.a}
                            </div>
                        </details>
                    ))}
                </div>
            </div>

            {/* Newsletter / CTA Section */}
            <div className="max-w-7xl mx-auto px-6 mb-32">
                <div className="premium-card p-12 md:p-20 relative overflow-hidden bg-gradient-to-br from-accent-primary/20 via-transparent to-accent-secondary/10">
                    <div className="max-w-2xl relative z-10 space-y-8">
                        <h2 className="text-5xl font-black italic uppercase leading-none tracking-tight">
                            Join the hardware <br />
                            <span className="text-accent-primary">Revolution.</span>
                        </h2>
                        <p className="text-secondary text-lg">
                            Get early access to restocks, exclusive hardware drops, and AI-curated tech insights.
                            Zero spam, pure signal.
                        </p>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const emailInput = e.target.email.value.trim();

                                // Strict Email Regex (Security)
                                const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

                                if (!emailInput || !emailPattern.test(emailInput)) {
                                    alert('SECURITY ALERT: Invalid email format detected. Please enter a valid address.');
                                    return;
                                }

                                // Sanitize for XSS (Simulated)
                                const sanitizedEmail = emailInput.replace(/[<>]/g, '');

                                console.log(`[NEWSLETTER] Subscribing sanitized unit: ${sanitizedEmail}`);
                                alert('Welcome to the a6b Pulse! Your terminal is now synchronized with our hardware alerts.');
                                e.target.reset();
                            }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email address"
                                className="px-6 py-4 rounded-2xl bg-white/5 border border-glass flex-1 outline-none focus:border-accent-primary transition-all text-white"
                                required
                            />
                            <button type="submit" className="btn-primary whitespace-nowrap">Join Pulse</button>
                        </form>
                    </div>
                    <div className="absolute right-[-10%] top-[-10%] w-[40%] h-[120%] bg-accent-primary/5 rounded-full blur-[100px] -z-10 rotate-12" />
                </div>
            </div>
            
            <ComparisonOverlay 
                selectedProducts={comparisonItems}
                onRemove={(id) => setComparisonItems(prev => prev.filter(p => p.productId !== id))}
                onClear={() => setComparisonItems([])}
            />
        </div>
    );
};


export default StoreHome;
