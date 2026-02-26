// Activity Log Service — Real Firestore activity tracking
import { db } from '../firebase';
import {
    collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp, Timestamp
} from 'firebase/firestore';

const ACTIVITY_COL = 'activityLogs';

// Log an activity
export async function logActivity(userId, userName, action, details) {
    await addDoc(collection(db, ACTIVITY_COL), {
        userId,
        userName: userName || 'System',
        action,
        details,
        timestamp: serverTimestamp(),
    });
}

// Get activity logs (filtered by role)
export async function getActivityLogs(userRole, userId, maxResults = 50) {
    const ref = collection(db, ACTIVITY_COL);
    let q;

    if (userRole === 'student') {
        // Students only see their own activity
        q = query(ref, where('userId', '==', userId), orderBy('timestamp', 'desc'), limit(maxResults));
    } else {
        // Librarians and admins see all
        q = query(ref, orderBy('timestamp', 'desc'), limit(maxResults));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => {
        const data = d.data();
        return {
            id: d.id,
            ...data,
            timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate().toISOString() : data.timestamp,
        };
    });
}
