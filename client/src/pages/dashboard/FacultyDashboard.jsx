import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Clock, AlertTriangle, TrendingUp, Loader2, GraduationCap } from 'lucide-react';
import { getStudentStats } from '../../services/analyticsService';

export default function FacultyDashboard() {
    const { user, authError } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) return;
        getStudentStats(user.uid).then(setStats).catch(console.error).finally(() => setLoading(false));
    }, [user?.uid]);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

    const cards = [
        { label: 'Books Borrowed', value: stats?.issuedCount || 0, icon: BookOpen, color: 'from-amber-500 to-orange-500' },
        { label: 'Overdue', value: stats?.overdueCount || 0, icon: AlertTriangle, color: 'from-red-500 to-rose-500' },
        { label: 'Total Read', value: stats?.totalRead || 0, icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
        { label: 'Fines', value: `₹${stats?.totalFines || 0}`, icon: Clock, color: 'from-violet-500 to-purple-500' },
    ];

    return (
        <div className="page-enter space-y-6">
            <div>
                <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
                    <GraduationCap className="w-7 h-7 text-amber-500" />
                    Welcome, {user?.name?.split(' ')[0] || 'Professor'} 👋
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Faculty library overview</p>
            </div>

            {authError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    ⚠️ {authError}
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className="stat-card group hover:scale-[1.02] transition-transform duration-300">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-lg group-hover:shadow-xl transition-shadow`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Active Issues List */}
            <div className="glass-card overflow-hidden">
                <div className="p-5 border-b border-gray-200/20 dark:border-gray-700/30">
                    <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-amber-500" /> Currently Borrowed
                    </h3>
                </div>
                {(stats?.activeIssues || []).length === 0 ? (
                    <p className="p-6 text-center text-gray-400 text-sm">No books borrowed. Visit the catalog!</p>
                ) : (
                    <div className="divide-y divide-gray-100/30 dark:divide-gray-700/20">
                        {(stats?.activeIssues || []).map(issue => {
                            const days = Math.ceil((new Date(issue.dueDate) - new Date()) / 86400000);
                            return (
                                <div key={issue.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/30 dark:hover:bg-surface-700/20 transition-colors">
                                    <div className="w-8 h-11 rounded bg-gradient-to-b from-amber-400 to-orange-500 flex-shrink-0 shadow-md" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{issue.bookTitle}</p>
                                        <p className="text-xs text-gray-400">Due: {issue.dueDate}</p>
                                    </div>
                                    <span className={`badge ${days < 0 ? 'badge-danger' : days <= 3 ? 'badge-warning' : 'badge-success'}`}>
                                        {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
