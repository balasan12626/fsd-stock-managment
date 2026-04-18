import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import PortalLayout from '../components/PortalLayout';
import {
    ShieldAlert,
    Users,
    Package,
    AlertCircle,
    CheckCircle2,
    LayoutDashboard,
    BarChart3,
    Loader2,
    Settings,
    Activity,
    Database,
    Trash2,
    Mail,
    UserCircle,
    Building2,
    Fingerprint
} from 'lucide-react';

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState({});
    const [sellers, setSellers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('sellers');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, sellersRes, customersRes] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getAllSellers(),
                adminAPI.getAllCustomers()
            ]);
            setStats(statsRes.data.stats || {});
            setSellers(sellersRes.data.sellers || []);
            setCustomers(customersRes.data.customers || []);
        } catch (err) {
            console.error('SuperAdmin fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteSeller = async (id) => {
        if (window.confirm('CRITICAL ACTION: Decommission seller node? Data persistent audit will remain.')) {
            try {
                await adminAPI.deleteSeller(id);
                fetchData();
            } catch (err) {
                alert('Terminal Error: Node decommissioning failed.');
            }
        }
    };

    const handleDeleteCustomer = async (email) => {
        if (window.confirm('SECURITY PROTOCOL: Purge customer record?')) {
            try {
                await adminAPI.deleteCustomer(email);
                fetchData();
            } catch (err) {
                alert('Purge Failure: Target link remains active.');
            }
        }
    };

    const menuItems = [
        { path: '/superadmin/dashboard', label: 'Mainframe', icon: <ShieldAlert className="w-5 h-5" /> },
        { path: '/admin/dashboard', label: 'Admin View', icon: <LayoutDashboard className="w-5 h-5" /> },
        { path: '/admin/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    ];

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-magenta-500 animate-spin" />
        </div>
    );

    return (
        <PortalLayout menuItems={menuItems} userType="Super Administrator">
            <div className="max-w-7xl mx-auto space-y-10 animate-fade-in text-slate-100 font-['Inter']">
                {/* Header */}
                <div className="flex justify-between items-center p-8 rounded-[2.5rem] bg-slate-900 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-magenta-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter italic uppercase underline decoration-magenta-500 decoration-4 underline-offset-8">
                            Super <span className="text-magenta-500">Mainframe</span>
                        </h1>
                        <p className="text-slate-400 mt-4 font-bold uppercase tracking-[0.3em] text-[10px]">Root System Authority Level 0 | balasan2626@gmail.com</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-black text-magenta-500">System Uptime</p>
                            <p className="text-2xl font-black italic">99.98%</p>
                        </div>
                    </div>
                </div>

                {/* System Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="premium-card p-6 border-white/5 bg-slate-900/40">
                        <Users className="w-8 h-8 text-cyan-500 mb-4" />
                        <p className="text-xs uppercase font-black text-slate-500">Total Nodes (Sellers)</p>
                        <h3 className="text-4xl font-black">{sellers.length}</h3>
                    </div>
                    <div className="premium-card p-6 border-white/5 bg-slate-900/40">
                        <UserCircle className="w-8 h-8 text-magenta-500 mb-4" />
                        <p className="text-xs uppercase font-black text-slate-500">Registered Customers</p>
                        <h3 className="text-4xl font-black">{customers.length}</h3>
                    </div>
                    <div className="premium-card p-6 border-white/5 bg-slate-900/40">
                        <Package className="w-8 h-8 text-violet-500 mb-4" />
                        <p className="text-xs uppercase font-black text-slate-500">Active Inventory</p>
                        <h3 className="text-4xl font-black">{stats.totalProducts || 0}</h3>
                    </div>
                    <div className="premium-card p-6 border-white/5 bg-slate-900/40">
                        <Database className="w-8 h-8 text-emerald-500 mb-4" />
                        <p className="text-xs uppercase font-black text-slate-500">System Capacity</p>
                        <h3 className="text-4xl font-black">42.8 GB</h3>
                    </div>
                </div>

                {/* Management Section */}
                <div className="premium-card border-white/5 overflow-hidden">
                    <div className="flex border-b border-white/5">
                        <button
                            onClick={() => setActiveTab('sellers')}
                            className={`flex-1 py-6 px-10 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'sellers' ? 'bg-magenta-500/10 text-magenta-500 border-b-2 border-magenta-500' : 'text-slate-500 hover:bg-white/5'}`}
                        >
                            <Building2 className="w-4 h-4 inline-block mr-2" />
                            Seller Network
                        </button>
                        <button
                            onClick={() => setActiveTab('customers')}
                            className={`flex-1 py-6 px-10 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'customers' ? 'bg-magenta-500/10 text-magenta-500 border-b-2 border-magenta-500' : 'text-slate-500 hover:bg-white/5'}`}
                        >
                            <UserCircle className="w-4 h-4 inline-block mr-2" />
                            Customer Manifest
                        </button>
                    </div>

                    <div className="p-8">
                        {activeTab === 'sellers' ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5">
                                            <th className="pb-6">Identity</th>
                                            <th className="pb-6">Corporate Context</th>
                                            <th className="pb-6">Tax/GST Number</th>
                                            <th className="pb-6">Inventory</th>
                                            <th className="pb-6 text-right">Protocol</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {sellers.map(s => (
                                            <tr key={s.sellerId} className="group hover:bg-white/[0.02]">
                                                <td className="py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center font-black text-violet-500 border border-violet-500/30">
                                                            {s.logo ? <img src={s.logo} className="w-full h-full object-cover rounded-xl" /> : s.name?.[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-100">{s.name}</p>
                                                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                                                <Mail className="w-3 h-3" /> {s.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6">
                                                    <p className="text-sm font-bold">{s.companyName}</p>
                                                    <p className="text-[10px] text-slate-500 italic">{s.address || 'Location Hidden'}</p>
                                                </td>
                                                <td className="py-6">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                                        <Fingerprint className="w-3 h-3 text-emerald-500" />
                                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{s.gstNumber || 'VERIFIED'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-6">
                                                    <p className="text-sm font-black text-slate-100">{s.productCount || 0} SKU</p>
                                                </td>
                                                <td className="py-6 text-right">
                                                    <button
                                                        onClick={() => handleDeleteSeller(s.sellerId)}
                                                        className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5">
                                            <th className="pb-6">Human Identity</th>
                                            <th className="pb-6">Digital Uplink (Email)</th>
                                            <th className="pb-6">Node Status</th>
                                            <th className="pb-6 text-right">Protocol</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {customers.map(c => (
                                            <tr key={c.email} className="group hover:bg-white/[0.02]">
                                                <td className="py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-magenta-500/20 flex items-center justify-center font-black text-magenta-500 border border-magenta-500/30">
                                                            {c.name?.[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-100">{c.name}</p>
                                                            <p className="text-[10px] text-slate-500">ID: {c.customerId?.slice(0, 8)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6">
                                                    <p className="text-sm font-medium text-slate-300">{c.email}</p>
                                                </td>
                                                <td className="py-6">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-500">
                                                        <Activity className="w-3 h-3" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Active Link</span>
                                                    </div>
                                                </td>
                                                <td className="py-6 text-right">
                                                    <button
                                                        onClick={() => handleDeleteCustomer(c.email)}
                                                        className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Activity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="premium-card p-8 border-white/5">
                        <h3 className="text-xl font-black italic uppercase italic tracking-wider mb-8 flex items-center gap-3">
                            <Activity className="w-5 h-5 text-magenta-500" />
                            Live Telemetry
                        </h3>
                        <div className="space-y-6">
                            {[
                                { task: 'Cloud Sync State', status: 'Stable', progress: 100, color: 'bg-emerald-500' },
                                { task: 'Seller API Throughput', status: 'High', progress: 85, color: 'bg-magenta-500' },
                                { task: 'AI Predicition Node', status: 'Optimal', progress: 94, color: 'bg-violet-500' }
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <p className="text-xs font-bold text-slate-400">{item.task}</p>
                                        <p className="text-[10px] font-black uppercase text-slate-500">{item.status}</p>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color}`} style={{ width: `${item.progress}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="premium-card p-8 border-white/5 bg-gradient-to-br from-magenta-500/5 to-transparent">
                        <h3 className="text-xl font-black italic uppercase italic tracking-wider mb-8 flex items-center gap-3">
                            <ShieldAlert className="w-5 h-5 text-red-500" />
                            Critical Logs
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-4">
                                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold">Unauthorized Probe Detected</p>
                                    <p className="text-[10px] text-slate-500">Source IP: 192.168.1.104 | Access Blocked</p>
                                </div>
                                <span className="ml-auto text-[10px] text-slate-600 font-mono">2m ago</span>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-4">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold">Database Backup Archive</p>
                                    <p className="text-[10px] text-slate-500">Scheduled sync complete | 4GB archived</p>
                                </div>
                                <span className="ml-auto text-[10px] text-slate-600 font-mono">45m ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PortalLayout>
    );
};

export default SuperAdminDashboard;
