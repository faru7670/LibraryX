import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Clock, AlertTriangle, TrendingUp, Loader2, GraduationCap, QrCode, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { getStudentStats } from '../../services/analyticsService';

export default function FacultyDashboard() {
    const { user, authError } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) return;
        getStudentStats(user.uid).then(setStats).catch(console.error).finally(() => setLoading(false));
    }, [user?.uid]);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

    const downloadQRCode = async () => {
        const qrElement = document.getElementById('qr-container');
        if (!qrElement) return;

        try {
            const canvas = await html2canvas(qrElement, {
                backgroundColor: '#ffffff',
                scale: 2 // High resolution
            });
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `FacultyID_${user?.name?.replace(/\s+/g, '_')}.png`;
            link.href = url;
            link.click();
        } catch (err) {
            console.error('Failed to download QR code:', err);
        }
    };

    const cards = [
        { label: 'Books Borrowed', value: stats?.issuedCount || 0, icon: BookOpen, color: 'from-amber-500 to-orange-500', route: '/my-books' },
        { label: 'Overdue', value: stats?.overdueCount || 0, icon: AlertTriangle, color: 'from-red-500 to-rose-500', route: '/my-books' },
        { label: 'Total Read', value: stats?.totalRead || 0, icon: TrendingUp, color: 'from-emerald-500 to-teal-500', route: '/history' },
        { label: 'Fines', value: `₹${stats?.totalFines || 0}`, icon: Clock, color: 'from-violet-500 to-purple-500', route: '/history?filter=fines' },
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Issues List */}
                <div className="lg:col-span-2 glass-card overflow-hidden">
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

                {/* My Library ID QR Code */}
                <div className="lg:col-span-1 glass-card overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-200/20 dark:border-gray-700/30 bg-amber-500/5">
                        <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                            <QrCode className="w-5 h-5 text-amber-500" /> My Library ID
                        </h3>
                    </div>
                    <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
                        <div id="qr-container" className="bg-white p-4 rounded-xl shadow-sm mb-4 inline-block">
                            <QRCodeSVG
                                value={user?.uid || 'no-id'}
                                size={180}
                                level="H"
                                fgColor="#1f2937"
                            />
                        </div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                            {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                            Show this QR code to the librarian when borrowing or returning books.
                        </p>
                        <button
                            onClick={downloadQRCode}
                            className="w-full btn-secondary flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" /> Download QR
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
