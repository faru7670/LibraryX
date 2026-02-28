// Issue/Return Service — Real Firestore issue and return workflows
import { db } from '../firebase';
import {
    collection, doc, addDoc, getDocs, getDoc, updateDoc,
    query, where, orderBy, serverTimestamp, Timestamp, increment
} from 'firebase/firestore';
import { logActivity, logStudentActivity } from './activityService';
import { createNotification } from './notificationService';
import { sendNotificationEmail } from './emailService';
import { getAppSettings } from './settingsService';

const ISSUES_COL = 'issuedBooks';
const BOOKS_COL = 'books';
const RESERVATIONS_COL = 'reservations';

// Issue a book to a student or faculty
export async function issueBook({ bookId, bookTitle, userId, userName, userEmail, dueDate }, issuedBy) {
    // Check book availability
    const bookRef = doc(db, BOOKS_COL, bookId);
    const bookSnap = await getDoc(bookRef);
    if (!bookSnap.exists()) throw new Error('Book not found');

    const book = bookSnap.data();
    if (book.availableCopies <= 0) throw new Error('No copies available');

    // Use custom due date or calculate from settings
    const issueDate = new Date();
    let finalDueDate;
    if (dueDate) {
        finalDueDate = new Date(dueDate);
    } else {
        const settings = await getAppSettings();
        finalDueDate = new Date(issueDate);
        finalDueDate.setDate(finalDueDate.getDate() + (settings.defaultDueDays || 14));
    }

    const dueDateStr = finalDueDate.toISOString().split('T')[0];

    // Create issue record
    const issueDoc = await addDoc(collection(db, ISSUES_COL), {
        bookId,
        bookTitle: bookTitle || book.title,
        userId,
        userName,
        userEmail: userEmail || '',
        issueDate: issueDate.toISOString().split('T')[0],
        dueDate: dueDateStr,
        returnDate: null,
        fineAmount: 0,
        fineStatus: 'none',
        status: 'issued',
        createdAt: serverTimestamp(),
    });

    // Decrement available copies
    await updateDoc(bookRef, {
        availableCopies: increment(-1),
    });

    // Create in-app notification for the user
    await createNotification(
        userId,
        'issued',
        `"${bookTitle || book.title}" has been issued to you. Due: ${dueDateStr}`
    );

    // Send email notification (non-blocking)
    if (userEmail) {
        sendNotificationEmail(
            userEmail,
            userName,
            `📚 Book Issued: ${bookTitle || book.title}`,
            `Hello ${userName},\n\nThe book "${bookTitle || book.title}" has been issued to you.\n\n📅 Due Date: ${dueDateStr}\n\nPlease return it on time to avoid fines.\n\n— LibraryX`
        );
    }

    // Log activity for librarian
    await logActivity(
        issuedBy.uid,
        issuedBy.displayName || issuedBy.email,
        'book_issued',
        `Issued "${bookTitle || book.title}" to ${userName}`
    );

    // Log activity for the student/faculty
    await logStudentActivity(
        userId,
        userName,
        'book_issued',
        `"${bookTitle || book.title}" was issued to you. Due: ${dueDateStr}`
    );

    return { id: issueDoc.id, bookId, userId, issueDate: issueDate.toISOString().split('T')[0], dueDate: dueDateStr, status: 'issued' };
}

// Return a book
export async function returnBook(issueId, returnedBy) {
    const issueRef = doc(db, ISSUES_COL, issueId);
    const issueSnap = await getDoc(issueRef);
    if (!issueSnap.exists()) throw new Error('Issue record not found');

    const issue = issueSnap.data();
    if (issue.status === 'returned') throw new Error('Book already returned');

    const returnDate = new Date();
    const dueDate = new Date(issue.dueDate);

    // Calculate fine using configurable rate
    const settings = await getAppSettings();
    const finePerDay = settings.finePerDay || 5;
    let fineAmount = 0;
    if (returnDate > dueDate) {
        const daysOverdue = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
        fineAmount = daysOverdue * finePerDay;
    }

    // Update issue record
    const fineStatus = fineAmount > 0 ? 'unpaid' : 'none';
    await updateDoc(issueRef, {
        returnDate: returnDate.toISOString().split('T')[0],
        fineAmount,
        fineStatus,
        status: 'returned',
    });

    // Restore available copy
    const bookRef = doc(db, BOOKS_COL, issue.bookId);
    await updateDoc(bookRef, {
        availableCopies: increment(1),
    });

    // In-app notification for the user
    const msg = fineAmount > 0
        ? `"${issue.bookTitle}" returned. Fine: ₹${fineAmount} (${Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24))} days overdue).`
        : `"${issue.bookTitle}" returned successfully. No fines.`;
    await createNotification(issue.userId, 'returned', msg);

    // Send email notification (non-blocking)
    if (issue.userEmail) {
        sendNotificationEmail(
            issue.userEmail,
            issue.userName,
            `📕 Book Returned: ${issue.bookTitle}`,
            `Hello ${issue.userName},\n\nThe book "${issue.bookTitle}" has been returned.\n\n${fineAmount > 0 ? `💰 Fine: ₹${fineAmount}\n` : '✅ No fines. Great job!\n'}\nThank you for using LibraryX!`
        );
    }

    // Check if anyone is waiting in reservation queue for this book
    const resQuery = query(
        collection(db, RESERVATIONS_COL),
        where('bookId', '==', issue.bookId),
        where('status', '==', 'waiting'),
        orderBy('position')
    );
    const resSnap = await getDocs(resQuery);
    if (resSnap.size > 0) {
        const nextRes = resSnap.docs[0];
        const resData = nextRes.data();
        await createNotification(
            resData.userId,
            'reservation',
            `"${issue.bookTitle}" is now available for pickup! You are #1 in queue.`
        );
    }

    // Log activity for librarian
    await logActivity(
        returnedBy.uid,
        returnedBy.displayName || returnedBy.email,
        'book_returned',
        `Returned "${issue.bookTitle}" from ${issue.userName}. Fine: ₹${fineAmount}`
    );

    // Log activity for the student/faculty
    await logStudentActivity(
        issue.userId,
        issue.userName,
        'book_returned',
        fineAmount > 0
            ? `"${issue.bookTitle}" returned. Fine: ₹${fineAmount}`
            : `"${issue.bookTitle}" returned. No fines!`
    );

    return { fineAmount, returnDate: returnDate.toISOString().split('T')[0] };
}

// Report a book as lost
export async function reportLostBook(issueId, reportedBy) {
    const issueRef = doc(db, ISSUES_COL, issueId);
    const issueSnap = await getDoc(issueRef);
    if (!issueSnap.exists()) throw new Error('Issue record not found');

    const issue = issueSnap.data();
    if (issue.status === 'returned') throw new Error('Book already returned');
    if (issue.status === 'lost') throw new Error('Book already reported as lost');

    // Get configurable lost book fine
    const settings = await getAppSettings();
    const lostBookFine = settings.lostBookFine || 500;

    // Update issue record
    await updateDoc(issueRef, {
        status: 'lost',
        fineAmount: lostBookFine,
        fineStatus: 'unpaid',
        returnDate: new Date().toISOString().split('T')[0],
    });

    // Decrement totalCopies (book is permanently gone)
    const bookRef = doc(db, BOOKS_COL, issue.bookId);
    await updateDoc(bookRef, {
        totalCopies: increment(-1),
    });

    // In-app notification
    const msg = `"${issue.bookTitle}" has been reported as lost. Penalty: ₹${lostBookFine}. Please contact the librarian.`;
    await createNotification(issue.userId, 'lost', msg);

    // Send email notification
    if (issue.userEmail) {
        sendNotificationEmail(
            issue.userEmail,
            issue.userName,
            `⚠️ Book Lost: ${issue.bookTitle}`,
            `Hello ${issue.userName},\n\nThe book "${issue.bookTitle}" has been reported as lost.\n\n💰 Lost Book Penalty: ₹${lostBookFine}\n\nPlease visit the library to settle the fine.\n\n— LibraryX`
        );
    }

    // Log activity for librarian/admin
    await logActivity(
        reportedBy.uid,
        reportedBy.displayName || reportedBy.email,
        'book_lost',
        `"${issue.bookTitle}" reported as lost by ${issue.userName}. Penalty: ₹${lostBookFine}`
    );

    // Log activity for the student/faculty
    await logStudentActivity(
        issue.userId,
        issue.userName,
        'book_lost',
        `"${issue.bookTitle}" reported as lost. Penalty: ₹${lostBookFine}`
    );

    return { fineAmount: lostBookFine };
}

// Pay an unpaid fine
export async function payFine(issueId, paidBy) {
    const issueRef = doc(db, ISSUES_COL, issueId);
    const issueSnap = await getDoc(issueRef);
    if (!issueSnap.exists()) throw new Error('Issue record not found');

    const issue = issueSnap.data();
    if (issue.fineStatus !== 'unpaid') throw new Error('No unpaid fine found or fine already paid.');

    await updateDoc(issueRef, { fineStatus: 'paid' });

    // Log for librarian
    await logActivity(
        paidBy.uid,
        paidBy.displayName || paidBy.email,
        'fine_paid',
        `Collected ₹${issue.fineAmount} fine from ${issue.userName} for "${issue.bookTitle}"`
    );

    // Log for student
    await logStudentActivity(
        issue.userId,
        issue.userName,
        'fine_paid',
        `Paid ₹${issue.fineAmount} fine for "${issue.bookTitle}"`
    );

    return { success: true, amount: issue.fineAmount };
}


// Get all issues (filtered by role)
export async function getIssues(userRole, userId) {
    const ref = collection(db, ISSUES_COL);
    let q;

    if (userRole === 'student' || userRole === 'faculty') {
        q = query(ref, where('userId', '==', userId));
    } else {
        q = query(ref, orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    const now = new Date();

    // Load configurable fine rate
    let finePerDay = 5;
    try {
        const settings = await getAppSettings();
        finePerDay = settings.finePerDay || 5;
    } catch { }

    return snapshot.docs.map(d => {
        const data = d.data();
        // Auto-calculate overdue status
        let status = data.status;
        let fineAmount = data.fineAmount || 0;
        let fineStatus = data.fineStatus || 'none';
        if (status === 'issued' && new Date(data.dueDate) < now) {
            status = 'overdue';
            const daysOverdue = Math.ceil((now - new Date(data.dueDate)) / (1000 * 60 * 60 * 24));
            fineAmount = daysOverdue * finePerDay;
            fineStatus = 'unpaid';
        }
        return {
            id: d.id,
            ...data,
            status,
            fineAmount,
            fineStatus,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        };
    });

    if (userRole === 'student' || userRole === 'faculty') {
        issues.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });
    }

    return issues;
}

// Get student's or faculty's currently active issues (for dashboard)
export async function getStudentActiveIssues(userId) {
    const ref = collection(db, ISSUES_COL);
    const q = query(ref, where('userId', '==', userId), where('status', 'in', ['issued', 'overdue']));
    const snapshot = await getDocs(q);
    const now = new Date();

    let finePerDay = 5;
    try {
        const settings = await getAppSettings();
        finePerDay = settings.finePerDay || 5;
    } catch { }

    return snapshot.docs.map(d => {
        const data = d.data();
        let status = data.status;
        let fineAmount = data.fineAmount || 0;
        if (status === 'issued' && new Date(data.dueDate) < now) {
            status = 'overdue';
            fineAmount = Math.ceil((now - new Date(data.dueDate)) / (1000 * 60 * 60 * 24)) * finePerDay;
        }
        return { id: d.id, ...data, status, fineAmount };
    });
}
