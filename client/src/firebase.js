import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBllFjPqquc_b9NHlhwE7JIYOXSKHUvXlk",
    authDomain: "library-2bf71.firebaseapp.com",
    projectId: "library-2bf71",
    storageBucket: "library-2bf71.firebasestorage.app",
    messagingSenderId: "344145901626",
    appId: "1:344145901626:web:93b0fb663e5d3f3de79d03",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
