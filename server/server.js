import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'libraryx_secret_key_2026';

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================
// IN-MEMORY DATABASE (Replace with Firestore/SQLite in production)
// ============================================================

const db = {
    users: [
        { id: 'u1', name: 'Arjun Mehta', email: 'arjun@college.edu', password: '$2a$10$xVqYLGMKFi0XnTOqRcJFOeQ0fR8yJIMkQwKQfT/0nNYf.Qu5AZYGG', role: 'student', department: 'Computer Science', year: '3rd', createdAt: '2024-08-15' },
        { id: 'u2', name: 'Priya Sharma', email: 'priya@college.edu', password: '$2a$10$xVqYLGMKFi0XnTOqRcJFOeQ0fR8yJIMkQwKQfT/0nNYf.Qu5AZYGG', role: 'student', department: 'Electronics', year: '2nd', createdAt: '2024-09-01' },
        { id: 'u3', name: 'Rahul Verma', email: 'rahul@college.edu', password: '$2a$10$xVqYLGMKFi0XnTOqRcJFOeQ0fR8yJIMkQwKQfT/0nNYf.Qu5AZYGG', role: 'student', department: 'Mechanical', year: '4th', createdAt: '2023-07-10' },
        { id: 'u4', name: 'Ms. Kavita Das', email: 'kavita@college.edu', password: '$2a$10$xVqYLGMKFi0XnTOqRcJFOeQ0fR8yJIMkQwKQfT/0nNYf.Qu5AZYGG', role: 'librarian', department: 'Library', createdAt: '2020-01-05' },
        { id: 'u5', name: 'Dr. Suresh Iyer', email: 'suresh@college.edu', password: '$2a$10$xVqYLGMKFi0XnTOqRcJFOeQ0fR8yJIMkQwKQfT/0nNYf.Qu5AZYGG', role: 'admin', department: 'Administration', createdAt: '2019-06-15' },
    ],
    books: [
        { id: 'b1', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0262033848', category: 'Computer Science', publisher: 'MIT Press', year: 2009, totalCopies: 5, availableCopies: 2 },
        { id: 'b2', title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', category: 'Software Engineering', publisher: 'Prentice Hall', year: 2008, totalCopies: 4, availableCopies: 1 },
        { id: 'b3', title: 'Design Patterns', author: 'Gang of Four', isbn: '978-0201633610', category: 'Software Engineering', publisher: 'Addison-Wesley', year: 1994, totalCopies: 3, availableCopies: 0 },
        { id: 'b4', title: 'Database System Concepts', author: 'Abraham Silberschatz', isbn: '978-0078022159', category: 'Computer Science', publisher: 'McGraw-Hill', year: 2019, totalCopies: 6, availableCopies: 4 },
        { id: 'b5', title: 'Digital Electronics', author: 'Morris Mano', isbn: '978-0132774208', category: 'Electronics', publisher: 'Pearson', year: 2012, totalCopies: 4, availableCopies: 3 },
    ],
    issuedBooks: [],
    reservations: [],
    notifications: [],
    activityLogs: [],
};

// ============================================================
// AUTH MIDDLEWARE
// ============================================================

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

function roleMiddleware(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        next();
    };
}

// ============================================================
// AUTH ROUTES
// ============================================================

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role = 'student' } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        // Check if user exists
        if (db.users.find(u => u.email === email)) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = {
            id: uuidv4(),
            name,
            email,
            password: hashedPassword,
            role,
            department: 'General',
            createdAt: new Date().toISOString().split('T')[0],
        };

        db.users.push(user);

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ token, user: { ...user, password: undefined } });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = db.users.find(u => u.email === email);
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        // For demo: accept any password for seeded users
        const isMatch = await bcrypt.compare(password, user.password).catch(() => true);

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { ...user, password: undefined } });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ ...user, password: undefined });
});

// ============================================================
// BOOK ROUTES
// ============================================================

// List all books with search/filter
app.get('/api/books', (req, res) => {
    let books = [...db.books];
    const { search, category, available } = req.query;

    if (search) {
        const s = search.toLowerCase();
        books = books.filter(b =>
            b.title.toLowerCase().includes(s) ||
            b.author.toLowerCase().includes(s) ||
            b.isbn.includes(s)
        );
    }
    if (category && category !== 'All') {
        books = books.filter(b => b.category === category);
    }
    if (available === 'true') {
        books = books.filter(b => b.availableCopies > 0);
    }

    res.json(books);
});

// Get single book
app.get('/api/books/:id', (req, res) => {
    const book = db.books.find(b => b.id === req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
});

// Add book (librarian/admin)
app.post('/api/books', authMiddleware, roleMiddleware('librarian', 'admin'), (req, res) => {
    const book = { id: uuidv4(), ...req.body };
    db.books.push(book);

    db.activityLogs.push({
        id: uuidv4(),
        userId: req.user.id,
        action: 'book_added',
        details: `Added "${book.title}"`,
        timestamp: new Date().toISOString(),
    });

    res.status(201).json(book);
});

// Update book
app.put('/api/books/:id', authMiddleware, roleMiddleware('librarian', 'admin'), (req, res) => {
    const idx = db.books.findIndex(b => b.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Book not found' });
    db.books[idx] = { ...db.books[idx], ...req.body };
    res.json(db.books[idx]);
});

// Delete book
app.delete('/api/books/:id', authMiddleware, roleMiddleware('admin'), (req, res) => {
    const idx = db.books.findIndex(b => b.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Book not found' });
    db.books.splice(idx, 1);
    res.json({ message: 'Book deleted' });
});

// ============================================================
// ISSUE/RETURN ROUTES
// ============================================================

// Issue a book
app.post('/api/issues', authMiddleware, roleMiddleware('librarian', 'admin'), (req, res) => {
    const { bookId, userId } = req.body;
    const book = db.books.find(b => b.id === bookId);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    if (book.availableCopies <= 0) return res.status(400).json({ error: 'No copies available' });

    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 14); // 14-day loan period

    const issue = {
        id: uuidv4(),
        bookId,
        userId,
        issueDate: issueDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        returnDate: null,
        fineAmount: 0,
        status: 'issued',
    };

    db.issuedBooks.push(issue);
    book.availableCopies--;

    // Log activity
    const student = db.users.find(u => u.id === userId);
    db.activityLogs.push({
        id: uuidv4(),
        userId: req.user.id,
        action: 'book_issued',
        details: `Issued "${book.title}" to ${student?.name || 'Unknown'}`,
        timestamp: new Date().toISOString(),
    });

    // Create notification
    db.notifications.push({
        id: uuidv4(),
        userId,
        type: 'issued',
        message: `"${book.title}" has been issued to you. Due: ${issue.dueDate}`,
        read: false,
        createdAt: new Date().toISOString().split('T')[0],
    });

    res.status(201).json(issue);
});

// Return a book
app.put('/api/issues/:id/return', authMiddleware, roleMiddleware('librarian', 'admin'), (req, res) => {
    const issue = db.issuedBooks.find(i => i.id === req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue record not found' });
    if (issue.status === 'returned') return res.status(400).json({ error: 'Already returned' });

    const returnDate = new Date();
    issue.returnDate = returnDate.toISOString().split('T')[0];
    issue.status = 'returned';

    // Calculate fine: ₹5 per day overdue
    const due = new Date(issue.dueDate);
    if (returnDate > due) {
        const daysOverdue = Math.ceil((returnDate - due) / (1000 * 60 * 60 * 24));
        issue.fineAmount = daysOverdue * 5;
    }

    // Restore available copy
    const book = db.books.find(b => b.id === issue.bookId);
    if (book) book.availableCopies++;

    // Check reservation queue
    const nextReservation = db.reservations
        .filter(r => r.bookId === issue.bookId && r.status === 'waiting')
        .sort((a, b) => a.position - b.position)[0];

    if (nextReservation) {
        db.notifications.push({
            id: uuidv4(),
            userId: nextReservation.userId,
            type: 'reservation',
            message: `"${book?.title}" is now available for pickup!`,
            read: false,
            createdAt: new Date().toISOString().split('T')[0],
        });
    }

    res.json(issue);
});

// List issues
app.get('/api/issues', authMiddleware, (req, res) => {
    let issues = [...db.issuedBooks];

    if (req.user.role === 'student') {
        issues = issues.filter(i => i.userId === req.user.id);
    }

    res.json(issues);
});

// ============================================================
// RESERVATION ROUTES
// ============================================================

app.post('/api/reservations', authMiddleware, (req, res) => {
    const { bookId } = req.body;
    const book = db.books.find(b => b.id === bookId);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    const existingQueue = db.reservations.filter(r => r.bookId === bookId && r.status === 'waiting');

    const reservation = {
        id: uuidv4(),
        bookId,
        userId: req.user.id,
        reservedAt: new Date().toISOString().split('T')[0],
        position: existingQueue.length + 1,
        status: 'waiting',
    };

    db.reservations.push(reservation);
    res.status(201).json(reservation);
});

app.get('/api/reservations', authMiddleware, (req, res) => {
    let reservations = [...db.reservations];
    if (req.user.role === 'student') {
        reservations = reservations.filter(r => r.userId === req.user.id);
    }
    res.json(reservations);
});

// ============================================================
// NOTIFICATION ROUTES
// ============================================================

app.get('/api/notifications', authMiddleware, (req, res) => {
    let notifications = db.notifications.filter(n => n.userId === req.user.id);
    res.json(notifications);
});

app.put('/api/notifications/:id/read', authMiddleware, (req, res) => {
    const notif = db.notifications.find(n => n.id === req.params.id);
    if (!notif) return res.status(404).json({ error: 'Not found' });
    notif.read = true;
    res.json(notif);
});

// ============================================================
// ANALYTICS ROUTES
// ============================================================

app.get('/api/analytics/overview', authMiddleware, roleMiddleware('admin'), (req, res) => {
    res.json({
        totalBooks: db.books.reduce((sum, b) => sum + b.totalCopies, 0),
        totalIssued: db.issuedBooks.filter(i => i.status !== 'returned').length,
        totalUsers: db.users.length,
        totalFines: db.issuedBooks.reduce((sum, i) => sum + i.fineAmount, 0),
        overdueCount: db.issuedBooks.filter(i => i.status === 'overdue').length,
    });
});

// ============================================================
// ACTIVITY LOGS
// ============================================================

app.get('/api/activity-logs', authMiddleware, (req, res) => {
    let logs = [...db.activityLogs];
    if (req.user.role === 'student') {
        logs = logs.filter(l => l.userId === req.user.id);
    }
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(logs);
});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'LibraryX API' });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════╗
  ║  📚 LibraryX API Server             ║
  ║  Running on http://localhost:${PORT}   ║
  ║  Status: Active                      ║
  ╚══════════════════════════════════════╝
  `);
});
