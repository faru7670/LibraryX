import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        // Instant restore from cache
        try {
            const c = localStorage.getItem('libx_user');
            return c ? JSON.parse(c) : null;
        } catch { return null; }
    });
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState('');

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (fbUser) => {
            if (fbUser) {
                await loadProfile(fbUser);
            } else {
                setUser(null);
                localStorage.removeItem('libx_user');
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    async function loadProfile(fbUser) {
        try {
            const snap = await getDoc(doc(db, 'users', fbUser.uid));
            if (snap.exists()) {
                const p = snap.data();
                const u = { uid: fbUser.uid, email: fbUser.email, name: p.name || fbUser.displayName || 'User', role: p.role, department: p.department || 'General' };
                setUser(u);
                localStorage.setItem('libx_user', JSON.stringify(u));
                setAuthError('');
            } else {
                // Auth exists but no Firestore profile — create one
                const p = { name: fbUser.displayName || 'User', email: fbUser.email, role: 'student', department: 'General', createdAt: serverTimestamp() };
                await setDoc(doc(db, 'users', fbUser.uid), p);
                const u = { uid: fbUser.uid, email: fbUser.email, ...p };
                setUser(u);
                localStorage.setItem('libx_user', JSON.stringify(u));
            }
        } catch (err) {
            console.error('FIRESTORE READ FAILED:', err);
            setAuthError('Cannot read your profile from Firestore. Check Firestore Rules — they must allow reads on the "users" collection. Error: ' + err.message);
            // Fallback to cache if available
            const c = localStorage.getItem('libx_user');
            if (c) {
                try {
                    const cached = JSON.parse(c);
                    if (cached.uid === fbUser.uid) { setUser(cached); return; }
                } catch { }
            }
            setUser({ uid: fbUser.uid, email: fbUser.email, name: fbUser.displayName || 'User', role: 'student', department: 'General' });
        }
    }

    async function register(name, email, password, role = 'student', department = 'General') {
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(cred.user, { displayName: name });
            const p = { name, email, role, department, createdAt: serverTimestamp() };
            await setDoc(doc(db, 'users', cred.user.uid), p);
            const u = { uid: cred.user.uid, email, name, role, department };
            setUser(u);
            localStorage.setItem('libx_user', JSON.stringify(u));
            return { success: true };
        } catch (err) {
            return { success: false, error: errMsg(err.code) };
        }
    }

    async function login(email, password) {
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            await loadProfile(cred.user);
            return { success: true };
        } catch (err) {
            return { success: false, error: errMsg(err.code) };
        }
    }

    async function logout() {
        await signOut(auth);
        setUser(null);
        localStorage.removeItem('libx_user');
    }

    async function updateUserProfile(updates) {
        if (!user?.uid) return;
        await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
        const u = { ...user, ...updates };
        setUser(u);
        localStorage.setItem('libx_user', JSON.stringify(u));
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register, updateUserProfile, authError }}>
            {children}
        </AuthContext.Provider>
    );
}

function errMsg(code) {
    const m = { 'auth/email-already-in-use': 'Email already registered.', 'auth/invalid-email': 'Invalid email.', 'auth/weak-password': 'Password too short (min 6).', 'auth/user-not-found': 'No account found.', 'auth/wrong-password': 'Wrong password.', 'auth/invalid-credential': 'Invalid email or password.', 'auth/too-many-requests': 'Too many attempts. Wait.' };
    return m[code] || 'Something went wrong.';
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
