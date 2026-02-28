import { useState, useEffect } from 'react';
import { CalendarClock, Hash, BookOpen, Loader2, X } from 'lucide-react';
import { getReservations, cancelReservation } from '../../services/reservationService';
import { useAuth } from '../../context/AuthContext';

export default function ReservationsPage() {
    const { user } = useAuth();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchReservations();
    }, [user?.uid]);

    async function fetchReservations() {
        if (!user?.uid) return;
        setLoading(true);
        try {
            const data = await getReservations(user.role, user.uid);
            setReservations(data.filter(r => r.status === 'waiting'));
        } catch (err) {
            console.error('Failed to load reservations:', err);
        }
        setLoading(false);
    }

    const handleCancel = async (resId) => {
        try {
            await cancelReservation(resId, user);
            setMessage({ type: 'success', text: 'Reservation cancelled.' });
            fetchReservations();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
    }

    return (
        <div className="page-enter space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-900 dark:text-white">Reservation Queue 📅</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {user?.role === 'student' ? 'Your reserved books and queue positions' : 'Manage book reservation queue'}
                </p>
            </div>

            {message && (
                <div className={`p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                    {message.text}
                </div>
            )}

            {reservations.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <CalendarClock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No active reservations</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reservations.map((res) => (
                        <div key={res.id} className="glass-card p-5 flex items-center gap-4">
                            <div className="w-12 h-16 rounded-lg flex-shrink-0 shadow-md flex items-center justify-center bg-primary-500">
                                <BookOpen className="w-5 h-5 text-white/50" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{res.bookTitle || 'Book'}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {user?.role !== 'student' && `${res.userName} · `}
                                    Reserved on {new Date(res.reservedAt).toLocaleString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric',
                                        hour: 'numeric', minute: '2-digit', hour12: true
                                    })}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="text-center">
                                    <div className="flex items-center gap-1 text-primary-500">
                                        <Hash className="w-3.5 h-3.5" />
                                        <span className="text-lg font-bold">{res.position}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">in queue</p>
                                </div>
                                <span className="badge badge-warning">waiting</span>
                                {user?.role === 'student' && (
                                    <button onClick={() => handleCancel(res.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors" title="Cancel reservation">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
