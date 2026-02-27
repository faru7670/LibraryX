import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, BookCopy, RotateCcw, BookMarked, DollarSign, ShieldCheck, Loader2, FilterX } from 'lucide-react';
import { getActivityLogs } from '../../services/activityService';
import { useAuth } from '../../context/AuthContext';

const actionIcons = { book_issued: BookCopy, book_returned: RotateCcw, reservation_placed: BookMarked, fine_collected: DollarSign, book_added: BookCopy, seed_data: ShieldCheck, reservation_cancelled: BookMarked, book_updated: BookCopy, book_deleted: BookCopy };
const actionColors = {
    book_issued: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    book_returned: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    reservation_placed: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
    fine_collected: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
    book_added: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
    seed_data: 'text-green-500 bg-green-50 dark:bg-green-900/20',
};

export default function ActivityPage() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const filter = searchParams.get('filter');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const isStudent = user?.role === 'student' || user?.role === 'faculty';

    useEffect(() => {
        async function fetchLogs() {
            if (!user?.uid) return;
            try {
                const data = await getActivityLogs(user.role, user.uid, 50);
                setLogs(data);
            } catch (err) {
                console.error('Failed to load logs:', err);
            }
            setLoading(false);
        }
        fetchLogs();
    }, [user?.uid, user?.role]);

    if (loading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
    }

    return (
        <div className="page-enter space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-900 dark:text-white">
                        {isStudent ? 'My Activity' : 'Activity Logs'} 📋
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {filter === 'fines' ? 'Displaying only fine-related activity' : isStudent ? 'Your library activity timeline' : 'Complete library audit trail'}
                    </p>
                </div>
                {filter && (
                    <button onClick={() => setSearchParams({})} className="btn-secondary text-xs flex items-center gap-2">
                        <FilterX className="w-4 h-4" /> Clear Filter
                    </button>
                )}
            </div>

            <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700/50" />
                <div className="space-y-4">
                    {logs
                        .filter(log => filter === 'fines' ? (log.details.includes('Fine: ₹') || log.details.includes('Penalty: ₹')) : true)
                        .map((log) => {
                            const Icon = actionIcons[log.action] || ShieldCheck;
                            const colorClass = actionColors[log.action] || 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
                            return (
                                <div key={log.id} className="flex gap-4 ml-0 relative">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 z-10 ${colorClass}`}><Icon className="w-5 h-5" /></div>
                                    <div className="glass-card p-4 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                {!isStudent && <p className="text-xs font-medium text-primary-500 mb-0.5">{log.userName}</p>}
                                                <p className="text-sm text-gray-800 dark:text-gray-200">{log.details}</p>
                                            </div>
                                            <span className="badge badge-info text-[10px] flex-shrink-0">{log.action?.replace(/_/g, ' ')}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>

            {logs.length === 0 && (
                <div className="glass-card p-12 text-center">
                    <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No activity yet. Start using the library!</p>
                </div>
            )}
        </div>
    );
}
