// Notification Service — Real Firestore notifications
import { db } from '../firebase';
import {
    collection, doc, addDoc, getDocs, updateDoc,
    query, where, orderBy, serverTimestamp, writeBatch, Timestamp
} from 'firebase/firestore';

const NOTIF_COL = 'notifications';

// Create a notification for a user
export async function createNotification(userId, type, message) {
    await addDoc(collection(db, NOTIF_COL), {
        userId,
        type,      // 'issued', 'overdue', 'due_soon', 'returned', 'reservation', 'fine'
        message,
        read: false,
        createdAt: serverTimestamp(),
    });
}

// Get notifications for a user (or all for admin/librarian)
export async function getNotifications(userId, userRole) {
    const ref = collection(db, NOTIF_COL);
    let q;

    if (userRole === 'admin' || userRole === 'librarian') {
        q = query(ref, orderBy('createdAt', 'desc'));
    } else {
        q = query(ref, where('userId', '==', userId));
    }

    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map(d => {
        const data = d.data();
        return {
            id: d.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString().split('T')[0]
                : data.createdAt || '',
        };
    });

    if (userRole === 'student' || userRole === 'faculty') {
        notifications.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });
    }

    return notifications;
}

// Mark a single notification as read
export async function markNotificationRead(notifId) {
    await updateDoc(doc(db, NOTIF_COL, notifId), { read: true });
}

// Mark all notifications as read for a user
export async function markAllNotificationsRead(userId) {
    const ref = collection(db, NOTIF_COL);
    const q = query(ref, where('userId', '==', userId), where('read', '==', false));
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);
    snapshot.docs.forEach(d => {
        batch.update(d.ref, { read: true });
    });
    await batch.commit();
}
