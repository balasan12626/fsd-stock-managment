import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Building2, Mail, Phone, MapPin, Lock, FileText, Upload, Sparkles, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const SellerRegister = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        companyName: '',
        gstNumber: '',
        email: '',
        phone: '',
        address: '',
        password: '',
    });
    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) return 'Security requirement: Password < 8 characters.';
        if (!hasUpperCase) return 'Security requirement: Missing uppercase unit.';
        if (!hasNumber) return 'Security requirement: Missing numeric module.';
        if (!hasSpecialChar) return 'Security requirement: Missing special character.';
        return null;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Logo size must be less than 5MB');
                return;
            }
            setLogo(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleNext = () => {
        if (!formData.companyName || !formData.gstNumber || !formData.email) {
            setError('Please fill all required fields');
            return;
        }
        setError('');
        setStep(2);
    };

    const handleBack = () => {
        setError('');
        setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // BUG FIX #8: Password Complexity Validation
        const pwdError = validatePassword(formData.password);
        if (pwdError) {
            setError(pwdError);
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (logo) data.append('logo', logo);

            const response = await sellerAPI.register(data);
            const { token, seller } = response.data;
            login(token, seller.sellerId, seller);
            navigate('/sell/dashboard');
        } catch (err) {
            const errorMessage = err.response?.data?.stack || err.response?.data?.error || err.response?.data?.message || 'SYSTEM ERROR: Registration node failure';
            setError(errorMessage);
            console.error('Registration error details:', err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--bg-gradient-start), var(--bg-gradient-mid), var(--bg-gradient-end))' }}>
            {/* Theme Toggle */}
            <div className="fixed top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow" style={{ background: 'var(--accent-primary)', opacity: 0.1 }}></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow" style={{ background: 'var(--accent-secondary)', opacity: 0.1 }}></div>
            </div>

            <div className="relative glass-card rounded-3xl shadow-2xl p-8 w-full max-w-2xl animate-slide-up">
                <div className="flex items-center justify-center mb-6">
                    <div className="p-3 rounded-2xl shadow-lg" style={{ background: 'linear-gradient(90deg, rgb(var(--accent-primary)), rgb(var(--accent-secondary)))', boxShadow: '0 0 20px var(--input-focus-glow)' }}>
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-center mb-2 bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }}>
                    Seller Registration
                </h1>
                <p className="text-center mb-6" style={{ color: 'var(--text-secondary)' }}>Join our marketplace and start selling today</p>

                {/* Step Indicator */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2" style={{ color: step >= 1 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 text-white shadow-lg" style={{ background: step >= 1 ? 'linear-gradient(90deg, rgb(var(--accent-primary)), rgb(var(--accent-secondary)))' : 'var(--bg-tertiary)', color: step >= 1 ? 'white' : 'var(--text-muted)' }}>
                                {step > 1 ? <Check className="w-5 h-5" /> : '1'}
                            </div>
                            <span className="hidden sm:block font-medium">Company Info</span>
                        </div>
                        <div className="w-16 h-1 rounded-full transition-all duration-300" style={{ background: step >= 2 ? 'linear-gradient(90deg, rgb(var(--accent-primary)), rgb(var(--accent-secondary)))' : 'var(--bg-tertiary)' }}></div>
                        <div className="flex items-center gap-2" style={{ color: step >= 2 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 shadow-lg" style={{ background: step >= 2 ? 'linear-gradient(90deg, rgb(var(--accent-primary)), rgb(var(--accent-secondary)))' : 'var(--bg-tertiary)', color: step >= 2 ? 'white' : 'var(--text-muted)' }}>
                                2
                            </div>
                            <span className="hidden sm:block font-medium">Account Details</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="px-4 py-3 rounded-xl mb-4 backdrop-blur-sm animate-fade-in" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fca5a5' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Step 1: Company Information */}
                    {step === 1 && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                        <Building2 className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                                        Company Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 login-input rounded-xl transition-all duration-300"
                                        placeholder="Enter company name"
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                        <FileText className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                                        GST Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="gstNumber"
                                        value={formData.gstNumber}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 login-input rounded-xl transition-all duration-300"
                                        placeholder="Enter GST number"
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                    <Mail className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 login-input rounded-xl transition-all duration-300"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                    <Phone className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 login-input rounded-xl transition-all duration-300"
                                    placeholder="+91 1234567890"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleNext}
                                className="w-full text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                style={{ background: 'linear-gradient(90deg, rgb(var(--accent-primary)), rgb(var(--accent-secondary)))' }}
                            >
                                Next Step
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Account Details */}
                    {step === 2 && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="group">
                                <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                    <MapPin className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-3 login-input rounded-xl transition-all duration-300 resize-none"
                                    placeholder="Enter your business address"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                    <Lock className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength="6"
                                    className="w-full px-4 py-3 login-input rounded-xl transition-all duration-300"
                                    placeholder="Min. 6 characters"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                    <Upload className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                                    Company Logo
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="w-full px-4 py-3 login-input rounded-xl transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-white file:cursor-pointer file:transition-all"
                                    style={{
                                        '--file-bg': 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))'
                                    }}
                                />
                                {logoPreview && (
                                    <div className="mt-4 flex justify-center">
                                        <img
                                            src={logoPreview}
                                            alt="Logo preview"
                                            className="h-24 object-contain p-3 rounded-xl shadow-lg"
                                            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="flex-1 font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                                    style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 text-white font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    style={{ background: 'linear-gradient(90deg, rgb(var(--accent-primary)), rgb(var(--accent-secondary)))' }}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Registering...
                                        </span>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                <p className="mt-6 text-center" style={{ color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <button
                        onClick={() => navigate('/sell/login')}
                        className="font-medium transition-colors duration-200 hover:underline"
                        style={{ color: 'var(--accent-primary)' }}
                    >
                        Login here
                    </button>
                </p>
            </div>
        </div>
    );
};

export default SellerRegister;
