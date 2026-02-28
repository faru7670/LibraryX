import { useState, useEffect, useRef } from 'react';
import { Search, Filter, Grid3X3, List, BookOpen, ChevronDown, Plus, Loader2, BookMarked, Camera, ImagePlus, X, Pencil, Save, QrCode, Download } from 'lucide-react';
import { getBooks, addBook, updateBook, addStock } from '../../services/bookService';
import { reserveBook } from '../../services/reservationService';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';

const categories = ['All', 'Computer Science', 'Software Engineering', 'Electronics', 'Mechanical', 'Civil', 'Mathematics'];
const coverColors = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f97316', '#3b82f6'];

// Compress image to base64 data URL (~100KB max for Firestore)
function compressImage(file, maxWidth = 400, quality = 0.7) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

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
    const [addForm, setAddForm] = useState({ title: '', author: '', isbn: '', category: 'Computer Science', publisher: '', year: 2024, totalCopies: 1, coverImage: null, prefix: '' });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    // Edit book state
    const [editBook, setEditBook] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [editImagePreview, setEditImagePreview] = useState(null);
    const editFileRef = useRef(null);
    // QR Code Modal State
    const [qrBook, setQrBook] = useState(null);
    // Add Stock Modal State
    const [stockBook, setStockBook] = useState(null);
    const [stockAmount, setStockAmount] = useState(1);

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

    const handleImageSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const compressed = await compressImage(file);
            setImagePreview(compressed);
            setAddForm(p => ({ ...p, coverImage: compressed }));
        } catch (err) {
            console.error('Image compression failed:', err);
        }
    };

    const clearImage = () => {
        setImagePreview(null);
        setAddForm(p => ({ ...p, coverImage: null }));
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    const handleAddBook = async () => {
        if (!addForm.title || !addForm.author) return;
        setSaving(true);
        try {
            const colorIdx = Math.floor(Math.random() * coverColors.length);
            await addBook({ ...addForm, coverColor: coverColors[colorIdx] }, user);
            setShowAddModal(false);
            setAddForm({ title: '', author: '', isbn: '', category: 'Computer Science', publisher: '', year: 2024, totalCopies: 1, coverImage: null, prefix: '' });
            setImagePreview(null);
            setMessage({ type: 'success', text: `"${addForm.title}" added successfully!` });
            fetchBooks();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
        setSaving(false);
        setTimeout(() => setMessage(null), 3000);
    };

    const openEditModal = (book) => {
        setEditBook(book);
        setEditForm({ title: book.title, author: book.author, isbn: book.isbn || '', category: book.category || 'Computer Science', publisher: book.publisher || '', year: book.year || 2024, totalCopies: book.totalCopies || 1, coverImage: book.coverImage || null });
        setEditImagePreview(book.coverImage || null);
    };

    const handleEditImageSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const compressed = await compressImage(file);
        setEditImagePreview(compressed);
        setEditForm(p => ({ ...p, coverImage: compressed }));
    };

    const handleEditBook = async () => {
        if (!editForm.title || !editForm.author) return;
        setSaving(true);
        try {
            await updateBook(editBook.id, editForm, user);
            setEditBook(null);
            setMessage({ type: 'success', text: `"${editForm.title}" updated!` });
            fetchBooks();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
        setSaving(false);
        setTimeout(() => setMessage(null), 3000);
    };

    const handleAddStock = async () => {
        setSaving(true);
        try {
            await addStock(stockBook.id, stockAmount, user);
            setMessage({ type: 'success', text: `Added ${stockAmount} copies to "${stockBook.title}"!` });
            setStockBook(null);
            setStockAmount(1);
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

    const downloadBookQR = async () => {
        const qrElement = document.getElementById('book-qr-container');
        if (!qrElement || !qrBook) return;

        try {
            const canvas = await html2canvas(qrElement, {
                backgroundColor: '#ffffff',
                scale: 2
            });
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `BookQR_${qrBook.title.replace(/\s+/g, '_')}.png`;
            link.href = url;
            link.click();
        } catch (err) {
            console.error('Failed to download QR code:', err);
        }
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
                            <div className="h-40 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: (book.coverColor || '#6366f1') + '15' }}>
                                {book.coverImage ? (
                                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-20 h-28 rounded-lg shadow-lg transform group-hover:-translate-y-1 transition-transform duration-300" style={{ backgroundColor: book.coverColor || '#6366f1' }}>
                                        <div className="p-2 h-full flex flex-col justify-between">
                                            <div className="w-full h-1 bg-white/20 rounded" />
                                            <div className="space-y-1"><div className="w-full h-0.5 bg-white/15 rounded" /><div className="w-3/4 h-0.5 bg-white/15 rounded" /></div>
                                            <BookOpen className="w-4 h-4 text-white/30" />
                                        </div>
                                    </div>
                                )}
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
                                <div className="flex gap-2 mt-3">
                                    {canManage && (
                                        <>
                                            <button onClick={() => setQrBook(book)} className="flex-1 text-xs btn-secondary py-1.5 flex items-center justify-center gap-1">
                                                <QrCode className="w-3 h-3" /> QR
                                            </button>
                                            <button onClick={() => setStockBook(book)} className="flex-1 text-xs btn-secondary py-1.5 flex items-center justify-center gap-1 border-l sm:border-l-0 sm:border-r border-gray-200 dark:border-gray-700">
                                                <Plus className="w-3 h-3" /> Stock
                                            </button>
                                            <button onClick={() => openEditModal(book)} className="flex-1 text-xs btn-secondary py-1.5 flex items-center justify-center gap-1">
                                                <Pencil className="w-3 h-3" /> Edit
                                            </button>
                                        </>
                                    )}
                                    {book.availableCopies <= 0 && (user?.role === 'student' || user?.role === 'faculty') && (
                                        <button onClick={() => handleReserve(book)} className="flex-1 text-xs btn-secondary py-1.5 flex items-center justify-center gap-1">
                                            <BookMarked className="w-3 h-3" /> Reserve
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {books.map((book) => (
                        <div key={book.id} className="glass-card p-4 flex items-center gap-4">
                            {book.coverImage ? (
                                <img src={book.coverImage} alt={book.title} className="w-10 h-14 rounded-lg flex-shrink-0 shadow-md object-cover" />
                            ) : (
                                <div className="w-10 h-14 rounded-lg flex-shrink-0 shadow-md" style={{ backgroundColor: book.coverColor || '#6366f1' }} />
                            )}
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

            {/* Add Book Modal with Cover Image */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Add New Book</h3>
                        <div className="space-y-3">
                            {/* Cover Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Book Cover Photo</label>
                                {imagePreview ? (
                                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-white/10 mb-2">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <button onClick={clearImage} className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2 mb-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex-1 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-500 transition-colors flex flex-col items-center gap-1.5 text-gray-500 hover:text-violet-500"
                                        >
                                            <ImagePlus className="w-5 h-5" />
                                            <span className="text-xs font-medium">Upload Photo</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => cameraInputRef.current?.click()}
                                            className="flex-1 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-cyan-400 dark:hover:border-cyan-500 transition-colors flex flex-col items-center gap-1.5 text-gray-500 hover:text-cyan-500"
                                        >
                                            <Camera className="w-5 h-5" />
                                            <span className="text-xs font-medium">Take Photo</span>
                                        </button>
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageSelect} className="hidden" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                                <input type="text" value={addForm.title} onChange={(e) => setAddForm(p => ({ ...p, title: e.target.value }))} className="input-glass w-full" placeholder="Book title" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prefix (Auto-generated if empty)</label>
                                <input type="text" value={addForm.prefix} onChange={(e) => setAddForm(p => ({ ...p, prefix: e.target.value }))} className="input-glass w-full text-transform-uppercase" placeholder="e.g. JAVA" />
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
                                <button onClick={() => { setShowAddModal(false); clearImage(); }} className="btn-secondary flex-1">Cancel</button>
                                <button onClick={handleAddBook} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Book'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Book Modal */}
            {editBook && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditBook(null)}>
                    <div className="glass-card p-6 w-full max-w-md max-h-[85vh] overflow-y-auto space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Pencil className="w-5 h-5" /> Edit Book</h2>
                            <button onClick={() => setEditBook(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        {/* Cover Image */}
                        <div className="flex items-center gap-3">
                            {editImagePreview ? (
                                <div className="relative">
                                    <img src={editImagePreview} alt="" className="w-16 h-20 rounded-lg object-cover shadow-md" />
                                    <button onClick={() => { setEditImagePreview(null); setEditForm(p => ({ ...p, coverImage: null })); }} className="absolute -top-2 -right-2 p-0.5 rounded-full bg-red-500 text-white"><X className="w-3 h-3" /></button>
                                </div>
                            ) : (
                                <div className="w-16 h-20 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center"><BookOpen className="w-6 h-6 text-gray-400" /></div>
                            )}
                            <button onClick={() => editFileRef.current?.click()} className="btn-secondary text-xs py-1.5 flex items-center gap-1"><ImagePlus className="w-3 h-3" /> Change Cover</button>
                            <input ref={editFileRef} type="file" accept="image/*" onChange={handleEditImageSelect} className="hidden" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                            <input type="text" value={editForm.title || ''} onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))} className="input-glass w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author *</label>
                            <input type="text" value={editForm.author || ''} onChange={(e) => setEditForm(p => ({ ...p, author: e.target.value }))} className="input-glass w-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ISBN</label>
                                <input type="text" value={editForm.isbn || ''} onChange={(e) => setEditForm(p => ({ ...p, isbn: e.target.value }))} className="input-glass w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                                <input type="number" value={editForm.year || 2024} onChange={(e) => setEditForm(p => ({ ...p, year: parseInt(e.target.value) }))} className="input-glass w-full" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                <select value={editForm.category || 'Computer Science'} onChange={(e) => setEditForm(p => ({ ...p, category: e.target.value }))} className="input-glass w-full">
                                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Copies</label>
                                <input type="number" min="1" value={editForm.totalCopies || 1} onChange={(e) => setEditForm(p => ({ ...p, totalCopies: parseInt(e.target.value) }))} className="input-glass w-full" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Publisher</label>
                            <input type="text" value={editForm.publisher || ''} onChange={(e) => setEditForm(p => ({ ...p, publisher: e.target.value }))} className="input-glass w-full" />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setEditBook(null)} className="btn-secondary flex-1">Cancel</button>
                            <button onClick={handleEditBook} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Book QR Code Modal */}
            {qrBook && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setQrBook(null)}>
                    <div className="glass-card p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <QrCode className="w-5 h-5 text-violet-500" /> Book QR Tag
                            </h2>
                            <button onClick={() => setQrBook(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-col items-center justify-center p-4">
                            <div id="book-qr-container" className="bg-white p-4 rounded-xl shadow-sm mb-4 inline-block text-center border-2 border-gray-100 max-h-[60vh] overflow-y-auto w-full">
                                <p className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-4 border-b-2 border-gray-800 pb-2 w-full truncate">{qrBook.title} Tags</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {(qrBook.copies || [{ id: qrBook.prefix ? `${qrBook.prefix}-1` : 'BOK-1' }]).map(copy => (
                                        <div key={copy.id} className="flex flex-col items-center p-2 border border-gray-200 rounded-lg">
                                            <QRCodeSVG
                                                value={`${qrBook.id}|${copy.id}`}
                                                size={100}
                                                level="H"
                                                fgColor="#000000"
                                                className="mx-auto"
                                            />
                                            <p className="text-[12px] font-bold text-gray-900 mt-2">{copy.id}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                                Download these tags and attach them to the physical copies.
                            </p>

                            <button
                                onClick={downloadBookQR}
                                className="w-full btn-primary flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" /> Download QR Label
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Stock Modal */}
            {stockBook && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setStockBook(null)}>
                    <div className="glass-card p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5" /> Add Stock to Catalog
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Adding physical copies to <b>{stockBook.title}</b>. This will generate unique ID labels for each new copy automatically.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount of New Copies</label>
                            <input type="number" min="1" max="100" value={stockAmount} onChange={e => setStockAmount(parseInt(e.target.value) || 1)} className="input-glass w-full" />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStockBook(null)} className="btn-secondary flex-1">Cancel</button>
                            <button onClick={handleAddStock} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
