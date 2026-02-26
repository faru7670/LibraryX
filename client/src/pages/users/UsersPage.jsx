import { useState, useEffect } from 'react';
import { Users as UsersIcon, Shield, BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getIssues } from '../../services/issueService';

export default function UsersPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [usersSnap, issuesData] = await Promise.all([
                    getDocs(collection(db, 'users')),
                    getIssues('admin', user?.uid),
                ]);
                setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                setIssues(issuesData);
            } catch (err) {
                console.error('Failed to load users:', err);
            }
            setLoading(false);
        }
        fetchData();
    }, []);

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
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-500" /> Staff ({staff.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
        </div>
    );
}
