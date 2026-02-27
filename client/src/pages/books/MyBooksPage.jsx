import { useState, useEffect } from 'react';
import { BookCopy, Clock, AlertTriangle, CheckCircle, Loader2, BookOpen, AlertOctagon, Ban } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentActiveIssues } from '../../services/issueService';
import { getIssues } from '../../services/issueService';

export default function MyBooksPage() {
    const { user } = useAuth();
    const [activeBooks, setActiveBooks] = useState([]);
    const [pastBooks, setPastBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('active');

    useEffect(() => {
        async function fetchData() {
            if (!user?.uid) return;
            try {
                const allIssues = await getIssues(user.role, user.uid);
                setActiveBooks(allIssues.filter(i => i.status === 'issued' || i.status === 'overdue'));
                setPastBooks(allIssues.filter(i => i.status === 'returned' || i.status === 'lost'));
            } catch (err) {
                console.error('Failed to load my books:', err);
            }
            setLoading(false);
        }
        fetchData();
    }, [user?.uid, user?.role]);

    if (loading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;
    }

    const displayBooks = tab === 'active' ? activeBooks : pastBooks;

    return (
        <div className="page-enter space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-900 dark:text-white">My Books 📚</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Books you've borrowed from the library</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="icon-3d w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600">
                            <BookCopy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeBooks.length}</p>
                            <p className="text-xs text-gray-500">Currently Borrowed</p>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="icon-3d w-10 h-10 bg-gradient-to-br from-red-400 to-red-600">
                            <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeBooks.filter(b => b.status === 'overdue').length}</p>
                            <p className="text-xs text-gray-500">Overdue</p>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="icon-3d w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{pastBooks.filter(b => b.status === 'returned').length}</p>
                            <p className="text-xs text-gray-500">Returned</p>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="icon-3d w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {activeBooks.reduce((sum, b) => sum + (b.fineAmount || 0), 0) > 0 ? `₹${activeBooks.reduce((sum, b) => sum + (b.fineAmount || 0), 0)}` : '₹0'}
                            </p>
                            <p className="text-xs text-gray-500">Total Fines</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-gray-100/60 dark:bg-surface-700/40 w-fit">
                {[{ key: 'active', label: 'Currently Borrowed', icon: BookCopy, count: activeBooks.length },
                { key: 'past', label: 'History', icon: CheckCircle, count: pastBooks.length }].map(({ key, label, icon: Icon, count }) => (
                    <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-white dark:bg-surface-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        <Icon className="w-4 h-4" />{label} <span className="text-xs opacity-60">({count})</span>
                    </button>
                ))}
            </div>

            {/* Book List */}
            {displayBooks.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                        {tab === 'active' ? "You don't have any borrowed books right now." : 'No past borrowing history yet.'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {displayBooks.map(book => {
                        const isOverdue = book.status === 'overdue';
                        const isLost = book.status === 'lost';
                        const dueDate = new Date(book.dueDate);
                        const now = new Date();
                        const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

                        return (
                            <div key={book.id} className={`glass-card p-5 flex items-center gap-4 ${isOverdue ? 'border-red-500/30' : isLost ? 'border-gray-500/30' : ''}`}>
                                {/* Book Icon */}
                                <div className={`icon-3d w-12 h-12 flex-shrink-0 ${isOverdue ? 'bg-gradient-to-br from-red-400 to-red-600' : isLost ? 'bg-gradient-to-br from-gray-500 to-gray-700' : 'bg-gradient-to-br from-violet-400 to-violet-600'}`}>
                                    {isLost ? <Ban className="w-6 h-6 text-white" /> : <BookCopy className="w-6 h-6 text-white" />}
                                </div>

                                {/* Book Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-800 dark:text-white truncate">{book.bookTitle}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                        <span>Issued: {book.issueDate}</span>
                                        <span>Due: {book.dueDate}</span>
                                        {book.returnDate && <span>Returned: {book.returnDate}</span>}
                                    </div>
                                </div>

                                {/* Status + Fine */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    {book.fineAmount > 0 && (
                                        <span className="text-sm font-bold text-red-500">₹{book.fineAmount}</span>
                                    )}
                                    <span className={`badge ${book.status === 'issued' ? 'badge-info' :
                                            book.status === 'overdue' ? 'badge-danger' :
                                                book.status === 'lost' ? 'bg-gray-800 text-red-300 text-[10px] px-2 py-0.5 rounded-full font-semibold' :
                                                    'badge-success'
                                        }`}>
                                        {isLost ? '🚫 LOST' : isOverdue ? `⚠️ ${Math.abs(daysLeft)}d overdue` : book.status === 'issued' ? `${daysLeft}d left` : 'Returned ✓'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
