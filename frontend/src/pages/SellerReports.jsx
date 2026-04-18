import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import {
    BarChart3,
    PieChart,
    Download,
    FileText,
    DollarSign,
    Package,
    ArrowLeft,
    TrendingUp,
    AlertCircle
} from 'lucide-react';

// Use window.Chart from CDN fallback for maximum stability
const ChartJS = window.Chart;

const SellerReports = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [forecast, setForecast] = useState(null); // AI Forecast State
    const [loading, setLoading] = useState(true);
    const barChartRef = useRef(null);
    const pieChartRef = useRef(null);
    const lineChartRef = useRef(null); // AI Chart Ref
    const barInstance = useRef(null);
    const pieInstance = useRef(null);
    const lineInstance = useRef(null); // AI Chart Instance

    useEffect(() => {
        fetchReport();
    }, []);

    useEffect(() => {
        if (data && ChartJS) {
            renderCharts();
        }
        return () => {
            if (barInstance.current) barInstance.current.destroy();
            if (pieInstance.current) pieInstance.current.destroy();
            if (lineInstance.current) lineInstance.current.destroy();
        };
    }, [data, forecast]); // Depend on forecast

    // ... renderCharts logic (already updated in previous steps, but need to be sure) ... 
    // Wait, I updated renderCharts in Step 631. That part is likely fine if I didn't overwrite it. 
    // Step 631 modified renderCharts. Step 634 modified the BOTTOM. 
    // I need to check renderCharts again to be safe? 
    // No, Step 631 output shows I updated renderCharts successfully.

    // I will only update the fetchReport and state definition here.

    const fetchReport = async () => {
        try {
            setLoading(true);
            const [reportRes, forecastRes] = await Promise.all([
                sellerAPI.getReport(),
                sellerAPI.getForecast(30)
            ]);

            if (reportRes.data.success) {
                setData(reportRes.data.report);
            }
            if (forecastRes.data.success) {
                setForecast(forecastRes.data.forecast);
            }
        } catch (err) {
            console.error('Failed to fetch seller data:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderCharts = () => {
        if (barInstance.current) barInstance.current.destroy();
        if (pieInstance.current) pieInstance.current.destroy();
        if (lineInstance.current) lineInstance.current.destroy();

        const barCtx = barChartRef.current.getContext('2d');
        const pieCtx = pieChartRef.current.getContext('2d');

        // Bar Chart
        barInstance.current = new ChartJS(barCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(data.categoryDistribution),
                datasets: [{
                    label: 'Sales by Category',
                    data: Object.values(data.categoryDistribution),
                    backgroundColor: 'rgba(6, 182, 212, 0.5)',
                    borderColor: '#06b6d4',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
                    x: { grid: { display: false }, ticks: { color: '#64748b' } }
                }
            }
        });

        // Pie Chart
        pieInstance.current = new ChartJS(pieCtx, {
            type: 'doughnut',
            data: {
                labels: ['In Stock', 'Low Stock'],
                datasets: [{
                    data: [data.productCount - data.lowStockCount, data.lowStockCount],
                    backgroundColor: ['rgba(16, 185, 129, 0.6)', 'rgba(245, 158, 11, 0.6)'],
                    borderWidth: 0
                }]
            },
            options: {
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 20 } } }
            }
        });

        // Line Chart (AI Forecast)
        if (lineChartRef.current && forecast) {
            const lineCtx = lineChartRef.current.getContext('2d');
            lineInstance.current = new ChartJS(lineCtx, {
                type: 'line',
                data: {
                    labels: forecast.map(f => f.date),
                    datasets: [{
                        label: 'Predicted Demand (AI)',
                        data: forecast.map(f => f.predicted_quantity),
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#8b5cf6'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: '#94a3b8' } },
                        tooltip: { mode: 'index', intersect: false }
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
                        x: { grid: { display: false }, ticks: { color: '#64748b' } }
                    }
                }
            });
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-center p-6">
                <div className="glass-card p-12 rounded-[3rem] border border-white/5 bg-slate-900/50 max-w-md w-full">
                    <FileText className="w-24 h-24 text-slate-700 mx-auto mb-8" />
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">No Data Stream</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-8">Performance metrics unavailable. System requires active sales data to generate analysis.</p>
                    <button
                        onClick={() => navigate('/sell/dashboard')}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-xs rounded-xl transition-all"
                    >
                        Return to Dashboard
                    </button>
                    <button
                        onClick={fetchReport}
                        className="mt-4 w-full py-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 font-black uppercase tracking-[0.2em] text-xs rounded-xl transition-all"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen cosmic-grid text-slate-200 selection:bg-cyan-500/30">
            <nav className="backdrop-blur-2xl sticky top-0 z-50 border-b border-white/5 bg-slate-950/20">
                <div className="max-w-7xl mx-auto px-4 h-22 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/sell/dashboard')} className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl font-black italic tracking-tighter uppercase">Performance <span className="text-cyan-400">Hub</span></h1>
                    </div>
                    <ThemeToggle />
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Revenue', value: `$${data.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'cyan' },
                        { label: 'Total Inventory', value: data.totalQuantity, icon: Package, color: 'purple' },
                        { label: 'Active SKUs', value: data.productCount, icon: TrendingUp, color: 'emerald' },
                        { label: 'Low Stock Alerts', value: data.lowStockCount, icon: AlertCircle, color: 'amber' }
                    ].map((stat, i) => (
                        <div key={i} className="glass-card rounded-3xl p-6 relative overflow-hidden group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{stat.label}</p>
                                    <h3 className="text-2xl font-black text-white">{stat.value}</h3>
                                </div>
                                <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-400`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* AI FORECAST SECTION */}
                <div className="glass-card rounded-[2.5rem] p-10 mb-10 border border-violet-500/20 bg-violet-900/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <TrendingUp className="w-48 h-48 text-violet-500" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2 flex items-center gap-3 relative z-10">
                        <TrendingUp className="w-6 h-6 text-violet-500" />
                        AI Demand Forecast
                    </h3>
                    <p className="text-slate-400 text-sm font-medium mb-8 max-w-2xl relative z-10">
                        Prophet-powered analysis predicting inventory requirements for the next 30 days based on historical transaction velocity.
                    </p>
                    <div className="h-80 relative z-10">
                        {!ChartJS && <p className="text-xs text-rose-400 font-bold uppercase tracking-widest text-center mt-20">Offline Engine Fault: Re-linking Core...</p>}
                        <canvas ref={lineChartRef}></canvas>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="glass-card rounded-[2.5rem] p-10">
                        <h3 className="text-lg font-black uppercase tracking-widest text-white mb-8 flex items-center gap-3">
                            <BarChart3 className="w-5 h-5 text-cyan-500" />
                            Sales Distribution
                        </h3>
                        <div className="h-80 relative">
                            {!ChartJS && <p className="text-xs text-rose-400 font-bold uppercase tracking-widest text-center mt-20">Offline Engine Fault: Re-linking Core...</p>}
                            <canvas ref={barChartRef}></canvas>
                        </div>
                    </div>

                    <div className="glass-card rounded-[2.5rem] p-10">
                        <h3 className="text-lg font-black uppercase tracking-widest text-white mb-8 flex items-center gap-3">
                            <PieChart className="w-5 h-5 text-purple-500" />
                            Inventory Health
                        </h3>
                        <div className="h-80 relative flex items-center justify-center">
                            {!ChartJS && <p className="text-xs text-rose-400 font-bold uppercase tracking-widest text-center">Engine Offline</p>}
                            <canvas ref={pieChartRef}></canvas>
                        </div>
                    </div>
                </div>

                {data.lowStockCount > 0 && (
                    <div className="mt-12 glass-card rounded-[2.5rem] p-10 border-l-8 border-amber-500/50">
                        <h3 className="text-lg font-black uppercase tracking-widest text-white mb-6">Critical Actions Required</h3>
                        <div className="space-y-4">
                            {data.lowStockItems.map(item => (
                                <div key={item.productId} className="flex items-center justify-between p-6 bg-slate-900/50 rounded-2xl border border-white/5">
                                    <span className="font-bold text-white uppercase italic tracking-tighter">{item.title}</span>
                                    <span className="text-amber-500 font-black px-4 py-2 bg-amber-500/10 rounded-xl text-xs">ONLY {item.quantity} LEFT</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerReports;
