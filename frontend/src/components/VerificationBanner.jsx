import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
import { customerAPI } from '../services/api';

const VerificationBanner = () => {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    // Only show for customers who are not verified
    if (!user || user.role !== 'customer' || user.isVerified) return null;

    const handleVerify = async () => {
        setLoading(true);
        try {
            await customerAPI.verifyEmail(user.email);
            setDone(true);
            // Update context state
            const updatedUser = { ...user, isVerified: true };
            login(localStorage.getItem('token'), localStorage.getItem('userId'), updatedUser);
        } catch (err) {
            console.error('Verification Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-cyan-500/10 border-b border-cyan-500/20 py-3 px-6 flex justify-between items-center animate-pulse-slow">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Account Unverified</h4>
                    <p className="text-[9px] text-cyan-400/60 uppercase font-bold">Limited Protocol access. Synchronize your email node now.</p>
                </div>
            </div>

            <button 
                disabled={loading || done}
                onClick={handleVerify}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : done ? <CheckCircle2 className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                {done ? 'Verified' : 'Verify Node'}
            </button>
        </div>
    );
};

export default VerificationBanner;
