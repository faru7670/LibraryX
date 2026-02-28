import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Library, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import AnimatedBackground from '../../components/three/AnimatedBackground';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [department, setDepartment] = useState('Computer Science');
    const [role, setRole] = useState('student');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Mathematics', 'Physics', 'Chemistry', 'General'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) { setError('Passwords do not match'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setIsLoading(true);
        const result = await register(name, email, password, role, department);
        setIsLoading(false);
        if (result.success) { navigate('/dashboard'); } else { setError(result.error); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <AnimatedBackground />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 shadow-2xl shadow-violet-500/40 mb-5 ring-4 ring-white/10">
                        <Library className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">LibraryX</h1>
                    <p className="text-gray-400 text-sm mt-2">Create your account</p>
                </div>

                <div className="glass-card p-8 backdrop-blur-xl border-white/[0.08]">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Get Started 🚀</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Join the smart library system</p>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />{error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className="input-glass w-full pl-11" required disabled={isLoading} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@college.edu" className="input-glass w-full pl-11" required disabled={isLoading} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="hidden">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Role</label>
                                <select value={role} onChange={e => setRole(e.target.value)} className="input-glass w-full" disabled={isLoading}>
                                    <option value="student">Student</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Department</label>
                                <select value={department} onChange={e => setDepartment(e.target.value)} className="input-glass w-full" disabled={isLoading}>
                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" className="input-glass w-full pl-11 pr-11" required disabled={isLoading} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className="input-glass w-full pl-11" required disabled={isLoading} />
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 hover:opacity-90 transition-all duration-300 shadow-lg shadow-violet-500/25 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
