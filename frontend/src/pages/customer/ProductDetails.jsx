import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { customerAPI, publicAPI } from '../../services/api';
import CustomerNavbar from '../../components/CustomerNavbar';
import { useAuth } from '../../context/AuthContext';
import {
    ShoppingCart,
    Zap,
    Star,
    ShieldCheck,
    Box,
    User,
    ArrowLeft,
    MessageSquare,
    ChevronRight,
    TrendingUp,
    CheckCircle2,
    Truck,
    Package,
    Heart,
    Share2,
    Sparkles,
    Trash2,
    Edit3,
    Send,
    X,
    AlertTriangle
} from 'lucide-react';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [activeImage, setActiveImage] = useState(0);

    // Reviews State
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState({ avg: 0, count: 0 });
    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState(5);
    const [postingReview, setPostingReview] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

    // Edit Mode State
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [editRating, setEditRating] = useState(5);

    useEffect(() => {
        fetchDetails();
        fetchReviews();
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        const loadPageData = async () => {
            setLoading(true);
            try {
                const res = await customerAPI.getProductDetails(id); // Changed productId to id
                setProduct(res.data);

                // Fetch AI Recommendations
                const recRes = await publicAPI.getRecommendations(id, res.data.category); // Changed productId to id
                setRecommendations(recRes.data.recommendations || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadPageData();
    }, [id]); // Changed productId to id

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const res = await customerAPI.getProductDetails(id);
            setProduct(res.data);

            // Fetch Related Products (Simulated AI Recommendation) - This part is now handled by the new useEffect for recommendations
            // The original instruction implies removing this, but the provided snippet only adds a new useEffect.
            // For now, I'll keep it as the instruction didn't explicitly say to remove it, but the new useEffect will likely make it redundant.
            const allRes = await customerAPI.getProducts();
            const related = allRes.data
                .filter(p => p.productId !== id && (p.category === res.data.category || !res.data.category))
                .slice(0, 4);
            setRelatedProducts(related);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await customerAPI.reviews.get(id);
            setReviews(res.data);

            if (res.data.length > 0) {
                const total = res.data.reduce((acc, r) => acc + r.rating, 0);
                setReviewStats({
                    avg: (total / res.data.length).toFixed(1),
                    count: res.data.length
                });
            } else {
                setReviewStats({ avg: 0, count: 0 });
            }
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
            showStatus('Intelligence node offline: Failed to fetch logs', 'error');
        }
    };

    const showStatus = (text, type = 'success') => {
        setStatusMessage({ text, type });
        setTimeout(() => setStatusMessage({ text: '', type: '' }), 4000);
    };

    const handleAddToCart = async (goToCart = false) => {
        if (!isAuthenticated()) {
            console.warn('[AUTH] Anonymous user attempted to add to cart. Redirecting to login.');
            navigate('/shop/login', { state: { from: location.pathname } });
            return;
        }

        setAdding(true);
        try {
            await customerAPI.cart.add(product, 1);
            window.dispatchEvent(new CustomEvent('cart-updated'));
            showStatus('Asset added to cart manifest');
            if (goToCart) navigate('/shop/cart');
        } catch (err) {
            console.error(err);
            if (err.response?.status !== 401) {
                showStatus('Failed to sync with cart node', 'error');
            }
        } finally {
            setAdding(false);
        }
    };

    const handlePostReview = async (e) => {
        e.preventDefault();
        if (!isAuthenticated()) {
            navigate('/shop/login');
            return;
        }
        if (!newComment.trim()) return;
        setPostingReview(true);
        try {
            await customerAPI.reviews.add(id, { comment: newComment, rating: newRating });
            setNewComment('');
            setNewRating(5);
            fetchReviews();
            showStatus('Log Manifest Synchronized Successfully');
        } catch (err) {
            console.error('Post Review Error:', err);
            const errMsg = err.response?.data?.message || err.message || 'uplink failure';
            const details = err.response ? ` [Status: ${err.response.status}]` : ' [No Response]';
            showStatus(`${errMsg}${details}`, 'error');
        } finally {
            setPostingReview(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Eject this log manifest entry?')) return;
        try {
            await customerAPI.reviews.delete(id, reviewId);
            fetchReviews();
        } catch (err) {
            console.error('Delete Error:', err);
        }
    };

    const startEditing = (rev) => {
        setEditingReviewId(rev.reviewId);
        setEditContent(rev.comment);
        setEditRating(rev.rating);
    };

    const handleUpdateReview = async () => {
        try {
            await customerAPI.reviews.update(id, editingReviewId, { comment: editContent, rating: editRating });
            setEditingReviewId(null);
            fetchReviews();
        } catch (err) {
            console.error('Update Error:', err);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-primary flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-secondary font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Syncing Unit Data...</p>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen bg-primary text-primary flex items-center justify-center font-black uppercase italic tracking-tighter text-4xl">
            Asset Not Found
        </div>
    );

    return (
        <div className="min-h-screen bg-primary text-primary selection:bg-accent-primary/30 pb-32 cosmic-grid">
            <CustomerNavbar />

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

            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Breadcrumbs / Back */}
                <button
                    onClick={() => navigate('/shop')}
                    className="flex items-center gap-3 text-secondary hover:text-accent-primary mb-12 transition-all font-black uppercase tracking-widest text-[10px] group"
                >
                    <div className="p-2 rounded-xl bg-white/5 border border-glass group-hover:border-accent-primary group-hover:-translate-x-1 transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Back to Inventory
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32 items-start text-left">
                    {/* Visual Interface */}
                    <div className="space-y-8 sticky top-32">
                        <div className="premium-card p-4 aspect-square group relative overflow-hidden">
                            <div className="w-full h-full rounded-2xl overflow-hidden bg-primary border border-glass">
                                {product.imageUrls?.[activeImage] ? (
                                    <img
                                        src={product.imageUrls[activeImage]}
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-20"><Package className="w-32 h-32" /></div>
                                )}
                            </div>

                            {/* Action Floaties */}
                            <div className="absolute top-8 right-8 flex flex-col gap-3">
                                <button className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-accent-danger hover:border-accent-danger transition-all">
                                    <Heart className="w-5 h-5" />
                                </button>
                                <button className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-accent-primary hover:border-accent-primary transition-all">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {product.imageUrls?.length > 1 && (
                            <div className="flex flex-wrap gap-4 px-2">
                                {product.imageUrls.map((url, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`w-20 h-20 rounded-2xl border-2 transition-all overflow-hidden p-1 ${activeImage === i ? 'border-accent-primary shadow-lg shadow-blue-500/20' : 'border-glass opacity-50 hover:opacity-100 hover:border-white/20'
                                            }`}
                                    >
                                        <img src={url} alt="" className="w-full h-full object-cover rounded-xl" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Data Manifest */}
                    <div className="space-y-10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="px-4 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-[10px] font-black uppercase tracking-widest">
                                    {product.category || 'Core Hardware'}
                                </div>
                                <div className="flex items-center gap-1.5 text-accent-warning font-black text-xs border-l border-glass pl-3">
                                    <Star className="w-4 h-4 fill-current" />
                                    {reviewStats.avg > 0 ? `${reviewStats.avg} [Verified]` : 'New Asset'}
                                </div>
                            </div>

                            <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none text-primary">
                                {product.title}
                            </h1>

                            <div className="flex items-center gap-4">
                                <Link to={`/seller/${product.sellerId}`} className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-glass p-0.5 group-hover:border-accent-secondary transition-all overflow-hidden">
                                        {product.seller?.logo ? <img src={product.seller.logo} className="w-full h-full object-cover rounded-lg" /> : <User className="w-full h-full p-2 text-secondary" />}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary group-hover:text-accent-secondary transition-colors">Vendor Unit</p>
                                        <p className="text-sm font-bold group-hover:text-primary">{product.seller?.companyName || 'Authenticated Node'}</p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        <div className="premium-card p-8 space-y-8 bg-gradient-to-br from-accent-primary/5 to-transparent">
                            <div className="flex items-center gap-4 py-6 border-y border-glass">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-glass flex items-center justify-center">
                                    <ShieldCheck className="w-8 h-8 text-accent-primary" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary">Authenticated Partner</p>
                                        <CheckCircle2 className="w-3 h-3 text-accent-success" />
                                    </div>
                                    <p className="font-bold text-lg">{product.seller?.companyName || 'Verified Distribution Node'}</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-emerald-500/20">
                                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Buyer Protection Active</p>
                                    <p className="text-[9px] text-emerald-400/60 uppercase font-bold">100% Secure Transaction | Node Escrow Service</p>
                                </div>
                            </div>

                            <div className="flex items-end gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary">Asset Pricing</p>
                                    <h2 className="text-6xl font-black tracking-tight italic">
                                        <span className="text-accent-primary text-2xl mr-1 not-italic opacity-50">₹</span>
                                        {product.price?.toLocaleString()}
                                    </h2>
                                </div>
                                <div className="pb-2">
                                    <span className="text-secondary line-through font-bold text-lg opacity-40">₹{(parseFloat(product.price) * 1.25).toLocaleString()}</span>
                                    <span className="ml-3 px-2 py-1 rounded bg-accent-success/10 text-accent-success text-[10px] font-black uppercase tracking-widest border border-accent-success/20 animate-pulse">20% Off [FLASH]</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => handleAddToCart(false)}
                                    disabled={adding}
                                    className="flex-1 btn-secondary py-5 flex items-center justify-center gap-3 group"
                                >
                                    <ShoppingCart className="w-6 h-6 text-accent-primary group-hover:scale-110 transition-transform" />
                                    <span className="text-lg font-black italic uppercase tracking-tighter">Add to Cart</span>
                                </button>
                                <button
                                    onClick={() => handleAddToCart(true)}
                                    disabled={adding}
                                    className="flex-1 btn-primary py-5 flex items-center justify-center gap-3 group shadow-2xl shadow-blue-500/30"
                                >
                                    <Zap className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
                                    <span className="text-lg font-black italic uppercase tracking-tighter">Initiate Checkout</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-secondary flex items-center gap-3 px-2">
                                <TrendingUp className="w-4 h-4 text-accent-primary" />
                                Unit Specifications
                            </h3>
                            <div className="prose prose-invert max-w-none px-2">
                                <p className="text-secondary leading-relaxed text-lg italic opacity-80">
                                    {product.description || 'Global hardware asset with enterprise-grade endurance. Standardized for high-performance operations and verified for reliability.'}
                                </p>
                            </div>
                        </div>

                        {/* Node Assurances */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { icon: <ShieldCheck className="w-6 h-6 text-accent-success" />, title: 'Premium Node', desc: '100% Verified Asset' },
                                { icon: <Truck className="w-6 h-6 text-accent-primary" />, title: 'Pulse Logistics', desc: 'Secure Rapid Dispatch' },
                            ].map((feat, i) => (
                                <div key={i} className="premium-card p-6 flex items-center gap-5 hover:bg-white/[0.03] transition-colors border-glass">
                                    <div className="p-3 rounded-xl bg-white/5 border border-glass">{feat.icon}</div>
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-widest">{feat.title}</h4>
                                        <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-0.5">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI RECOMMENDATIONS / RELATED PRODUCTS */}
                <div className="mb-32">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div className="space-y-2 text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-secondary/10 border border-accent-secondary/20 text-accent-secondary text-[10px] font-black uppercase tracking-widest">
                                <Sparkles className="w-3.5 h-3.5" />
                                AI Optimized Match
                            </div>
                            <h2 className="text-4xl font-black italic uppercase italic tracking-tighter flex items-center gap-4">
                                <div className="w-1.5 h-10 bg-accent-secondary rounded-full" />
                                Recommended for <span className="text-accent-secondary">You</span>
                            </h2>
                        </div>
                        <Link to="/shop" className="text-xs font-black uppercase tracking-widest text-secondary hover:text-accent-secondary transition-all flex items-center gap-2 group">
                            Explore All Assets
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {relatedProducts.length > 0 ? relatedProducts.map(p => (
                            <Link
                                key={p.productId}
                                to={`/shop/product/${p.productId}`}
                                className="premium-card p-4 group hover:-translate-y-2 transition-all duration-500"
                            >
                                <div className="aspect-square bg-primary rounded-2xl mb-6 overflow-hidden relative border border-glass">
                                    {p.imageUrls?.[0] ? (
                                        <img src={p.imageUrls[0]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" loading="lazy" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-10"><Package className="w-12 h-12" /></div>
                                    )}
                                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-sm font-black text-white">
                                        ₹{p.price?.toLocaleString()}
                                    </div>
                                </div>
                                <div className="px-2 space-y-3 text-left">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-accent-secondary opacity-50" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary">AI Suggested</span>
                                    </div>
                                    <h3 className="font-black italic uppercase text-lg group-hover:text-accent-secondary transition-colors line-clamp-1 text-primary">{p.title}</h3>
                                    <div className="flex justify-between items-center text-xs text-secondary font-bold">
                                        <div className="flex h-1 w-24 bg-white/5 rounded-full overflow-hidden border border-glass">
                                            <div className="w-[88%] bg-accent-secondary" />
                                        </div>
                                        <span>Node Sync High</span>
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="col-span-full py-10 text-center opacity-30 italic font-bold">Initializing additional assets...</div>
                        )}
                    </div>
                </div>

                {/* REVIEWS SECTION */}
                <div id="comments" className="mb-32">
                    <div className="flex items-center gap-6 mb-16 text-left">
                        <MessageSquare className="w-10 h-10 text-accent-primary" />
                        <div>
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">User Performance <span className="text-accent-primary">Logs</span></h2>
                            <p className="text-secondary text-xs font-black uppercase tracking-[0.3em]">Verified operator feedback manifest</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-left">
                        {/* Summary Stats */}
                        <div className="lg:col-span-1 space-y-8 sticky top-32">
                            <div className="premium-card p-10 flex flex-col items-center text-center gap-6 border-accent-primary/20 bg-white/[0.02]">
                                <div className="text-7xl font-black italic text-accent-primary">{reviewStats.avg || '0'}</div>
                                <div className="flex gap-1.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-6 h-6 ${i < Math.round(reviewStats.avg) ? 'text-accent-warning fill-current' : 'text-white/10'}`} />
                                    ))}
                                </div>
                                <div className="space-y-1">
                                    <p className="font-black uppercase tracking-widest text-sm italic">Global Standard</p>
                                    <p className="text-secondary text-xs font-bold font-mono">Based on {reviewStats.count} deployments</p>
                                </div>
                            </div>

                            {/* Post Review Interface */}
                            <div className="premium-card p-8 border-glass space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Send className="w-3.5 h-3.5" />
                                    Post Feedback
                                </h3>
                                {!isAuthenticated() ? (
                                    <div className="text-center space-y-4 py-4">
                                        <p className="text-secondary text-[10px] font-black uppercase tracking-widest">Authentication Required</p>
                                        <button onClick={() => navigate('/shop/login')} className="btn-primary w-full py-4 text-xs font-black">Sync Credentials</button>
                                    </div>
                                ) : (
                                    <form onSubmit={handlePostReview} className="space-y-4">
                                        <div className="flex justify-center gap-2 mb-4">
                                            {[1, 2, 3, 4, 5].map(num => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => setNewRating(num)}
                                                    className={`transition-all ${newRating >= num ? 'text-accent-warning scale-110' : 'text-white/10 hover:text-white/20'}`}
                                                >
                                                    <Star className={`w-6 h-6 ${newRating >= num ? 'fill-current' : ''}`} />
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={newComment}
                                            onChange={e => setNewComment(e.target.value)}
                                            placeholder="Enter performance log entry..."
                                            className="w-full bg-primary border border-glass rounded-xl p-4 text-sm focus:border-accent-primary outline-none min-h-[120px] italic transition-all"
                                        />
                                        <button
                                            type="submit"
                                            disabled={postingReview || !newComment.trim()}
                                            className="w-full btn-primary py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {postingReview ? 'Syncing...' : 'Broadcast Log'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Comment List */}
                        <div className="lg:col-span-2 space-y-6">
                            {reviews.length > 0 ? reviews.map((rev) => (
                                <div key={rev.reviewId} className="premium-card p-8 hover:bg-white/[0.03] transition-all group relative border-glass">
                                    {/* Edit Mode Interface */}
                                    {editingReviewId === rev.reviewId ? (
                                        <div className="space-y-6 animate-fade-in">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-primary">Editing Log Manifest</h4>
                                                <button onClick={() => setEditingReviewId(null)} className="p-2 hover:bg-white/5 rounded-lg text-secondary"><X className="w-4 h-4" /></button>
                                            </div>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map(n => (
                                                    <Star
                                                        key={n}
                                                        onClick={() => setEditRating(n)}
                                                        className={`w-5 h-5 cursor-pointer transition-all ${editRating >= n ? 'text-accent-warning fill-current' : 'text-white/10'}`}
                                                    />
                                                ))}
                                            </div>
                                            <textarea
                                                value={editContent}
                                                onChange={e => setEditContent(e.target.value)}
                                                className="w-full bg-primary border border-accent-primary/30 rounded-xl p-4 text-sm outline-none transition-all italic min-h-[100px]"
                                            />
                                            <div className="flex gap-3">
                                                <button onClick={handleUpdateReview} className="btn-primary py-3 px-8 text-[10px] font-black">Save Changes</button>
                                                <button onClick={() => setEditingReviewId(null)} className="btn-secondary py-3 px-8 text-[10px] font-black">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center border border-glass font-black italic group-hover:scale-110 transition-transform">
                                                        {rev.userName?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <p className="font-black italic uppercase text-primary">{rev.userName || 'Anonymous Operator'}</p>
                                                            <CheckCircle2 className="w-4 h-4 text-accent-success" />
                                                        </div>
                                                        <p className="text-[10px] font-black text-secondary tracking-widest uppercase mt-0.5">
                                                            {new Date(rev.createdAt).toLocaleDateString()} • Verified Node
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 text-accent-warning">
                                                    {[...Array(rev.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                                                </div>
                                            </div>
                                            <p className="text-primary text-lg leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">
                                                "{rev.comment}"
                                            </p>

                                            <div className="mt-8 pt-6 border-t border-glass flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <button className="text-[10px] font-black uppercase tracking-widest text-secondary hover:text-accent-primary transition-colors">Helpful (0)</button>
                                                    <button className="text-[10px] font-black uppercase tracking-widest text-secondary hover:text-accent-primary transition-colors">Report Protocol</button>
                                                </div>

                                                {(user?.email === rev.email) && (
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={() => startEditing(rev)} className="p-2.5 rounded-xl bg-white/5 border border-glass text-secondary hover:text-accent-primary hover:border-accent-primary transition-all">
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteReview(rev.reviewId)} className="p-2.5 rounded-xl bg-white/5 border border-glass text-secondary hover:text-accent-danger hover:border-accent-danger transition-all">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )) : (
                                <div className="premium-card p-20 text-center flex flex-col items-center justify-center gap-6 border-dashed border-2 border-glass bg-transparent">
                                    <MessageSquare className="w-12 h-12 text-secondary opacity-10" />
                                    <p className="text-secondary text-[10px] font-black uppercase tracking-[0.4em]">No performance entries archived for this unit.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Seller Section Enhanced */}
                <div className="border-t border-glass pt-24">
                    <div className="premium-card p-12 bg-gradient-to-br from-accent-secondary/10 to-transparent relative overflow-hidden group border-glass text-left">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-secondary/5 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 group-hover:bg-accent-secondary/10 transition-all duration-1000" />

                        <div className="flex flex-col md:flex-row gap-12 items-center md:items-start relative z-10">
                            <div className="w-40 h-40 rounded-3xl p-1 bg-gradient-to-br from-accent-primary via-white/20 to-accent-secondary shadow-2xl flex-shrink-0">
                                <div className="w-full h-full rounded-[1.2rem] overflow-hidden bg-primary border-4 border-primary">
                                    {product.seller?.logo ? (
                                        <img src={product.seller.logo} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-20"><User className="w-16 h-16 text-secondary" /></div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-grow space-y-8 text-center md:text-left">
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black italic uppercase italic tracking-tighter leading-none text-primary">{product.seller?.companyName || 'Verified Global Partner'}</h3>
                                    <div className="flex items-center justify-center md:justify-start gap-4">
                                        <span className="text-[10px] font-black bg-accent-success/10 px-4 py-1.5 rounded-full text-accent-success border border-accent-success/20 uppercase tracking-widest">Master Verified Vendor</span>
                                        <div className="flex items-center gap-1.5 text-accent-warning">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="font-bold text-sm">4.9 Overall Status</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    {[
                                        { label: 'Protocol Center', val: 'Authenticated Support', sub: 'support@stocksync.ai' },
                                        { label: 'Node Location', val: 'Sector-7 Distribution', sub: 'Global Logistics' },
                                        { label: 'Dispatch Velocity', val: 'Ultra Fast', sub: 'Avg 4.2h Dispatched' }
                                    ].map((s, i) => (
                                        <div key={i} className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-secondary">{s.label}</p>
                                            <p className="font-black italic text-lg leading-tight text-primary">{s.val}</p>
                                            <p className="text-[10px] font-bold text-secondary opacity-60 font-mono tracking-tight">{s.sub}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4">
                                    <button className="btn-primary py-4 px-10 text-xs shadow-none">Visit Seller War-Room</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
            {/* AI Recommendations Section */}
            <div className="max-w-7xl mx-auto px-6 mb-32">
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-accent-primary" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tight">AI Generated <span className="text-accent-primary">Links</span></h2>
                        <p className="text-secondary text-sm">Synchronizing related hardware nodes for your current build.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {recommendations.length > 0 ? recommendations.map((rec, i) => (
                        <div key={i} className="premium-card p-6 flex flex-col gap-6 group hover:border-accent-primary/40 transition-all">
                            <div className="aspect-square rounded-2xl bg-black/40 border border-glass flex items-center justify-center relative overflow-hidden">
                                {rec.image ? (
                                    <img src={rec.image} alt={rec.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <Package className="w-12 h-12 text-accent-primary/20" />
                                )}
                                <div className="absolute top-4 right-4 px-2 py-1 rounded bg-accent-primary text-[8px] font-black uppercase tracking-widest shadow-lg">
                                    {Math.round(rec.score * 100)}% Match
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-accent-primary uppercase tracking-[0.2em]">{rec.category}</p>
                                <h3 className="text-lg font-black uppercase tracking-tight leading-none group-hover:text-accent-primary transition-colors">Related Expansion Module</h3>
                                <button 
                                    onClick={() => navigate(`/shop?category=${rec.category}`)}
                                    className="w-full py-3 rounded-xl bg-white/5 border border-glass hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-primary transition-all mt-2"
                                >
                                    Explore Nodes
                                </button>
                            </div>
                        </div>
                    )) : (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="premium-card p-6 h-64 animate-pulse bg-white/[0.02] border-glass" />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};


export default ProductDetails;
