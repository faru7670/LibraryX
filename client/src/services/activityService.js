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

// Log an activity for the student/faculty who is the subject (not the performer)
// This ensures students can see their own history
export async function logStudentActivity(studentId, studentName, action, details) {
    await addDoc(collection(db, ACTIVITY_COL), {
        userId: studentId,
        userName: studentName || 'Student',
        action,
        details,
        timestamp: serverTimestamp(),
    });
}

// Get activity logs (filtered by role)
export async function getActivityLogs(userRole, userId, maxResults = 50) {
    const ref = collection(db, ACTIVITY_COL);
    let q;

    if (userRole === 'student' || userRole === 'faculty') {
        // Students/faculty only see their own activity
        q = query(ref, where('userId', '==', userId));
    } else {
        // Librarians and admins see all
        q = query(ref, orderBy('timestamp', 'desc'), limit(maxResults));
    }

    const snapshot = await getDocs(q);
    const logs = snapshot.docs.map(d => {
        const data = d.data();
        return {
            id: d.id,
            ...data,
            timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate().toISOString() : data.timestamp,
        };
    });

    if (userRole === 'student' || userRole === 'faculty') {
        logs.sort((a, b) => {
            const dateA = new Date(a.timestamp || 0);
            const dateB = new Date(b.timestamp || 0);
            return dateB - dateA;
        });
        return logs.slice(0, maxResults);
    }

    return logs;
}
