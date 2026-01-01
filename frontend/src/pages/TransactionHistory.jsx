import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import {
    ArrowLeft,
    Clock,
    Search,
    Download,
    Filter,
    ArrowUpCircle,
    ArrowDownCircle,
    RefreshCw,
    Activity,
    AlertCircle
} from 'lucide-react';

const TransactionHistory = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await productAPI.getTransactions();
            if (response.data.success) {
                setTransactions(response.data.transactions);
            }
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(t =>
        t.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.reason && t.reason.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getTypeColor = (type) => {
        switch (type) {
            case 'add': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'remove': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            case 'update': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
            case 'initial_stock': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    const getIcon = (type) => {
        if (type === 'add' || type === 'initial_stock') return <ArrowUpCircle className="w-4 h-4" />;
        if (type === 'remove') return <ArrowDownCircle className="w-4 h-4" />;
        return <Activity className="w-4 h-4" />;
    };

    return (
        <div className="min-h-screen cosmic-grid text-slate-200">
            {/* Top Nav */}
            <nav className="backdrop-blur-2xl sticky top-0 z-50 border-b border-white/5 bg-slate-950/20">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/sell/dashboard')}
                            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-black uppercase tracking-tighter italic">Transaction <span className="text-cyan-400">Ledger</span></h1>
                    </div>
                    <ThemeToggle />
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by ID, Type, or Reason..."
                            className="w-full pl-12 pr-6 py-4 bg-slate-900/50 border border-white/5 rounded-2xl focus:outline-none focus:border-cyan-500/50 transition-all font-bold text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchTransactions}
                            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all"
                            title="Refresh Data"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card rounded-[2rem] overflow-hidden border border-white/5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-900/50">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Timestamp</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Operation</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Product ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Quantity</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Reason/Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Decrypting Ledger...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <AlertCircle className="w-12 h-12 text-slate-700" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No transactions recorded in this sector.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map((t) => (
                                        <tr key={t.transactionId} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <Clock className="w-4 h-4 text-slate-600" />
                                                    <span className="text-xs font-bold text-slate-400">{new Date(t.timestamp).toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${getTypeColor(t.type)}`}>
                                                    {getIcon(t.type)}
                                                    {t.type}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-mono text-[10px] text-cyan-500/70">{t.productId}</td>
                                            <td className="px-8 py-6">
                                                <span className={`text-sm font-black ${t.quantity > 0 ? 'text-emerald-400' : t.quantity < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                                                    {t.quantity > 0 ? `+${t.quantity}` : t.quantity}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-medium text-slate-400 line-clamp-1">{t.reason}</p>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionHistory;
