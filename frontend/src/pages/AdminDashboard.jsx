import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Shield, LogOut, Package, Users, TrendingUp, DollarSign,
    Search, Trash2, Eye, Building2, Mail, Phone, MapPin,
    FileText, Calendar, Image as ImageIcon, Zap
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'sellers'
    const [products, setProducts] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [admins, setAdmins] = useState([]);
    const SUPER_ADMIN_EMAIL = 'sbb502122005@gmail.com';
    const isSuperAdmin = useAuth().user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [productsRes, sellersRes, statsRes] = await Promise.all([
                adminAPI.getAllProducts(),
                adminAPI.getAllSellers(),
                adminAPI.getStats()
            ]);

            setProducts(productsRes.data.products || []);
            setSellers(sellersRes.data.sellers || []);
            setStats(statsRes.data.stats || {});

            if (isSuperAdmin) {
                const adminsRes = await adminAPI.getPendingAdmins();
                setAdmins(adminsRes.data.admins || []);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAdminStatus = async (adminId, status) => {
        try {
            await adminAPI.updateAdminStatus(adminId, status);
            setAdmins(admins.map(a => a.adminId === adminId ? { ...a, status } : a));
            alert(`Admin ${status} successfully`);
        } catch (error) {
            console.error('Error updating admin status:', error);
            alert('Failed to update admin status');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            await adminAPI.deleteProduct(productId);
            setProducts(products.filter(p => p.productId !== productId));
            alert('Product deleted successfully');
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const filteredProducts = products.filter(product => {
        const searchLower = searchTerm.toLowerCase();
        return (
            product.title?.toLowerCase().includes(searchLower) ||
            product.seller?.companyName?.toLowerCase().includes(searchLower) ||
            product.seller?.email?.toLowerCase().includes(searchLower)
        );
    });

    const filteredSellers = sellers.filter(seller => {
        const searchLower = searchTerm.toLowerCase();
        return (
            seller.companyName?.toLowerCase().includes(searchLower) ||
            seller.email?.toLowerCase().includes(searchLower) ||
            seller.phone?.toLowerCase().includes(searchLower)
        );
    });

    const filteredAdmins = admins.filter(admin => {
        const searchLower = searchTerm.toLowerCase();
        return (
            admin.name?.toLowerCase().includes(searchLower) ||
            admin.email?.toLowerCase().includes(searchLower)
        );
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-['Inter']" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: 'var(--glass-bg)', borderColor: 'var(--border-color)' }}>
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Dashboard</h1>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>System Management Portal</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <button
                                onClick={() => navigate('/admin/analytics')}
                                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105"
                                style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.2)' }}
                            >
                                <TrendingUp className="w-4 h-4" />
                                <span className="font-medium">Analytics Report</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105"
                                style={{ background: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <TrendingUp className="w-5 h-5" style={{ color: '#10b981' }} />
                        </div>
                        <h3 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{stats?.totalProducts || 0}</h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Products</p>
                    </div>

                    <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <TrendingUp className="w-5 h-5" style={{ color: '#10b981' }} />
                        </div>
                        <h3 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{stats?.totalSellers || 0}</h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Sellers</p>
                    </div>

                    <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <TrendingUp className="w-5 h-5" style={{ color: '#10b981' }} />
                        </div>
                        <h3 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>₹{stats?.totalInventoryValue || 0}</h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Inventory Value</p>
                    </div>

                    <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <TrendingUp className="w-5 h-5" style={{ color: '#10b981' }} />
                        </div>
                        <h3 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{stats?.totalQuantity || 0}</h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Stock</p>
                    </div>
                </div>

                {/* Tabs and Search */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'products'
                                ? 'text-white'
                                : ''
                                }`}
                            style={activeTab === 'products'
                                ? { background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }
                                : { background: 'var(--glass-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }
                            }
                        >
                            Products ({products.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('sellers')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'sellers'
                                ? 'text-white'
                                : ''
                                }`}
                            style={activeTab === 'sellers'
                                ? { background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }
                                : { background: 'var(--glass-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }
                            }
                        >
                            Sellers ({sellers.length})
                        </button>
                        {isSuperAdmin && (
                            <button
                                onClick={() => setActiveTab('admins')}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'admins'
                                    ? 'text-white'
                                    : ''
                                    }`}
                                style={activeTab === 'admins'
                                    ? { background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }
                                    : { background: 'var(--glass-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }
                                }
                            >
                                Manage Admins ({admins.length})
                            </button>
                        )}
                    </div>

                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-80 pl-12 pr-4 py-3 rounded-xl login-input focus:outline-none"
                        />
                    </div>
                </div>

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="space-y-4">
                        {filteredProducts.length === 0 ? (
                            <div className="glass-card rounded-2xl p-12 text-center">
                                <Package className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No products found</p>
                            </div>
                        ) : (
                            filteredProducts.map((product) => (
                                <div key={product.productId} className="glass-card rounded-2xl p-6 hover:scale-[1.01] transition-transform">
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* Product Image */}
                                        <div className="flex-shrink-0">
                                            {product.imageUrls && product.imageUrls.length > 0 ? (
                                                <img
                                                    src={product.imageUrls[0]}
                                                    alt={product.title}
                                                    className="w-full lg:w-32 h-32 object-cover rounded-xl"
                                                />
                                            ) : (
                                                <div className="w-full lg:w-32 h-32 rounded-xl flex items-center justify-center" style={{ background: 'var(--glass-bg)' }}>
                                                    <ImageIcon className="w-12 h-12" style={{ color: 'var(--text-muted)' }} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{product.title}</h3>
                                                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{product.description}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setSelectedProduct(product)}
                                                        className="p-2 rounded-lg hover:scale-110 transition-transform"
                                                        style={{ background: 'var(--glass-bg)', color: 'var(--accent-primary)' }}
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.productId)}
                                                        className="p-2 rounded-lg hover:scale-110 transition-transform"
                                                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                <div>
                                                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Price</p>
                                                    <p className="font-bold" style={{ color: 'var(--accent-primary)' }}>₹{product.price}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Quantity</p>
                                                    <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{product.quantity}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Expiry Date</p>
                                                    <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{product.expiryDate || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Product ID</p>
                                                    <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{product.productId.slice(0, 8)}...</p>
                                                </div>
                                            </div>

                                            {/* Seller Information */}
                                            {product.seller && (
                                                <div className="border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
                                                    <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>SELLER INFORMATION</p>
                                                    <div className="flex items-start gap-4">
                                                        {product.seller.logoUrl ? (
                                                            <img
                                                                src={product.seller.logoUrl}
                                                                alt={product.seller.companyName}
                                                                className="w-16 h-16 rounded-lg object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ background: 'var(--glass-bg)' }}>
                                                                <Building2 className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div className="flex items-center gap-2">
                                                                <Building2 className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                                                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{product.seller.companyName}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Mail className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{product.seller.email}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Phone className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{product.seller.phone || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>GST: {product.seller.gstNumber}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Sellers Tab */}
                {activeTab === 'sellers' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredSellers.length === 0 ? (
                            <div className="col-span-2 glass-card rounded-2xl p-12 text-center">
                                <Users className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No sellers found</p>
                            </div>
                        ) : (
                            filteredSellers.map((seller) => (
                                <div key={seller.sellerId} className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-transform">
                                    <div className="flex items-start gap-4 mb-4">
                                        {seller.logoUrl ? (
                                            <img
                                                src={seller.logoUrl}
                                                alt={seller.companyName}
                                                className="w-20 h-20 rounded-xl object-cover"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 rounded-xl flex items-center justify-center" style={{ background: 'var(--glass-bg)' }}>
                                                <Building2 className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{seller.companyName}</h3>
                                            <p className="text-sm px-3 py-1 rounded-full inline-block" style={{ background: 'var(--glass-bg)', color: 'var(--accent-primary)' }}>
                                                {seller.productCount} Products
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{seller.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{seller.phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>GST: {seller.gstNumber}</span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: 'var(--text-muted)' }} />
                                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{seller.address || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                Joined: {new Date(seller.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Admins Tab (Super Admin Only) */}
                {activeTab === 'admins' && isSuperAdmin && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAdmins.length === 0 ? (
                            <div className="col-span-full glass-card rounded-2xl p-12 text-center">
                                <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No admins found for review</p>
                            </div>
                        ) : (
                            filteredAdmins.map((admin) => (
                                <div key={admin.adminId} className="glass-card rounded-[2rem] p-6 relative overflow-hidden group">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10" style={{ background: 'var(--input-bg)' }}>
                                            <Shield className={`w-7 h-7 ${admin.status === 'approved' ? 'text-green-400' : 'text-amber-400'}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{admin.name}</h3>
                                            <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-block ${admin.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                admin.status === 'declined' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                }`}>
                                                {admin.status || 'pending'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-4 h-4 text-slate-500" />
                                            <span className="text-sm font-medium text-slate-400">{admin.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-4 h-4 text-slate-500" />
                                            <span className="text-xs text-slate-500">Registered: {new Date(admin.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdateAdminStatus(admin.adminId, 'approved')}
                                            disabled={admin.status === 'approved'}
                                            className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
                                            style={{ background: 'var(--accent-primary)', color: 'white' }}
                                        >
                                            Approve Access
                                        </button>
                                        <button
                                            onClick={() => handleUpdateAdminStatus(admin.adminId, 'declined')}
                                            disabled={admin.status === 'declined'}
                                            className="px-4 py-2.5 rounded-xl border transition-all hover:bg-red-500/10 hover:border-red-500/30 disabled:opacity-30"
                                            style={{ borderColor: 'var(--border-color)', color: '#ef4444' }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={{ background: 'rgba(0, 0, 0, 0.85)', backdropBlur: '12px' }} onClick={() => setSelectedProduct(null)}>
                    <div
                        className="glass-card rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-[0_0_100px_rgba(139,92,246,0.15)] animate-modal-up"
                        style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 px-8 py-6 flex items-center justify-between backdrop-blur-3xl" style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.6)' }}>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl border border-purple-500/20 bg-purple-500/10">
                                    <FileText className="w-5 h-5 text-purple-400" />
                                </div>
                                <h2 className="text-xl font-bold italic tracking-tighter uppercase" style={{ color: 'var(--text-primary)' }}>Unit <span className="text-purple-400">SpecSheet</span></h2>
                            </div>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="w-10 h-10 rounded-xl flex items-center justify-center hover:scale-110 transition-all group"
                                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)' }}
                            >
                                <span className="text-lg text-slate-400 group-hover:text-white">✕</span>
                            </button>
                        </div>

                        <div className="p-8">
                            {/* Image Showcase */}
                            {selectedProduct.imageUrls && selectedProduct.imageUrls.length > 0 && (
                                <div className="mb-10 group/showcase">
                                    <div className="relative aspect-[16/9] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
                                        <img
                                            src={selectedProduct.imageUrls[0]}
                                            alt={selectedProduct.title}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover/showcase:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                                        <div className="absolute bottom-6 left-6 right-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="px-3 py-1 bg-purple-500/20 backdrop-blur-md rounded-full border border-purple-500/30 text-[10px] font-black tracking-widest text-purple-400 uppercase">
                                                    Serial: {selectedProduct.productId.slice(0, 12)}
                                                </div>
                                                {selectedProduct.expiryDate && (
                                                    <div className="px-3 py-1 bg-amber-500/10 backdrop-blur-md rounded-full border border-amber-500/20 text-[10px] font-black tracking-widest text-amber-400 uppercase">
                                                        Expires: {selectedProduct.expiryDate}
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase line-clamp-1">{selectedProduct.title}</h3>
                                        </div>
                                    </div>

                                    {selectedProduct.imageUrls.length > 1 && (
                                        <div className="grid grid-cols-4 gap-4 mt-4">
                                            {selectedProduct.imageUrls.slice(1, 5).map((url, index) => (
                                                <div key={index} className="aspect-square rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-colors cursor-pointer group/thumb">
                                                    <img src={url} alt="Aux" className="w-full h-full object-cover opacity-60 group-hover/thumb:opacity-100 transition-opacity" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Description Section */}
                            <div className="mb-10 relative">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                    Hardware Log Information
                                </p>
                                <div
                                    className="p-6 rounded-2xl leading-relaxed text-sm italic font-medium"
                                    style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}
                                >
                                    {selectedProduct.description || 'No system designation provided for this unit.'}
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-6 mb-10">
                                <div className="p-6 rounded-3xl relative overflow-hidden group/metric" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(236, 72, 153, 0.05))', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                                    <div className="relative z-10">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Network Valuation</p>
                                        <div className="flex items-end gap-1">
                                            <span className="text-sm font-light text-purple-400 mb-1">₹</span>
                                            <span className="text-4xl font-black italic tracking-tighter text-white">{parseFloat(selectedProduct.price).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <DollarSign className="absolute -bottom-2 -right-2 w-20 h-20 text-purple-500/10 -rotate-12 transition-transform group-hover/metric:rotate-0 duration-700" />
                                </div>
                                <div className="p-6 rounded-3xl relative overflow-hidden group/metric" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05), rgba(59, 130, 246, 0.05))', border: '1px solid rgba(6, 182, 212, 0.1)' }}>
                                    <div className="relative z-10">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Payload Loadout</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-4xl font-black italic tracking-tighter text-white">{selectedProduct.quantity}</span>
                                            <span className="text-[10px] font-bold text-cyan-400 uppercase mb-1.5 tracking-tighter">Units Ready</span>
                                        </div>
                                    </div>
                                    <Package className="absolute -bottom-2 -right-2 w-20 h-20 text-cyan-500/10 rotate-12 transition-transform group-hover/metric:rotate-0 duration-700" />
                                </div>
                            </div>

                            {/* Seller Information */}
                            {selectedProduct.seller && (
                                <div className="pt-10 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="w-5 h-5 text-purple-400" />
                                            <h4 className="text-xs font-black tracking-[0.2em] text-slate-500 uppercase italic">Primary Origin & Distribution</h4>
                                        </div>
                                        <div className="flex gap-1">
                                            {[1, 2, 3].map(i => <div key={i} className="w-1 h-3 rounded-full bg-slate-800"></div>)}
                                        </div>
                                    </div>

                                    <div className="glass-card rounded-3xl p-8 relative overflow-hidden group/origin">
                                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] bg-purple-500/10 pointer-events-none"></div>

                                        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                                            <div className="relative">
                                                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-cyan-500">
                                                    <div className="w-full h-full rounded-full border-4 border-[#0f172a] overflow-hidden bg-slate-900">
                                                        {selectedProduct.seller.logoUrl ? (
                                                            <img src={selectedProduct.seller.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Building2 className="w-10 h-10 text-slate-700" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-[#0f172a] shadow-lg"></div>
                                            </div>

                                            <div className="flex-1 space-y-5">
                                                <div>
                                                    <h5 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none mb-1">{selectedProduct.seller.companyName}</h5>
                                                    <p className="text-[9px] font-bold text-slate-500 tracking-[0.3em] font-mono leading-none">SELLER_CORE_ACTIVE</p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex items-center gap-3 group/item cursor-pointer">
                                                        <div className="p-2 rounded-lg bg-slate-900 border border-white/5 transition-colors group-hover/item:border-purple-500/30">
                                                            <Mail className="w-4 h-4 text-purple-400" />
                                                        </div>
                                                        <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white transition-colors">{selectedProduct.seller.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 group/item cursor-pointer">
                                                        <div className="p-2 rounded-lg bg-slate-900 border border-white/5 transition-colors group-hover/item:border-cyan-500/30">
                                                            <Phone className="w-4 h-4 text-cyan-400" />
                                                        </div>
                                                        <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white transition-colors">{selectedProduct.seller.phone || 'ACCESS_RESTRICTED'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 group/item">
                                                        <div className="p-2 rounded-lg bg-slate-900 border border-white/5 transition-colors group-hover/item:border-pink-500/30">
                                                            <Search className="w-4 h-4 text-pink-400" />
                                                        </div>
                                                        <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white transition-colors uppercase">GST: {selectedProduct.seller.gstNumber}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 group/item">
                                                        <div className="p-2 rounded-lg bg-slate-900 border border-white/5 transition-colors group-hover/item:border-amber-500/30">
                                                            <MapPin className="w-4 h-4 text-amber-400" />
                                                        </div>
                                                        <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white transition-colors line-clamp-1">{selectedProduct.seller.address}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 backdrop-blur-3xl" style={{ background: 'rgba(15, 23, 42, 0.4)', borderTop: '1px solid var(--border-color)' }}>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="w-full py-4 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 group"
                                style={{ background: 'linear-gradient(90deg, #8b5cf6, #ec4899)', color: 'white' }}
                            >
                                <Zap className="w-4 h-4 group-hover:animate-pulse" />
                                Acknowledge Data Points
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminDashboard;
