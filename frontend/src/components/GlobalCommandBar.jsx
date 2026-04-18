import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Briefcase, Settings, Zap } from 'lucide-react';

const GlobalCommandBar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Hide on checkout for conversion
    if (location.pathname.includes('checkout')) return null;

    return (
        <div className="w-full bg-slate-950 border-b border-white/5 py-2 px-6 flex justify-between items-center relative z-[1000] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-transparent to-accent-secondary/5 opacity-50" />
            
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                <div className="w-6 h-6 rounded bg-accent-primary flex items-center justify-center group-hover:rotate-12 transition-transform shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">a6b <span className="text-accent-primary">Stock</span></span>
            </div>

            <div className="flex items-center gap-4 md:gap-8">
                <button 
                    onClick={() => navigate('/shop')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        location.pathname.startsWith('/shop') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:text-white'
                    }`}
                >
                    <User className="w-3 h-3" />
                    <span className="hidden sm:inline">Customer</span>
                </button>

                <button 
                    onClick={() => navigate('/sell/dashboard')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        location.pathname.startsWith('/sell') ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:text-white'
                    }`}
                >
                    <Briefcase className="w-3 h-3" />
                    <span className="hidden sm:inline">Seller</span>
                </button>

                <button 
                    onClick={() => navigate('/admin/dashboard')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        location.pathname.startsWith('/admin') ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-slate-500 hover:text-white'
                    }`}
                >
                    <Settings className="w-3 h-3" />
                    <span className="hidden sm:inline">Admin</span>
                </button>
            </div>
            
            <div className="hidden lg:flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Uplink Stable</span>
            </div>
        </div>
    );
};

export default GlobalCommandBar;
