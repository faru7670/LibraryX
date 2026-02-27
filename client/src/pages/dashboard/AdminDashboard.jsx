import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Users, DollarSign, AlertTriangle, Loader2, Database } from 'lucide-react';
import { getAdminStats } from '../../services/analyticsService';
import { seedBooks } from '../../services/bookService';

export default function AdminDashboard() {
    const { user, authError } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        setLoading(true);
        try { setStats(await getAdminStats()); } catch (e) { console.error(e); }
        setLoading(false);
    }

    const handleSeed = async () => {
        setSeeding(true);
        try { const r = await seedBooks(user); setMsg(r.message); if (r.seeded) fetchData(); } catch (e) { setMsg('Error: ' + e.message); }
        setSeeding(false);
        setTimeout(() => setMsg(''), 4000);
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;

    const cards = [
        { label: 'Total Books', value: stats?.totalBooks || 0, sub: `${stats?.issuedCount || 0} issued`, icon: BookOpen, color: 'from-blue-500 to-cyan-500', route: '/books' },
        { label: 'Users', value: stats?.totalUsers || 0, sub: `${stats?.studentCount || 0} students`, icon: Users, color: 'from-emerald-500 to-teal-500', route: '/users' },
        { label: 'Fines', value: `₹${stats?.totalFines || 0}`, sub: 'collected', icon: DollarSign, color: 'from-amber-500 to-orange-500', route: '/audit-log' },
        { label: 'Overdue', value: `${stats?.overdueRate || 0}%`, sub: 'rate', icon: AlertTriangle, color: 'from-red-500 to-rose-500', route: '/issues' },
    ];

    return (
        <div className="page-enter space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Admin Dashboard 🛡️</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Library analytics & management</p>
                </div>
                <button onClick={handleSeed} disabled={seeding} className="btn-secondary flex items-center gap-2 text-sm">
                    {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />} Seed Books
                </button>
            </div>

            {authError && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">⚠️ {authError}</div>}
            {msg && <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">{msg}</div>}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className="stat-card cursor-pointer group hover:scale-[1.02] transition-transform duration-300" onClick={() => navigate(s.route)}>
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-lg group-hover:shadow-xl transition-shadow`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
                        </div>
                    );
                })}
            </div>

            {/* Dead Stock */}
            <div className="glass-card overflow-hidden">
                <div className="p-5 border-b border-gray-200/20 dark:border-gray-700/30">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Dead Stock <span className="badge badge-warning ml-1">{stats?.deadStock?.length || 0}</span></h3>
                    <p className="text-xs text-gray-500 mt-1">Books never issued</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead><tr className="bg-gray-50/50 dark:bg-surface-700/30">
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-2.5">Title</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-2.5">Author</th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-2.5">Category</th>
                        </tr></thead>
                        <tbody>
                            {(stats?.deadStock || []).map(b => (
                                <tr key={b.id} className="border-b border-gray-100/30 dark:border-gray-700/20">
                                    <td className="px-5 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{b.title}</td>
                                    <td className="px-5 py-3 text-sm text-gray-500">{b.author}</td>
                                    <td className="px-5 py-3"><span className="badge badge-info">{b.category}</span></td>
                                </tr>
                            ))}
                            {!(stats?.deadStock?.length) && <tr><td colSpan="3" className="px-5 py-8 text-center text-gray-400">No dead stock 🎉</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
