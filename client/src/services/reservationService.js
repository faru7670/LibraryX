// Reservation Service — Real Firestore reservation queue
import { db } from '../firebase';
import {
    collection, doc, addDoc, getDocs, updateDoc,
    query, where, orderBy, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { logActivity } from './activityService';
import { createNotification } from './notificationService';

const RES_COL = 'reservations';

// Reserve a book (goes into queue)
export async function reserveBook(bookId, bookTitle, user) {
    // Check existing queue for this book
    const q = query(
        collection(db, RES_COL),
        where('bookId', '==', bookId),
        where('status', '==', 'waiting')
    );
    const existing = await getDocs(q);

    // Check if user already reserved this book
    const alreadyReserved = existing.docs.find(d => d.data().userId === user.uid);
    if (alreadyReserved) throw new Error('You already reserved this book');

    const position = existing.size + 1;

    const resDoc = await addDoc(collection(db, RES_COL), {
        bookId,
        bookTitle,
        userId: user.uid,
        userName: user.displayName || user.email,
        reservedAt: new Date().toISOString().split('T')[0],
        position,
        status: 'waiting',
        createdAt: serverTimestamp(),
    });

    await createNotification(
        user.uid,
        'reservation',
        `You are #${position} in queue for "${bookTitle}".`
    );

    await logActivity(user.uid, user.displayName || user.email, 'reservation_placed', `Reserved "${bookTitle}" (position #${position})`);

    return { id: resDoc.id, position };
}

// Get reservations (filtered by role)
export async function getReservations(userRole, userId) {
    const ref = collection(db, RES_COL);
    let q;

    if (userRole === 'student') {
        q = query(ref, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    } else {
        q = query(ref, orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => {
        const data = d.data();
        return {
            id: d.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        };
    });
}

// Cancel a reservation
export async function cancelReservation(resId, user) {
    await updateDoc(doc(db, RES_COL, resId), { status: 'cancelled' });
    await logActivity(user.uid, user.displayName || user.email, 'reservation_cancelled', `Cancelled reservation ${resId}`);
}
