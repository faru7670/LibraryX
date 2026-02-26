import { useState, useEffect } from 'react';
import { Search, Filter, Grid3X3, List, BookOpen, ChevronDown, Plus, Loader2, BookMarked } from 'lucide-react';
import { getBooks, addBook } from '../../services/bookService';
import { reserveBook } from '../../services/reservationService';
import { useAuth } from '../../context/AuthContext';

const categories = ['All', 'Computer Science', 'Software Engineering', 'Electronics', 'Mechanical', 'Civil', 'Mathematics'];
const coverColors = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f97316', '#3b82f6'];

export default function BooksPage() {
    const { user } = useAuth();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [availability, setAvailability] = useState('all');
    const [view, setView] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ title: '', author: '', isbn: '', category: 'Computer Science', publisher: '', year: 2024, totalCopies: 1 });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const canManage = user?.role === 'librarian' || user?.role === 'admin';

    useEffect(() => {
        fetchBooks();
    }, [search, category, availability]);

    async function fetchBooks() {
        setLoading(true);
        try {
            const data = await getBooks({ search, category, availability });
            setBooks(data);
        } catch (err) {
            console.error('Failed to load books:', err);
        }
        setLoading(false);
    }

    const handleAddBook = async () => {
        if (!addForm.title || !addForm.author) return;
        setSaving(true);
        try {
            const colorIdx = Math.floor(Math.random() * coverColors.length);
            await addBook({ ...addForm, coverColor: coverColors[colorIdx] }, user);
            setShowAddModal(false);
            setAddForm({ title: '', author: '', isbn: '', category: 'Computer Science', publisher: '', year: 2024, totalCopies: 1 });
            setMessage({ type: 'success', text: `"${addForm.title}" added successfully!` });
            fetchBooks();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
        setSaving(false);
        setTimeout(() => setMessage(null), 3000);
    };

    const handleReserve = async (book) => {
        try {
            const result = await reserveBook(book.id, book.title, user);
            setMessage({ type: 'success', text: `Reserved! You are #${result.position} in queue for "${book.title}".` });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    return (
        <div className="page-enter space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-900 dark:text-white">Book Catalog 📖</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{books.length} books found</p>
                </div>
                <div className="flex items-center gap-2">
                    {canManage && (
                        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 text-sm">
                            <Plus className="w-4 h-4" /> Add Book
                        </button>
                    )}
                    <button onClick={() => setView('grid')} className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'text-gray-400'}`}><Grid3X3 className="w-5 h-5" /></button>
                    <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'text-gray-400'}`}><List className="w-5 h-5" /></button>
                </div>
            </div>

            {message && (
                <div className={`p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400'}`}>
                    {message.text}
                </div>
            )}

            {/* Search & Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, author, or ISBN..." className="input-glass w-full pl-10" />
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filters <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200/30 dark:border-gray-700/30 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-glass w-full">
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Availability</label>
                            <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="input-glass w-full">
                                <option value="all">All</option>
                                <option value="available">Available</option>
                                <option value="unavailable">Unavailable</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
            ) : view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {books.map((book) => (
                        <div key={book.id} className="glass-card overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                            <div className="h-40 flex items-center justify-center relative" style={{ backgroundColor: (book.coverColor || '#6366f1') + '15' }}>
                                <div className="w-20 h-28 rounded-lg shadow-lg transform group-hover:-translate-y-1 transition-transform duration-300" style={{ backgroundColor: book.coverColor || '#6366f1' }}>
                                    <div className="p-2 h-full flex flex-col justify-between">
                                        <div className="w-full h-1 bg-white/20 rounded" />
                                        <div className="space-y-1"><div className="w-full h-0.5 bg-white/15 rounded" /><div className="w-3/4 h-0.5 bg-white/15 rounded" /></div>
                                        <BookOpen className="w-4 h-4 text-white/30" />
                                    </div>
                                </div>
                                <div className={`absolute top-3 right-3 badge ${book.availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>
                                    {book.availableCopies > 0 ? 'Available' : 'Unavailable'}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-800 dark:text-white text-sm leading-tight line-clamp-2">{book.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{book.author}</p>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="badge badge-info text-[10px]">{book.category}</span>
                                    <span className="text-xs text-gray-400">{book.availableCopies}/{book.totalCopies}</span>
                                </div>
                                {book.availableCopies <= 0 && user?.role === 'student' && (
                                    <button onClick={() => handleReserve(book)} className="mt-3 w-full text-xs btn-secondary py-1.5 flex items-center justify-center gap-1">
                                        <BookMarked className="w-3 h-3" /> Reserve
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {books.map((book) => (
                        <div key={book.id} className="glass-card p-4 flex items-center gap-4">
                            <div className="w-10 h-14 rounded-lg flex-shrink-0 shadow-md" style={{ backgroundColor: book.coverColor || '#6366f1' }} />
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-800 dark:text-white text-sm truncate">{book.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{book.author} · {book.year}</p>
                            </div>
                            <span className="badge badge-info text-[10px] hidden sm:inline-flex">{book.category}</span>
                            <div className={`badge ${book.availableCopies > 0 ? 'badge-success' : 'badge-danger'} flex-shrink-0`}>
                                {book.availableCopies > 0 ? `${book.availableCopies} avail` : 'Unavailable'}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && books.length === 0 && (
                <div className="text-center py-16">
                    <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">No books found</h3>
                    <p className="text-sm text-gray-400 mt-1">{canManage ? 'Use the "Add Book" button or seed sample data from Admin Dashboard.' : 'Ask your librarian to add books to the catalog.'}</p>
                </div>
            )}

            {/* Add Book Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Add New Book</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                                <input type="text" value={addForm.title} onChange={(e) => setAddForm(p => ({ ...p, title: e.target.value }))} className="input-glass w-full" placeholder="Book title" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author *</label>
                                <input type="text" value={addForm.author} onChange={(e) => setAddForm(p => ({ ...p, author: e.target.value }))} className="input-glass w-full" placeholder="Author name" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ISBN</label>
                                    <input type="text" value={addForm.isbn} onChange={(e) => setAddForm(p => ({ ...p, isbn: e.target.value }))} className="input-glass w-full" placeholder="978-..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                                    <input type="number" value={addForm.year} onChange={(e) => setAddForm(p => ({ ...p, year: parseInt(e.target.value) }))} className="input-glass w-full" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                    <select value={addForm.category} onChange={(e) => setAddForm(p => ({ ...p, category: e.target.value }))} className="input-glass w-full">
                                        {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Copies</label>
                                    <input type="number" min="1" value={addForm.totalCopies} onChange={(e) => setAddForm(p => ({ ...p, totalCopies: parseInt(e.target.value) }))} className="input-glass w-full" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Publisher</label>
                                <input type="text" value={addForm.publisher} onChange={(e) => setAddForm(p => ({ ...p, publisher: e.target.value }))} className="input-glass w-full" placeholder="Publisher name" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">Cancel</button>
                                <button onClick={handleAddBook} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Book'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
