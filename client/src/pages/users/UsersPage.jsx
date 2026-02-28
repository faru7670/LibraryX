import { useState, useEffect } from 'react';
import { Users as UsersIcon, Shield, BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getIssues } from '../../services/issueService';
import { createStaffAccount } from '../../services/adminAuthService';
import { UserPlus, Mail, Lock, User, CheckCircle, X } from 'lucide-react';

export default function UsersPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    // Add Staff Modal State
    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
    const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', role: 'faculty', department: 'General' });
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const [createSuccess, setCreateSuccess] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersSnap, issuesData] = await Promise.all([
                getDocs(collection(db, 'users')),
                getIssues('admin', user?.uid),
            ]);
            setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
            setIssues(issuesData);
        } catch (err) {
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        setCreateError('');
        setIsCreating(true);

        if (staffForm.password.length < 6) {
            setCreateError('Password must be at least 6 characters');
            setIsCreating(false);
            return;
        }

        const result = await createStaffAccount(
            staffForm.email,
            staffForm.password,
            staffForm.name,
            staffForm.role,
            staffForm.department
        );

        setIsCreating(false);

        if (result.success) {
            setCreateSuccess(true);
            setStaffForm({ name: '', email: '', password: '', role: 'faculty', department: 'General' });
            fetchData(); // Refresh list
            setTimeout(() => {
                setCreateSuccess(false);
                setIsAddStaffOpen(false);
            }, 2000);
        } else {
            setCreateError(result.error);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
    }

    const students = users.filter(u => u.role === 'student');
    const staff = users.filter(u => u.role !== 'student');
    const getBookCount = (uid) => issues.filter(i => i.userId === uid && i.status !== 'returned').length;

    return (
        <div className="page-enter space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-900 dark:text-white">User Management 👥</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{users.length} registered users</p>
            </div>

            {/* Staff */}
            <div className="glass-card p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-500" /> Staff ({staff.length})
                    </h3>
                    {(user?.role === 'admin' || user?.role === 'librarian') && (
                        <button
                            onClick={() => setIsAddStaffOpen(true)}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
                        >
                            <UserPlus className="w-4 h-4" /> Add Staff Member
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {staff.map(u => (
                        <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-purple-50/30 dark:bg-purple-900/10 border border-purple-200/20 dark:border-purple-800/20">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">{u.name?.charAt(0) || '?'}</div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{u.name}</p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                            </div>
                            <span className="badge badge-info ml-auto capitalize">{u.role}</span>
                        </div>
                    ))}
                    {staff.length === 0 && <p className="text-gray-400 text-sm">No staff members found.</p>}
                </div>
            </div>

            {/* Students */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-gray-200/20 dark:border-gray-700/30">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <UsersIcon className="w-5 h-5 text-blue-500" /> Students ({students.length})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-surface-700/30">
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Name</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Email</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Department</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Active Books</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(u => (
                                <tr key={u.id} className="border-b border-gray-100/30 dark:border-gray-700/20 hover:bg-gray-50/30 dark:hover:bg-surface-700/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-semibold">{u.name?.charAt(0) || '?'}</div>
                                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{u.email}</td>
                                    <td className="px-6 py-4"><span className="badge badge-info">{u.department || 'General'}</span></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="w-3.5 h-3.5 text-primary-500" />
                                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{getBookCount(u.id)}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">No students registered yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Staff Modal */}
            {isAddStaffOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsAddStaffOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-purple-500" /> Add New Staff
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">Create an account for Faculty or Admin via email and password.</p>

                        {createSuccess ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center">
                                <CheckCircle className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Staff Created!</h3>
                                <p className="text-gray-500 text-sm mt-1">The account has been added successfully.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleCreateStaff} className="space-y-4">
                                {createError && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                        {createError}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input type="text" value={staffForm.name} onChange={e => setStaffForm(p => ({ ...p, name: e.target.value }))} className="input-glass w-full pl-10" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input type="email" value={staffForm.email} onChange={e => setStaffForm(p => ({ ...p, email: e.target.value }))} className="input-glass w-full pl-10" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input type="text" value={staffForm.password} onChange={e => setStaffForm(p => ({ ...p, password: e.target.value }))} className="input-glass w-full pl-10" placeholder="Provide a temporary password" required minLength="6" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Role</label>
                                        <select value={staffForm.role} onChange={e => setStaffForm(p => ({ ...p, role: e.target.value }))} className="input-glass w-full">
                                            <option value="faculty">Faculty</option>
                                            <option value="librarian">Librarian</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Department</label>
                                        <input type="text" value={staffForm.department} onChange={e => setStaffForm(p => ({ ...p, department: e.target.value }))} className="input-glass w-full" placeholder="e.g. Science" />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button type="submit" disabled={isCreating} className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-purple-500/25">
                                        {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
