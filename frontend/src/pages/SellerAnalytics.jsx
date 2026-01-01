import React, { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    BarChart3, LineChart, PieChart, Download, FileText,
    TrendingUp, Users, Package, DollarSign, Award,
    Calendar, ChevronRight, Search, ArrowLeft, ShieldAlert,
    ExternalLink, Medal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Global Vendor Links (CDN Fallbacks)
const ChartJS = window.Chart;
const jsPDF = window.jspdf ? window.jspdf.jsPDF : null;
const Papa = window.Papa;
const html2canvas = window.html2canvas;

const SellerAnalytics = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const reportRef = useRef();

    // Chart Refs
    const barChartRef = useRef(null);
    const pieChartRef = useRef(null);
    const lineChartRef = useRef(null);

    // Chart Instances
    const chartInstances = useRef({ bar: null, pie: null, line: null });

    useEffect(() => {
        fetchReport();
    }, []);

    useEffect(() => {
        if (reportData && ChartJS) {
            renderCharts();
        }
        return () => {
            Object.values(chartInstances.current).forEach(instance => {
                if (instance) instance.destroy();
            });
        };
    }, [reportData]);

    const renderCharts = () => {
        // Destroy existing
        Object.values(chartInstances.current).forEach(instance => {
            if (instance) instance.destroy();
        });

        const report = reportData.report || [];
        const topSellers = report.slice(0, 5);

        // Bar Chart
        if (barChartRef.current) {
            const ctx = barChartRef.current.getContext('2d');
            chartInstances.current.bar = new ChartJS(ctx, {
                type: 'bar',
                data: {
                    labels: topSellers.map(s => s.companyName || s.name || 'Unknown'),
                    datasets: [{
                        label: 'Revenue ($)',
                        data: topSellers.map(s => s.totalRevenue || 0),
                        backgroundColor: 'rgba(6, 182, 212, 0.8)',
                        hoverBackgroundColor: '#22d3ee',
                        borderRadius: 6,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: '#94a3b8', font: { family: 'Inter', weight: 600 } },
                            border: { display: false }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#94a3b8', font: { family: 'Inter', weight: 600 } },
                            border: { display: false }
                        }
                    }
                }
            });
        }

        // Pie Chart (Stock Distribution)
        if (pieChartRef.current) {
            const ctx = pieChartRef.current.getContext('2d');
            chartInstances.current.pie = new ChartJS(ctx, {
                type: 'doughnut',
                data: {
                    labels: topSellers.map(s => s.companyName || s.name),
                    datasets: [{
                        data: topSellers.map(s => s.totalQuantity || 0),
                        backgroundColor: [
                            '#06b6d4', // Cyan
                            '#8b5cf6', // Violet
                            '#d946ef', // Fuchsia
                            '#f59e0b', // Amber
                            '#10b981'  // Emerald
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#94a3b8',
                                padding: 20,
                                font: { family: 'Inter', size: 11, weight: 600 },
                                usePointStyle: true
                            }
                        }
                    },
                    cutout: '75%',
                    borderWidth: 0
                }
            });
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getPerformanceReport();
            setReportData(res.data);
        } catch (error) {
            console.error('Failed to fetch report:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (!reportData || !Papa) return;
        const csv = Papa.unparse(reportData.report);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'seller_performance_report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = async () => {
        if (!reportData || !jsPDF || !html2canvas) {
            alert('PDF Engine Linking... Please wait or refresh.');
            return;
        }
        const canvas = await html2canvas(reportRef.current, { backgroundColor: '#0f172a' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('performance_report.pdf');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin glow-cyan"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-500">Processing Data Units...</p>
                </div>
            </div>
        );
    }

    if (!reportData) return null;

    return (
        <div className="min-h-screen bg-[#0B1020] text-slate-200 font-sans selection:bg-cyan-500/30"
            style={{
                backgroundImage: 'radial-gradient(circle at 50% 0%, #1a223f 0%, #0B1020 60%), url("https://grainy-gradients.vercel.app/noise.svg")',
                backgroundBlendMode: 'screen, overlay'
            }}>

            <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5 bg-[#0B1020]/80">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all group"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 group-hover:-translate-x-1 transition-all" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white">Market <span className="text-cyan-400">Intelligence</span></h1>
                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Global Analytics Sector</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={exportToCSV} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white">
                            <FileText className="w-4 h-4 text-emerald-400" />
                            CSV
                        </button>
                        <button onClick={exportToPDF} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-cyan-900/40">
                            <Download className="w-4 h-4" />
                            Export PDF
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-10" ref={reportRef}>
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {[
                        { label: 'Network Revenue', value: `$${(reportData.totalNetworkRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'cyan', gradient: 'from-cyan-500/20 to-blue-500/5' },
                        { label: 'Total Inventory', value: (reportData.totalNetworkQuantity || 0).toLocaleString(), icon: Package, color: 'purple', gradient: 'from-purple-500/20 to-pink-500/5' },
                        { label: 'Active Sellers', value: reportData.report.length, icon: Users, color: 'emerald', gradient: 'from-emerald-500/20 to-teal-500/5' }
                    ].map((m, i) => (
                        <div key={i} className={`relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br ${m.gradient} p-6 backdrop-blur-md transition-all hover:border-white/10 hover:shadow-2xl hover:shadow-${m.color}-500/10`}>
                            <div className={`absolute -right-6 -top-6 p-4 rounded-full bg-${m.color}-500/10 text-${m.color}-500/20 blur-xl`}>
                                <m.icon className="w-32 h-32" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{m.label}</p>
                                <h3 className="text-3xl font-bold text-white tracking-tight">{m.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div className="rounded-2xl border border-white/5 bg-[#131b33]/80 p-8 shadow-xl backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-3">
                                <TrendingUp className="w-4 h-4 text-cyan-400" />
                                Revenue Spectrum
                            </h3>
                        </div>
                        <div className="h-64 relative">
                            {!ChartJS && <p className="text-center mt-20 text-rose-400 font-bold uppercase tracking-widest animate-pulse">Linking Engine components...</p>}
                            <canvas ref={barChartRef}></canvas>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-[#131b33]/80 p-8 shadow-xl backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-3">
                                <PieChart className="w-4 h-4 text-purple-400" />
                                Inventory Allocation
                            </h3>
                        </div>
                        <div className="h-64 relative">
                            <canvas ref={pieChartRef}></canvas>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="rounded-2xl border border-white/5 bg-[#131b33]/60 shadow-xl overflow-hidden backdrop-blur-sm">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-400" />
                            Top Performers
                        </h3>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Filter sellers..."
                                className="w-64 pl-10 pr-4 py-2.5 bg-[#0B1020] border border-white/10 rounded-lg text-sm text-slate-300 placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/[0.02]">
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Rank</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Seller Entity</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">SKU Count</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Inventory</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Revenue</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {reportData.report
                                    .filter(s => (s.companyName || s.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((s, i) => (
                                        <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-500'
                                                    }`}>
                                                    {i + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-bold text-slate-200 group-hover:text-white transition-colors">{s.companyName || s.name}</p>
                                                    <p className="text-[10px] font-mono text-slate-500 uppercase">{s.sellerId.slice(0, 8)}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-medium text-slate-400">{s.productCount}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-medium text-slate-400">{s.totalQuantity}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-bold text-white tracking-tight">${s.totalRevenue.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wide">
                                                    Active
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerAnalytics;
