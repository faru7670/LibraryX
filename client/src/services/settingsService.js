// Settings Service — App-wide settings stored in Firestore
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SETTINGS_DOC = doc(db, 'settings', 'app');

const DEFAULT_SETTINGS = {
    defaultDueDays: 14,
    finePerDay: 5,
    lostBookFine: 500,
    emailjsServiceId: '',
    emailjsTemplateId: '',
    emailjsPublicKey: '',
};

// Get app settings (with defaults)
export async function getAppSettings() {
    try {
        const snap = await getDoc(SETTINGS_DOC);
        if (snap.exists()) {
            return { ...DEFAULT_SETTINGS, ...snap.data() };
        }
        return { ...DEFAULT_SETTINGS };
    } catch (err) {
        console.error('Failed to load settings:', err);
        return { ...DEFAULT_SETTINGS };
    }
}

// Save app settings (admin/librarian only)
export async function saveAppSettings(settings) {
    await setDoc(SETTINGS_DOC, settings, { merge: true });
}
