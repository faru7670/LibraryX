// Service for Admins to create Staff accounts without being logged out
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Duplicated config from firebase.js to initialize a secondary app
const firebaseConfig = {
    apiKey: "AIzaSyBllFjPqquc_b9NHlhwE7JIYOXSKHUvXlk",
    authDomain: "library-2bf71.firebaseapp.com",
    projectId: "library-2bf71",
    storageBucket: "library-2bf71.firebasestorage.app",
    messagingSenderId: "344145901626",
    appId: "1:344145901626:web:93b0fb663e5d3f3de79d03",
};

export async function createStaffAccount(email, password, name, role, department) {
    // Initialize a secondary Firebase app instance to handle the new user creation
    const adminAppName = `AdminCreateApp_${Date.now()}`; // unique name to avoid conflicts if called multiple times rapidly
    const adminApp = initializeApp(firebaseConfig, adminAppName);
    const adminAuth = getAuth(adminApp);

    try {
        const userCredential = await createUserWithEmailAndPassword(adminAuth, email, password);
        const newUser = userCredential.user;

        // Write to Firestore using the MAIN db (where the Admin is authenticated)
        await setDoc(doc(db, 'users', newUser.uid), {
            name,
            email,
            role,
            department: department || 'Staff',
            createdAt: new Date().toISOString()
        });

        // Sign out the secondary app session immediately
        await signOut(adminAuth);

        return { success: true, uid: newUser.uid };
    } catch (error) {
        console.error("Error creating staff account:", error);

        // Return a cleaner error message
        let errorMessage = "Failed to create account.";
        if (error.code === 'auth/email-already-in-use') errorMessage = "Email is already registered.";
        else if (error.code === 'auth/weak-password') errorMessage = "Password must be at least 6 characters.";

        return { success: false, error: errorMessage };
    }
}
