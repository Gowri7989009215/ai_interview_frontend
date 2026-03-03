import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Signup() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields');
        if (form.password !== form.confirm) return toast.error('Passwords do not match');
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters');

        setLoading(true);
        try {
            await register(form.name, form.email, form.password);
            toast.success('Account created! Welcome to ProInterview AI 🎉');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const strength = form.password.length === 0 ? 0
        : form.password.length < 6 ? 1
            : form.password.length < 10 ? 2 : 3;

    const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500'];
    const strengthLabels = ['', 'Weak', 'Good', 'Strong'];

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center px-6 py-10 relative overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/15 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl"></div>

            <div className="w-full max-w-md relative">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-black">PI</div>
                        <span className="text-2xl font-bold text-white">ProInterview <span className="text-gradient">AI</span></span>
                    </Link>
                    <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-gray-400">Start practicing interviews for free today</p>
                </div>

                <div className="glass-card">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                placeholder="John Doe"
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                placeholder="you@example.com"
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                placeholder="Min. 6 characters"
                                className="input-field"
                                required
                            />
                            {form.password && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex gap-1 flex-1">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-dark-400'}`}></div>
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-400">{strengthLabels[strength]}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                            <input
                                type="password"
                                value={form.confirm}
                                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                                placeholder="Repeat password"
                                className="input-field"
                                required
                            />
                            {form.confirm && form.password !== form.confirm && (
                                <p className="text-red-400 text-xs mt-1">Passwords don't match</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating account...
                                </>
                            ) : 'Create Account →'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-gray-600 text-xs mt-6">
                    By signing up you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
}
