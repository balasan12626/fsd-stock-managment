import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Monitor } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const SellerLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await sellerAPI.login(formData);
            const { token, seller } = response.data || {};
            
            if (token && seller) {
                login(token, (seller.sellerId || seller.email), seller);
                console.log('[AUTH] Login matrix stable. Initiating state synchronization...');
                navigate('/sell/dashboard', { replace: true });
            } else {
                throw new Error('Communication link failure: Identity metadata missing.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-['Inter']" style={{ background: 'linear-gradient(135deg, var(--bg-gradient-start), var(--bg-gradient-mid), var(--bg-gradient-end))' }}>
            {/* Theme Toggle - Fixed Position */}
            <div className="fixed top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            {/* Ambient Background Glows */}
            <div className="absolute inset-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-pulse-slow" style={{ background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)', opacity: 0.15 }}></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-pulse-slow" style={{ background: 'radial-gradient(circle, var(--accent-secondary) 0%, transparent 70%)', opacity: 0.15 }}></div>
            </div>

            <div className="relative w-full max-w-[440px] glass-card rounded-[40px] p-10 animate-slide-up">
                {/* Glow Overlay */}
                <div className="absolute -top-[2px] -left-[2px] -right-[2px] h-[100px] rounded-t-[40px] pointer-events-none" style={{ background: 'linear-gradient(to bottom, var(--input-focus-glow), transparent)' }}></div>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', boxShadow: '0 0 20px var(--input-focus-glow)' }}>
                        <Monitor className="w-8 h-8" style={{ color: 'white' }} />
                    </div>
                    <h1 className="text-[32px] font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
                        Welcome Back
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Access your seller dashboard</p>
                </div>

                {error && (
                    <div className="px-4 py-3 rounded-xl mb-6 text-sm backdrop-blur-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fca5a5' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: 'var(--text-secondary)' }}>
                            Email
                        </label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors" style={{ color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3.5 login-input rounded-2xl focus:outline-none"
                                placeholder="your@email.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider ml-1" style={{ color: 'var(--text-secondary)' }}>
                            Password
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors" style={{ color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3.5 login-input rounded-2xl focus:outline-none"
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full relative group mt-4 overflow-hidden rounded-2xl transition-all duration-300 active:scale-[0.98] shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                    >
                        {/* BUG FIX #5: Improved button contrast and visibility */}
                        <div className="absolute inset-0 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:from-blue-500 group-hover:to-indigo-500"></div>
                        <div className="relative py-4 text-white font-black text-lg tracking-wider flex items-center justify-center">
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                'Sign In'
                            )}
                        </div>
                    </button>
                </form>

                <p className="mt-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    Don't have an account?{' '}
                    <button
                        onClick={() => navigate('/sell/register')}
                        className="font-semibold transition-colors decoration-blue-400/30 hover:underline underline-offset-4"
                        style={{ color: 'var(--accent-primary)' }}
                    >
                        Register here
                    </button>
                </p>
            </div>
        </div>
    );
};

export default SellerLogin;

