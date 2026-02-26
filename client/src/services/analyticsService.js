// Analytics Service — Compute real analytics from Firestore data
import { db } from '../firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';

// Get overview stats for admin dashboard
export async function getAdminStats() {
    const [booksSnap, issuesSnap, usersSnap, reservationsSnap] = await Promise.all([
        getDocs(collection(db, 'books')),
        getDocs(collection(db, 'issuedBooks')),
        getDocs(collection(db, 'users')),
        getDocs(query(collection(db, 'reservations'), where('status', '==', 'waiting'))),
    ]);

    const books = booksSnap.docs.map(d => d.data());
    const issues = issuesSnap.docs.map(d => d.data());
    const users = usersSnap.docs.map(d => d.data());

    const totalBooks = books.reduce((sum, b) => sum + (b.totalCopies || 0), 0);
    const activeIssues = issues.filter(i => i.status === 'issued' || i.status === 'overdue');
    const now = new Date();
    const overdue = issues.filter(i =>
        i.status !== 'returned' && new Date(i.dueDate) < now
    );
    const totalFines = issues.reduce((sum, i) => sum + (i.fineAmount || 0), 0);
    const students = users.filter(u => u.role === 'student');

    // Category distribution
    const catMap = {};
    books.forEach(b => {
        catMap[b.category] = (catMap[b.category] || 0) + 1;
    });
    const categoryDistribution = Object.entries(catMap).map(([name, value]) => ({
        name,
        value,
        color: getColor(name),
    }));

    // Most borrowed books (count issues per bookTitle)
    const bookCountMap = {};
    issues.forEach(i => {
        const t = i.bookTitle || 'Unknown';
        bookCountMap[t] = (bookCountMap[t] || 0) + 1;
    });
    const mostBorrowed = Object.entries(bookCountMap)
        .map(([title, count]) => ({ title, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Monthly data (last 6 months)
    const monthlyUsage = getMonthlyData(issues);

    // Dead stock: books that have never been issued
    const issuedBookIds = new Set(issues.map(i => i.bookId));
    const deadStock = booksSnap.docs
        .filter(d => !issuedBookIds.has(d.id))
        .map(d => ({ id: d.id, ...d.data() }));

    return {
        totalBooks,
        issuedCount: activeIssues.length,
        totalUsers: users.length,
        studentCount: students.length,
        totalFines,
        overdueCount: overdue.length,
        overdueRate: issues.length > 0 ? ((overdue.length / issues.length) * 100).toFixed(1) : '0',
        pendingReservations: reservationsSnap.size,
        categoryDistribution,
        mostBorrowed,
        monthlyUsage,
        deadStock,
    };
}

// Get student-specific stats
export async function getStudentStats(userId) {
    const issuesSnap = await getDocs(
        query(collection(db, 'issuedBooks'), where('userId', '==', userId))
    );
    const issues = issuesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const now = new Date();

    const active = issues.filter(i => i.status !== 'returned');
    const overdue = active.filter(i => new Date(i.dueDate) < now);
    const returned = issues.filter(i => i.status === 'returned');
    const totalFines = issues.reduce((sum, i) => {
        if (i.status === 'returned') return sum + (i.fineAmount || 0);
        if (new Date(i.dueDate) < now) {
            return sum + Math.ceil((now - new Date(i.dueDate)) / (1000 * 60 * 60 * 24)) * 5;
        }
        return sum;
    }, 0);

    // Monthly reading
    const monthlyReading = getMonthlyReading(issues);

    return {
        issuedCount: active.length - overdue.length,
        overdueCount: overdue.length,
        totalRead: issues.length,
        totalFines,
        activeIssues: active.map(i => {
            let status = i.status;
            let fine = i.fineAmount || 0;
            if (new Date(i.dueDate) < now && status !== 'returned') {
                status = 'overdue';
                fine = Math.ceil((now - new Date(i.dueDate)) / (1000 * 60 * 60 * 24)) * 5;
            }
            return { ...i, status, fineAmount: fine };
        }),
        monthlyReading,
    };
}

// Get librarian stats
export async function getLibrarianStats() {
    const [issuesSnap, reservationsSnap] = await Promise.all([
        getDocs(collection(db, 'issuedBooks')),
        getDocs(query(collection(db, 'reservations'), where('status', '==', 'waiting'))),
    ]);

    const issues = issuesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const now = new Date();

    const active = issues.filter(i => i.status !== 'returned');
    const returned = issues.filter(i => i.status === 'returned');
    const overdue = active.filter(i => new Date(i.dueDate) < now);
    const totalFines = issues.reduce((sum, i) => sum + (i.fineAmount || 0), 0);

    // Daily stats for current week
    const dailyStats = getDailyStats(issues);

    // Monthly fine collection
    const monthlyFines = getMonthlyFines(issues);

    return {
        activeIssues: active.length,
        returnedCount: returned.length,
        overdueCount: overdue.length,
        pendingReservations: reservationsSnap.size,
        totalFines,
        overdueList: overdue.map(i => ({
            ...i,
            fineAmount: Math.ceil((now - new Date(i.dueDate)) / (1000 * 60 * 60 * 24)) * 5,
        })),
        reservations: reservationsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        dailyStats,
        monthlyFines,
    };
}

// ---- Helper functions ----

function getColor(category) {
    const colors = {
        'Computer Science': '#6366f1',
        'Software Engineering': '#14b8a6',
        'Electronics': '#8b5cf6',
        'Mechanical': '#ec4899',
        'Civil': '#f97316',
        'Mathematics': '#a855f7',
    };
    return colors[category] || '#64748b';
}

function getMonthlyData(issues) {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = d.toLocaleString('default', { month: 'short' });
        const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

        const monthIssues = issues.filter(issue => issue.issueDate?.startsWith(yearMonth));
        const monthReturns = issues.filter(issue => issue.returnDate?.startsWith(yearMonth));

        months.push({
            month: monthKey,
            issues: monthIssues.length,
            returns: monthReturns.length,
        });
    }
    return months;
}

function getMonthlyReading(issues) {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = d.toLocaleString('default', { month: 'short' });
        const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const count = issues.filter(issue => issue.issueDate?.startsWith(yearMonth)).length;
        months.push({ month: monthKey, books: count });
    }
    return months;
}

function getMonthlyFines(issues) {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = d.toLocaleString('default', { month: 'short' });
        const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const amount = issues
            .filter(i => i.returnDate?.startsWith(yearMonth) && i.fineAmount > 0)
            .reduce((sum, i) => sum + i.fineAmount, 0);
        months.push({ month: monthKey, amount });
    }
    return months;
}

function getDailyStats(issues) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = days[d.getDay()];

        result.push({
            day: dayName,
            issues: issues.filter(issue => issue.issueDate === dateStr).length,
            returns: issues.filter(issue => issue.returnDate === dateStr).length,
        });
    }
    return result;
}
