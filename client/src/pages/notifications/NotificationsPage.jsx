import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, BookOpen, AlertTriangle, Clock, CalendarCheck, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/notificationService';

const typeIcons = { overdue: AlertTriangle, issued: BookOpen, returned: CheckCircle2, due_soon: Clock, reservation: CalendarCheck, fine: AlertTriangle };
const typeColors = {
    overdue: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    issued: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    returned: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    due_soon: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
    reservation: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
    fine: 'text-red-500 bg-red-50 dark:bg-red-900/20',
};

export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, [user?.uid]);

    async function fetchNotifications() {
        if (!user?.uid) return;
        setLoading(true);
        try {
            const data = await getNotifications(user.uid, user.role);
            setNotifications(data);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        }
        setLoading(false);
    }

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) { console.error(err); }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead(user.uid);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) { console.error(err); }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
    }

    return (
        <div className="page-enter space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-900 dark:text-white flex items-center gap-3">
                        Notifications {unreadCount > 0 && <span className="badge badge-danger text-sm">{unreadCount} new</span>}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Stay updated on your library activity</p>
                </div>
                {unreadCount > 0 && <button onClick={handleMarkAllRead} className="btn-secondary text-sm">Mark all as read</button>}
            </div>

            <div className="space-y-3">
                {notifications.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
                    </div>
                ) : notifications.map((notif) => {
                    const Icon = typeIcons[notif.type] || Bell;
                    const colorClass = typeColors[notif.type] || 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
                    return (
                        <div key={notif.id} className={`glass-card p-4 flex items-start gap-4 transition-all duration-300 ${!notif.read ? 'border-l-4 border-l-primary-500' : 'opacity-70'}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}><Icon className="w-5 h-5" /></div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!notif.read ? 'font-medium text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>{notif.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{notif.createdAt}</p>
                            </div>
                            {!notif.read && (
                                <button onClick={() => handleMarkRead(notif.id)} className="text-xs text-primary-500 hover:text-primary-600 font-medium flex-shrink-0">Mark read</button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
