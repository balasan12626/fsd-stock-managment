import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { customerAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, ArrowRight, User, Mail, Lock } from 'lucide-react';

const CustomerSignup = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) return 'Password must be at least 8 characters long.';
        if (!hasUpperCase) return 'Password must contain at least one uppercase letter.';
        if (!hasNumber) return 'Password must contain at least one number.';
        if (!hasSpecialChar) return 'Password must contain at least one special character.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // BUG FIX #8: Password Complexity Validation
        const pwdError = validatePassword(formData.password);
        if (pwdError) {
            setError(pwdError);
            setLoading(false);
            return;
        }

        try {
            console.log('Attempting signup with:', { ...formData, password: '***' });
            const res = await customerAPI.register(formData);
            console.log('Signup success:', res.data);

            // Success! Store token and redirect
            if (res.data.success) {
                login(res.data.token, res.data.user.customerId, { ...res.data.user, role: 'customer' });
                navigate('/shop');
            } else {
                setError(res.data.message || 'Registration failed: Server rejected credentials');
            }
        } catch (err) {
            console.error('Signup Error:', err);
            const msg = err.response?.data?.message || err.response?.data?.error || 'CRITICAL LINK FAILURE: Authentication cluster unreachable';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent_50%)]"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>

            <div className="w-full max-w-md relative z-10 glass-card p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-500 mb-6 border border-emerald-500/20 shadow-inner">
                        <UserPlus className="w-10 h-10" />
                    </div>
                    <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Join TechVibe</h2>
                    <p className="text-slate-400 text-sm font-medium mt-2 tracking-wide">Enter the future of hardware acquisition</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-[10px] font-black uppercase tracking-widest leading-relaxed">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 ml-1 block">Legal Identity</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-4 py-4 pl-12 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-slate-900 transition-all"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 ml-1 block">Communication Link</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="email"
                                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-4 py-4 pl-12 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-slate-900 transition-all"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 ml-1 block">Security Key</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="password"
                                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-4 py-4 pl-12 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-slate-900 transition-all"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-[0.25em] rounded-2xl transition-all shadow-xl shadow-emerald-900/20 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 mt-10"
                    >
                        {loading ? 'Initializing...' : (
                            <>
                                Initialize Account <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-10 text-center text-slate-500 text-xs font-bold tracking-tight">
                    EXISTING USER?{' '}
                    <Link to="/shop/login" className="text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors ml-2">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default CustomerSignup;
