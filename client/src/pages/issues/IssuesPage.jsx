import { useState, useEffect } from 'react';
import { BookCopy, RotateCcw, Search, CheckCircle, AlertCircle, Loader2, Calendar, Camera, Image, AlertOctagon, Ban } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getIssues, issueBook, returnBook, reportLostBook } from '../../services/issueService';
import { getBooks } from '../../services/bookService';
import { getAppSettings } from '../../services/settingsService';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function IssuesPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState('active');
    const [search, setSearch] = useState('');
    const [issues, setIssues] = useState([]);
    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [issueForm, setIssueForm] = useState({ bookId: '', userId: '', dueDate: '' });
    const [message, setMessage] = useState(null);
    const [processing, setProcessing] = useState('');
    const [settings, setSettings] = useState({ defaultDueDays: 14, finePerDay: 5 });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const [issuesData, booksData, appSettings] = await Promise.all([
                getIssues(user?.role, user?.uid),
                getBooks(),
                getAppSettings(),
            ]);
            setIssues(issuesData);
            setBooks(booksData);
            setSettings(appSettings);

            // Set default due date based on settings
            const defaultDue = new Date();
            defaultDue.setDate(defaultDue.getDate() + (appSettings.defaultDueDays || 14));
            setIssueForm(f => ({ ...f, dueDate: defaultDue.toISOString().split('T')[0] }));

            // Fetch students AND faculty for issue modal
            if (user?.role === 'librarian' || user?.role === 'admin') {
                const usersSnap = await getDocs(query(collection(db, 'users'), where('role', 'in', ['student', 'faculty'])));
                setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
            }
        } catch (err) {
            console.error('Failed to fetch issues:', err);
        }
        setLoading(false);
    }

    const filteredIssues = issues.filter(issue => {
        let matchTab = false;
        if (tab === 'active') matchTab = (issue.status === 'issued' || issue.status === 'overdue');
        else if (tab === 'returned') matchTab = issue.status === 'returned';
        else if (tab === 'lost') matchTab = issue.status === 'lost';
        const matchSearch = search === '' ||
            issue.bookTitle?.toLowerCase().includes(search.toLowerCase()) ||
            issue.userName?.toLowerCase().includes(search.toLowerCase());
        return matchTab && matchSearch;
    });

    const handleReportLost = async (issueId) => {
        if (!confirm('Are you sure this book is lost? A penalty fine will be charged.')) return;
        setProcessing(issueId);
        try {
            const result = await reportLostBook(issueId, user);
            setMessage({ type: 'error', text: `Book reported as lost. Penalty: ₹${result.fineAmount}` });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
        setProcessing('');
        setTimeout(() => setMessage(null), 5000);
    };

    const handleReturn = async (issueId) => {
        setProcessing(issueId);
        try {
            const result = await returnBook(issueId, user);
            setMessage({ type: 'success', text: `Book returned! ${result.fineAmount > 0 ? `Fine: ₹${result.fineAmount}` : 'No fine.'}` });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
        setProcessing('');
        setTimeout(() => setMessage(null), 4000);
    };

    const handleIssue = async () => {
        if (!issueForm.bookId || !issueForm.userId) return;
        setProcessing('issue');
        try {
            const book = books.find(b => b.id === issueForm.bookId);
            const selectedUser = users.find(s => s.id === issueForm.userId);
            await issueBook(
                {
                    bookId: issueForm.bookId,
                    bookTitle: book?.title,
                    userId: issueForm.userId,
                    userName: selectedUser?.name || selectedUser?.email,
                    userEmail: selectedUser?.email,
                    dueDate: issueForm.dueDate
                },
                user
            );
            setMessage({ type: 'success', text: `"${book?.title}" issued to ${selectedUser?.name}!` });
            setShowIssueModal(false);
            // Reset form with default due date
            const defaultDue = new Date();
            defaultDue.setDate(defaultDue.getDate() + (settings.defaultDueDays || 14));
            setIssueForm({ bookId: '', userId: '', dueDate: defaultDue.toISOString().split('T')[0] });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
        setProcessing('');
        setTimeout(() => setMessage(null), 4000);
    };

    const canManage = user?.role === 'librarian' || user?.role === 'admin';

    if (loading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
    }

    return (
        <div className="page-enter space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-900 dark:text-white">Issue & Return 📋</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {canManage ? 'Manage book issuance and returns' : 'Your issued books'}
                    </p>
                </div>
                {canManage && (
                    <button onClick={() => setShowIssueModal(true)} className="btn-primary flex items-center gap-2">
                        <BookCopy className="w-4 h-4" /> Issue Book
                    </button>
                )}
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex gap-1 p-1 rounded-xl bg-gray-100/60 dark:bg-surface-700/40">
                    {[{ key: 'active', label: 'Active', icon: BookCopy }, { key: 'returned', label: 'Returned', icon: RotateCcw }, { key: 'lost', label: 'Lost', icon: Ban }].map(({ key, label, icon: Icon }) => (
                        <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-white dark:bg-surface-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                            <Icon className="w-4 h-4" />{label}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by book or user..." className="input-glass w-full pl-10" />
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-surface-700/30">
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Book</th>
                                {canManage && <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">User</th>}
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Issue Date</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Due Date</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Fine</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                                {tab === 'active' && <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredIssues.map((issue) => (
                                <tr key={issue.id} className="border-b border-gray-100/30 dark:border-gray-700/20 hover:bg-gray-50/30 dark:hover:bg-surface-700/20 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-200">{issue.bookTitle}</td>
                                    {canManage && <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{issue.userName}</td>}
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{issue.issueDate}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{issue.dueDate}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-red-500">{issue.fineAmount > 0 ? `₹${issue.fineAmount}` : '—'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`badge ${issue.status === 'issued' ? 'badge-info' : issue.status === 'overdue' ? 'badge-danger' : issue.status === 'lost' ? 'bg-gray-800 text-red-300 text-[10px] px-2 py-0.5 rounded-full font-semibold' : 'badge-success'}`}>
                                            {issue.status === 'lost' ? '🚫 LOST' : issue.status}
                                        </span>
                                    </td>
                                    {tab === 'active' && (
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {canManage && (
                                                    <button onClick={() => handleReturn(issue.id)} disabled={processing === issue.id} className="text-xs btn-secondary py-1.5 px-3 flex items-center gap-1 disabled:opacity-50">
                                                        {processing === issue.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />} Return
                                                    </button>
                                                )}
                                                <button onClick={() => handleReportLost(issue.id)} disabled={processing === issue.id} className="text-xs py-1.5 px-3 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 flex items-center gap-1 disabled:opacity-50 transition-colors">
                                                    {processing === issue.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertOctagon className="w-3 h-3" />} Report Lost
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {filteredIssues.length === 0 && (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No records found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Issue Modal with Custom Due Date */}
            {showIssueModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Issue a Book</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Select Book</label>
                                <select value={issueForm.bookId} onChange={(e) => setIssueForm(p => ({ ...p, bookId: e.target.value }))} className="input-glass w-full">
                                    <option value="">Choose a book...</option>
                                    {books.filter(b => b.availableCopies > 0).map(b => (
                                        <option key={b.id} value={b.id}>{b.title} ({b.availableCopies} copies)</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Select User (Student / Faculty)</label>
                                <select value={issueForm.userId} onChange={(e) => setIssueForm(p => ({ ...p, userId: e.target.value }))} className="input-glass w-full">
                                    <option value="">Choose a user...</option>
                                    {users.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.email}) — {s.role}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-violet-500" /> Due Date
                                </label>
                                <input
                                    type="date"
                                    value={issueForm.dueDate}
                                    onChange={(e) => setIssueForm(p => ({ ...p, dueDate: e.target.value }))}
                                    className="input-glass w-full"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                <p className="text-[11px] text-gray-400 mt-1">Default: {settings.defaultDueDays} days · Fine: ₹{settings.finePerDay}/day overdue</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowIssueModal(false)} className="btn-secondary flex-1">Cancel</button>
                                <button onClick={handleIssue} disabled={processing === 'issue'} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                    {processing === 'issue' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Issue Book'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
