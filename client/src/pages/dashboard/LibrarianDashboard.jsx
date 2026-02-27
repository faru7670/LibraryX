import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookCopy, RotateCcw, AlertTriangle, CalendarClock, Loader2 } from 'lucide-react';
import { getLibrarianStats } from '../../services/analyticsService';

export default function LibrarianDashboard() {
    const { authError } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLibrarianStats().then(setStats).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;

    const cards = [
        { label: 'Active Issues', value: stats?.activeIssues || 0, icon: BookCopy, color: 'from-blue-500 to-cyan-500', route: '/issues' },
        { label: 'Returned', value: stats?.returnedCount || 0, icon: RotateCcw, color: 'from-emerald-500 to-teal-500', route: '/issues' },
        { label: 'Overdue', value: stats?.overdueCount || 0, icon: AlertTriangle, color: 'from-red-500 to-rose-500', route: '/issues' },
        { label: 'Reservations', value: stats?.pendingReservations || 0, icon: CalendarClock, color: 'from-purple-500 to-pink-500', route: '/reservations' },
    ];

    return (
        <div className="page-enter space-y-6">
            <div>
                <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Librarian Dashboard 📚</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Daily operations</p>
            </div>

            {authError && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">⚠️ {authError}</div>}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className="stat-card cursor-pointer group hover:scale-[1.02] transition-transform duration-300" onClick={() => navigate(s.route)}>
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-lg group-hover:shadow-xl transition-shadow`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Overdue Table */}
            <div className="glass-card overflow-hidden">
                <div className="p-5 border-b border-gray-200/20 dark:border-gray-700/30">
                    <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" /> Overdue Books
                        <span className="badge badge-danger ml-1">{stats?.overdueList?.length || 0}</span>
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead><tr className="bg-gray-50/50 dark:bg-surface-700/30">
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-2.5">Book</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-2.5">Student</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-2.5">Due</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-2.5">Fine</th>
                        </tr></thead>
                        <tbody>
                            {(stats?.overdueList || []).map(i => (
                                <tr key={i.id} className="border-b border-gray-100/30 dark:border-gray-700/20">
                                    <td className="px-5 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{i.bookTitle}</td>
                                    <td className="px-5 py-3 text-sm text-gray-500">{i.userName}</td>
                                    <td className="px-5 py-3 text-sm text-gray-500">{i.dueDate}</td>
                                    <td className="px-5 py-3 text-sm font-semibold text-red-500">₹{i.fineAmount}</td>
                                </tr>
                            ))}
                            {!(stats?.overdueList?.length) && <tr><td colSpan="4" className="px-5 py-8 text-center text-gray-400">No overdue books 🎉</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
