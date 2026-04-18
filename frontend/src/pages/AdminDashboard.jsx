import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import PortalLayout from '../components/PortalLayout';
import {
    Users,
    Package,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    XCircle,
    LayoutDashboard,
    BarChart3,
    ShoppingBag,
    History,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    ChevronRight
} from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({});
    const [sellers, setSellers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, sellersRes, productsRes] = await Promise.all([
                    adminAPI.getStats(),
                    adminAPI.getAllSellers(),
                    adminAPI.getAllProducts()
                ]);
                setStats(statsRes.data.stats || {});
                setSellers(sellersRes.data.sellers || []);
                setProducts(productsRes.data.products || []);
            } catch (err) {
                console.error('Admin fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const menuItems = [
        { path: '/admin/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
        { path: '/admin/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
        { path: '/admin/orders', label: 'All Orders', icon: <ShoppingBag className="w-5 h-5" /> },
    ];

    const topStats = [
        {
            label: 'Total Revenue',
            value: `₹${stats.totalRevenue?.toLocaleString() || 0}`,
            icon: <TrendingUp className="text-accent-success" />,
            trend: '+18.2%',
            isUp: true
        },
        {
            label: 'Active Sellers',
            value: sellers.length,
            icon: <Users className="text-accent-primary" />,
            trend: '+2',
            isUp: true
        },
        {
            label: 'Total Products',
            value: products.length,
            icon: <Package className="text-accent-secondary" />,
            trend: '-1.5%',
            isUp: false
        },
        {
            label: 'Active Orders',
            value: stats.orderCount || 24,
            icon: <ShoppingBag className="text-accent-warning" />,
            trend: '+5',
            isUp: true
        },
    ];

    if (loading) return (
        <div className="min-h-screen bg-primary flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-accent-primary animate-spin" />
        </div>
    );

    return (
        <PortalLayout menuItems={menuItems} userType="Administrator">
            <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight">System <span className="text-accent-primary">Control</span></h1>
                        <p className="text-secondary mt-1">Real-time status of the StockSync ecosystem.</p>
                    </div>
                </div>

                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {topStats.map((stat, idx) => (
                        <div key={idx} className="premium-card p-6 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="p-3 rounded-2xl bg-white/5 border border-glass">
                                    {stat.icon}
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${stat.isUp ? 'bg-accent-success/10 text-accent-success' : 'bg-accent-danger/10 text-accent-danger'}`}>
                                    {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.trend}
                                </div>
                            </div>
                            <div>
                                <p className="text-secondary text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                                <h3 className="text-3xl font-black mt-1">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sellers List */}
                    <div className="lg:col-span-2 premium-card overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-glass flex items-center justify-between bg-white/5">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Users className="w-6 h-6 text-accent-primary" />
                                Registered Sellers
                            </h2>
                            <button className="p-2.5 rounded-2xl border border-glass hover:bg-white/5 transition-all">
                                <Filter className="w-5 h-5 text-secondary" />
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-secondary uppercase text-[10px] tracking-widest font-black border-b border-glass">
                                        <th className="px-8 py-5">Seller</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5 text-right font-black">Performance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-glass">
                                    {sellers.map((seller) => (
                                        <tr key={seller.sellerId} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl overflow-hidden border border-glass bg-primary flex items-center justify-center font-bold text-accent-primary">
                                                        {seller.logo ? <img src={seller.logo} alt="" className="w-full h-full object-cover" /> : seller.name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold">{seller.name || 'Unknown Seller'}</p>
                                                        <p className="text-xs text-secondary">{seller.companyName}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-accent-success" />
                                                    <span className="text-xs font-bold text-secondary uppercase tracking-wider">Active</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="font-bold text-accent-primary uppercase text-xs tracking-widest">₹{seller.totalRevenue?.toLocaleString() || '0'}</span>
                                                    <div className="w-24 h-1 rounded-full bg-white/5 border border-glass overflow-hidden">
                                                        <div className="h-full bg-accent-primary w-2/3" />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Actions / Activity */}
                    <div className="space-y-8">
                        <div className="premium-card p-8 bg-gradient-to-br from-accent-primary/10 to-transparent">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-accent-warning" />
                                Pending Actions
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-glass flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-accent-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold">New Seller Registration</p>
                                        <p className="text-xs text-secondary">TechNexus Ltd.</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-secondary" />
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-glass flex items-center gap-4 opacity-50">
                                    <div className="w-10 h-10 rounded-xl bg-accent-success/20 flex items-center justify-center">
                                        <CheckCircle2 className="w-5 h-5 text-accent-success" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold">System Backup</p>
                                        <p className="text-xs text-secondary">Completed 2h ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="premium-card p-8">
                            <h3 className="text-lg font-bold mb-6">System Health</h3>
                            <div className="space-y-6">
                                {[
                                    { label: 'Cloud Database', status: 'Optimal', value: 98 },
                                    { label: 'AI Inference Node', status: 'High Load', value: 85, color: 'accent-warning' },
                                    { label: 'Seller API Gateway', status: 'Optimal', value: 99 },
                                ].map((sys, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <p className="text-sm font-bold text-secondary">{sys.label}</p>
                                            <p className={`text-[10px] uppercase font-black tracking-widest ${sys.color === 'accent-warning' ? 'text-accent-warning' : 'text-accent-success'}`}>
                                                {sys.status}
                                            </p>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 border border-glass rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${sys.color === 'accent-warning' ? 'bg-accent-warning' : 'bg-accent-success'}`}
                                                style={{ width: `${sys.value}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PortalLayout>
    );
};

export default AdminDashboard;
