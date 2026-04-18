import React, { useState, useEffect } from 'react';
import { publicAPI } from '../services/api';
import { Users, Package, DollarSign, Activity } from 'lucide-react';

const LiveStatsBanner = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await publicAPI.getStats();
                setStats(res.data.stats);
            } catch (err) {
                console.error('Stats Sync Error:', err);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, []);

    if (!stats) return null;

    return (
        <div className="w-full bg-slate-950/40 backdrop-blur-xl border-y border-white/5 py-4 overflow-hidden relative group">
            <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center gap-6 md:gap-12 relative z-10">
                <div className="flex items-center gap-3 group/stat">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover/stat:text-emerald-400 transition-colors">
                       {stats.activeSellers} SELLERS SYNCED
                   </span>
                </div>

                <div className="h-4 w-[1px] bg-white/10 hidden md:block" />

                <div className="flex items-center gap-3 group/stat">
                   <Package className="w-4 h-4 text-cyan-400" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover/stat:text-cyan-400 transition-colors">
                       {stats.newProducts} ASSETS DEPLOYED
                   </span>
                </div>

                <div className="h-4 w-[1px] bg-white/10 hidden md:block" />

                <div className="flex items-center gap-3 group/stat">
                   <DollarSign className="w-4 h-4 text-purple-400" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover/stat:text-purple-400 transition-colors">
                       ₹{stats.revenueToday} PROCESSED
                   </span>
                </div>

                <div className="h-4 w-[1px] bg-white/10 hidden md:block" />

                <div className="flex items-center gap-3 group/stat">
                   <Activity className="w-4 h-4 text-emerald-400" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover/stat:text-emerald-400 transition-colors">
                       {stats.uptime} SYSTEM VITAL
                   </span>
                </div>
            </div>
            
            {/* Background scanning line effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="h-full w-[2px] bg-emerald-500/10 blur-[2px] absolute top-0 left-0 animate-[scan_8s_linear_infinite]" 
                     style={{
                         animation: 'scan 15s linear infinite'
                     }} 
                />
            </div>
            
            <style jsx>{`
                @keyframes scan {
                    0% { transform: translateX(-100vw); }
                    100% { transform: translateX(100vw); }
                }
            `}</style>
        </div>
    );
};

export default LiveStatsBanner;
