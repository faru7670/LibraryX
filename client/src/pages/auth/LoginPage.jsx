import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Library, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import AnimatedBackground from '../../components/three/AnimatedBackground';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        setIsLoading(true);
        const result = await login(email, password);
        setIsLoading(false);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!email) {
            setError('Please enter your email address first.');
            return;
        }

        setIsLoading(true);
        const result = await resetPassword(email);
        setIsLoading(false);

        if (result.success) {
            setSuccessMessage('Password reset email sent! Check your inbox.');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <AnimatedBackground />

            {/* Decorative glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 shadow-2xl shadow-violet-500/40 mb-5 ring-4 ring-white/10">
                        <Library className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">LibraryX</h1>
                    <p className="text-gray-400 text-sm mt-2 tracking-wide">Smart Library Management System</p>
                </div>

                {/* Login Card */}
                <div className="glass-card p-8 backdrop-blur-xl border-white/[0.08]">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Welcome back ✨</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Sign in to manage your library</p>

                    {successMessage && (
                        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                            {successMessage}
                        </div>
                    )}
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@college.edu"
                                    className="input-glass w-full pl-11"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-glass w-full pl-11 pr-11"
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm mb-4">
                            <label className="flex items-center gap-2 text-gray-500 dark:text-gray-400 cursor-pointer">
                                <input type="checkbox" className="rounded border-gray-600 bg-transparent text-violet-500 focus:ring-violet-500/30" />
                                <span className="text-xs">Remember me</span>
                            </label>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                disabled={isLoading}
                                className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 font-medium transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 hover:opacity-90 transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Create one</Link>
                    </div>
                </div>

                <p className="text-center text-[11px] text-gray-600 mt-6">© 2026 LibraryX · Built for modern libraries</p>
            </div>
        </div>
    );
}
