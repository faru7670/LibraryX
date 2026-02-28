// Book Service — Real Firestore CRUD operations for books
import { db } from '../firebase';
import {
    collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
    query, where, orderBy, serverTimestamp, increment
} from 'firebase/firestore';
import { logActivity } from './activityService';

const BOOKS_COL = 'books';

// Get all books (with optional filters)
export async function getBooks({ search = '', category = 'All', availability = 'all' } = {}) {
    const ref = collection(db, BOOKS_COL);
    const snapshot = await getDocs(query(ref, orderBy('title')));
    let books = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // Client-side filtering (Firestore free tier doesn't support full-text search)
    if (search) {
        const s = search.toLowerCase();
        books = books.filter(b =>
            b.title?.toLowerCase().includes(s) ||
            b.author?.toLowerCase().includes(s) ||
            b.isbn?.includes(s)
        );
    }
    if (category && category !== 'All') {
        books = books.filter(b => b.category === category);
    }
    if (availability === 'available') {
        books = books.filter(b => b.availableCopies > 0);
    } else if (availability === 'unavailable') {
        books = books.filter(b => b.availableCopies <= 0);
    }

    return books;
}

// Get single book by ID
export async function getBook(bookId) {
    const snap = await getDoc(doc(db, BOOKS_COL, bookId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
}

// Add a new book (librarian/admin)
export async function addBook(bookData, user) {
    const rawPrefix = bookData.prefix || bookData.title.substring(0, 4).toUpperCase();
    const prefix = rawPrefix.replace(/[^A-Z0-9]/g, '') || 'BOK';

    const copies = [];
    const total = parseInt(bookData.totalCopies) || 1;
    for (let i = 1; i <= total; i++) {
        copies.push({ id: `${prefix}-${i}`, status: 'available' });
    }

    const docRef = await addDoc(collection(db, BOOKS_COL), {
        ...bookData,
        prefix,
        copies,
        totalCopies: total,
        availableCopies: total,
        addedBy: user.uid,
        createdAt: serverTimestamp(),
    });

    await logActivity(user.uid, user.displayName || user.email, 'book_added', `Added "${bookData.title}"`);
    return { id: docRef.id, ...bookData, prefix, copies };
}

// Add stock to existing book
export async function addStock(bookId, amount, user) {
    const bookRef = doc(db, BOOKS_COL, bookId);
    const bookSnap = await getDoc(bookRef);
    if (!bookSnap.exists()) throw new Error('Book not found');

    const book = bookSnap.data();
    const prefix = book.prefix || book.title.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '') || 'BOK';

    let maxNum = 0;
    if (book.copies && book.copies.length > 0) {
        book.copies.forEach(c => {
            const numPart = c.id.split('-')[1];
            const num = parseInt(numPart);
            if (!isNaN(num) && num > maxNum) maxNum = num;
        });
    } else {
        maxNum = book.totalCopies || 0;
    }

    const addedAmount = parseInt(amount) || 1;
    const newCopies = [];
    for (let i = 1; i <= addedAmount; i++) {
        newCopies.push({ id: `${prefix}-${maxNum + i}`, status: 'available' });
    }

    const updatedCopies = [...(book.copies || []), ...newCopies];

    await updateDoc(bookRef, {
        prefix, // in case it was missing
        copies: updatedCopies,
        totalCopies: increment(addedAmount),
        availableCopies: increment(addedAmount)
    });

    if (user) {
        await logActivity(user.uid, user.displayName || user.email, 'stock_added', `Added ${addedAmount} copies to "${book.title}"`);
    }

    return newCopies;
}

// Update a book
export async function updateBook(bookId, updates, user) {
    await updateDoc(doc(db, BOOKS_COL, bookId), updates);
    if (user) {
        await logActivity(user.uid, user.displayName || user.email, 'book_updated', `Updated book ID: ${bookId}`);
    }
}

// Delete a book (admin only)
export async function deleteBook(bookId, user) {
    const book = await getBook(bookId);
    await deleteDoc(doc(db, BOOKS_COL, bookId));
    if (user && book) {
        await logActivity(user.uid, user.displayName || user.email, 'book_deleted', `Deleted "${book.title}"`);
    }
}

// Seed sample books (admin utility)
export async function seedBooks(user) {
    const existing = await getDocs(collection(db, BOOKS_COL));
    if (existing.size > 0) return { seeded: false, message: 'Books already exist' };

    const sampleBooks = [
        { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0262033848', category: 'Computer Science', publisher: 'MIT Press', year: 2009, totalCopies: 5, availableCopies: 5, coverColor: '#6366f1', description: 'A comprehensive textbook covering a broad range of algorithms.' },
        { title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', category: 'Software Engineering', publisher: 'Prentice Hall', year: 2008, totalCopies: 4, availableCopies: 4, coverColor: '#14b8a6', description: 'A handbook of agile software craftsmanship.' },
        { title: 'Design Patterns', author: 'Gang of Four', isbn: '978-0201633610', category: 'Software Engineering', publisher: 'Addison-Wesley', year: 1994, totalCopies: 3, availableCopies: 3, coverColor: '#f59e0b', description: 'Elements of Reusable Object-Oriented Software.' },
        { title: 'Database System Concepts', author: 'Abraham Silberschatz', isbn: '978-0078022159', category: 'Computer Science', publisher: 'McGraw-Hill', year: 2019, totalCopies: 6, availableCopies: 6, coverColor: '#ef4444', description: 'Comprehensive coverage of database system concepts.' },
        { title: 'Digital Electronics', author: 'Morris Mano', isbn: '978-0132774208', category: 'Electronics', publisher: 'Pearson', year: 2012, totalCopies: 4, availableCopies: 4, coverColor: '#8b5cf6', description: 'Principles of digital design and computer architecture.' },
        { title: 'Engineering Mechanics', author: 'R.C. Hibbeler', isbn: '978-0133915426', category: 'Mechanical', publisher: 'Pearson', year: 2016, totalCopies: 5, availableCopies: 5, coverColor: '#ec4899', description: 'Statics and dynamics for engineering students.' },
        { title: 'Operating System Concepts', author: 'Galvin & Silberschatz', isbn: '978-1119800361', category: 'Computer Science', publisher: 'Wiley', year: 2021, totalCopies: 4, availableCopies: 4, coverColor: '#06b6d4', description: 'The definitive guide to operating system concepts.' },
        { title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell', isbn: '978-0134610993', category: 'Computer Science', publisher: 'Pearson', year: 2020, totalCopies: 3, availableCopies: 3, coverColor: '#10b981', description: 'The most comprehensive text on AI available.' },
        { title: 'Structural Analysis', author: 'R.C. Hibbeler', isbn: '978-0134610672', category: 'Civil', publisher: 'Pearson', year: 2017, totalCopies: 3, availableCopies: 3, coverColor: '#f97316', description: 'Structural analysis for civil engineering students.' },
        { title: 'Computer Networks', author: 'Andrew S. Tanenbaum', isbn: '978-0132126953', category: 'Computer Science', publisher: 'Pearson', year: 2011, totalCopies: 5, availableCopies: 5, coverColor: '#3b82f6', description: 'A comprehensive guide to computer networking.' },
        { title: 'Discrete Mathematics', author: 'Kenneth H. Rosen', isbn: '978-0073383095', category: 'Mathematics', publisher: 'McGraw-Hill', year: 2019, totalCopies: 4, availableCopies: 4, coverColor: '#a855f7', description: 'The standard textbook for discrete mathematics.' },
        { title: 'Linear Algebra Done Right', author: 'Sheldon Axler', isbn: '978-3319110790', category: 'Mathematics', publisher: 'Springer', year: 2014, totalCopies: 2, availableCopies: 2, coverColor: '#0ea5e9', description: 'A different approach to linear algebra.' },
    ];

    for (const book of sampleBooks) {
        await addDoc(collection(db, BOOKS_COL), {
            ...book,
            addedBy: user.uid,
            createdAt: serverTimestamp(),
        });
    }

    await logActivity(user.uid, user.displayName || user.email, 'seed_data', 'Seeded 12 sample books');
    return { seeded: true, message: `Seeded ${sampleBooks.length} books` };
}
