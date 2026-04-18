import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const AdminLogin = () => {
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
            const response = await adminAPI.login(formData);
            const { token, admin } = response.data || {};
            
            if (token && admin) {
                login(token, admin.adminId, admin);
                console.log(`[AUTH] Admin portal access verified for ${admin.role}. Synchronizing...`);
                
                const target = admin.role === 'superadmin' ? '/superadmin/dashboard' : '/admin/dashboard';
                navigate(target, { replace: true });
            } else {
                throw new Error('Terminal Failure: Identity matrix incomplete.');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Terminal Failure: Uplink to backend interrupted.';
            setError(errorMessage);

            // Helpful logging for the console
            if (err.response?.status === 401) {
                console.warn('[AUTH] Access Denied: Verified Identity Required.');
            }
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
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-pulse-slow" style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', opacity: 0.15 }}></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-pulse-slow" style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)', opacity: 0.15 }}></div>
            </div>

            <div className="relative w-full max-w-[440px] glass-card rounded-[40px] p-10 animate-slide-up">
                {/* Glow Overlay */}
                <div className="absolute -top-[2px] -left-[2px] -right-[2px] h-[100px] rounded-t-[40px] pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(139, 92, 246, 0.3), transparent)' }}></div>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)' }}>
                        <Shield className="w-8 h-8" style={{ color: 'white' }} />
                    </div>
                    <h1 className="text-[32px] font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
                        Admin Portal
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Secure administrator access</p>
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
                                placeholder="admin@example.com"
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
                                placeholder="Enter admin password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full relative group mt-4 overflow-hidden rounded-full p-[2px]"
                    >
                        <div className="absolute inset-0 transition-all duration-300 group-hover:opacity-80" style={{ background: 'linear-gradient(90deg, #8b5cf6, #ec4899)' }}></div>
                        <div className="relative transition-all duration-300 rounded-full py-4 text-white font-bold text-lg tracking-wide shadow-lg flex items-center justify-center" style={{ background: 'rgba(10, 15, 31, 0.1)' }}>
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                'Access Admin Panel'
                            )}
                        </div>
                    </button>
                </form>

                <p className="mt-8 text-center text-sm flex flex-col gap-3" style={{ color: 'var(--text-muted)' }}>
                    <div>
                        Need admin access?{' '}
                        <button
                            onClick={() => navigate('/admin/register')}
                            className="font-semibold transition-colors decoration-purple-400/30 hover:underline underline-offset-4"
                            style={{ color: '#8b5cf6' }}
                        >
                            Register here
                        </button>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                        <button
                            onClick={() => navigate('/shop')}
                            className="text-xs uppercase tracking-[0.2em] font-black opacity-60 hover:opacity-100 transition-opacity"
                        >
                            Return to Shopping Repository
                        </button>
                    </div>
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
