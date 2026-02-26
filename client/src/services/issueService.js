// Issue/Return Service — Real Firestore issue and return workflows
import { db } from '../firebase';
import {
    collection, doc, addDoc, getDocs, getDoc, updateDoc,
    query, where, orderBy, serverTimestamp, Timestamp, increment
} from 'firebase/firestore';
import { logActivity } from './activityService';
import { createNotification } from './notificationService';

const ISSUES_COL = 'issuedBooks';
const BOOKS_COL = 'books';
const RESERVATIONS_COL = 'reservations';

// Issue a book to a student
export async function issueBook({ bookId, bookTitle, userId, userName }, issuedBy) {
    // Check book availability
    const bookRef = doc(db, BOOKS_COL, bookId);
    const bookSnap = await getDoc(bookRef);
    if (!bookSnap.exists()) throw new Error('Book not found');

    const book = bookSnap.data();
    if (book.availableCopies <= 0) throw new Error('No copies available');

    // Calculate due date (14 days from now)
    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 14);

    // Create issue record
    const issueDoc = await addDoc(collection(db, ISSUES_COL), {
        bookId,
        bookTitle: bookTitle || book.title,
        userId,
        userName,
        issueDate: issueDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        returnDate: null,
        fineAmount: 0,
        status: 'issued',
        createdAt: serverTimestamp(),
    });

    // Decrement available copies
    await updateDoc(bookRef, {
        availableCopies: increment(-1),
    });

    // Create notification for student
    await createNotification(
        userId,
        'issued',
        `"${bookTitle || book.title}" has been issued to you. Due: ${dueDate.toISOString().split('T')[0]}`
    );

    // Log activity
    await logActivity(
        issuedBy.uid,
        issuedBy.displayName || issuedBy.email,
        'book_issued',
        `Issued "${bookTitle || book.title}" to ${userName}`
    );

    return { id: issueDoc.id, bookId, userId, issueDate: issueDate.toISOString().split('T')[0], dueDate: dueDate.toISOString().split('T')[0], status: 'issued' };
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

    // Calculate fine: ₹5 per day overdue
    let fineAmount = 0;
    if (returnDate > dueDate) {
        const daysOverdue = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
        fineAmount = daysOverdue * 5;
    }

    // Update issue record
    await updateDoc(issueRef, {
        returnDate: returnDate.toISOString().split('T')[0],
        fineAmount,
        status: 'returned',
    });

    // Restore available copy
    const bookRef = doc(db, BOOKS_COL, issue.bookId);
    await updateDoc(bookRef, {
        availableCopies: increment(1),
    });

    // Notification for student
    const msg = fineAmount > 0
        ? `"${issue.bookTitle}" returned. Fine: ₹${fineAmount} (${Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24))} days overdue).`
        : `"${issue.bookTitle}" returned successfully. No fines.`;
    await createNotification(issue.userId, 'returned', msg);

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

    // Log activity
    await logActivity(
        returnedBy.uid,
        returnedBy.displayName || returnedBy.email,
        'book_returned',
        `Returned "${issue.bookTitle}" from ${issue.userName}. Fine: ₹${fineAmount}`
    );

    return { fineAmount, returnDate: returnDate.toISOString().split('T')[0] };
}

// Get all issues (filtered by role)
export async function getIssues(userRole, userId) {
    const ref = collection(db, ISSUES_COL);
    let q;

    if (userRole === 'student') {
        q = query(ref, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    } else {
        q = query(ref, orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    const now = new Date();

    return snapshot.docs.map(d => {
        const data = d.data();
        // Auto-calculate overdue status
        let status = data.status;
        let fineAmount = data.fineAmount || 0;
        if (status === 'issued' && new Date(data.dueDate) < now) {
            status = 'overdue';
            const daysOverdue = Math.ceil((now - new Date(data.dueDate)) / (1000 * 60 * 60 * 24));
            fineAmount = daysOverdue * 5;
        }
        return {
            id: d.id,
            ...data,
            status,
            fineAmount,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        };
    });
}

// Get student's currently active issues (for dashboard)
export async function getStudentActiveIssues(userId) {
    const ref = collection(db, ISSUES_COL);
    const q = query(ref, where('userId', '==', userId), where('status', 'in', ['issued', 'overdue']));
    const snapshot = await getDocs(q);
    const now = new Date();

    return snapshot.docs.map(d => {
        const data = d.data();
        let status = data.status;
        let fineAmount = data.fineAmount || 0;
        if (status === 'issued' && new Date(data.dueDate) < now) {
            status = 'overdue';
            fineAmount = Math.ceil((now - new Date(data.dueDate)) / (1000 * 60 * 60 * 24)) * 5;
        }
        return { id: d.id, ...data, status, fineAmount };
    });
}
