import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBllFjPqquc_b9NHlhwE7JIYOXSKHUvXlk",
    authDomain: "library-2bf71.firebaseapp.com",
    projectId: "library-2bf71",
    storageBucket: "library-2bf71.firebasestorage.app",
    messagingSenderId: "344145901626",
    appId: "1:344145901626:web:93b0fb663e5d3f3de79d03",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Use REST API for EmailJS
async function sendEmailREST(config, toEmail, toName, subject, message) {
    if (!config || !toEmail) return false;

    try {
        const payload = {
            service_id: config.serviceId,
            template_id: config.templateId,
            user_id: config.publicKey,
            template_params: {
                to_email: toEmail,
                to_name: toName,
                subject: subject,
                message: message,
                from_name: 'LibraryX',
                reply_to: 'noreply@libraryx.app'
            }
        };

        const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            console.log(`Cron email sent to ${toEmail}`);
            return true;
        } else {
            console.warn(`EmailJS error for ${toEmail}:`, await res.text());
            return false;
        }
    } catch (err) {
        console.error('Email API failed:', err);
        return false;
    }
}

export default async function handler(req, res) {
    try {
        console.log("Starting daily cron job...");
        const settingsDoc = await getDoc(doc(db, 'settings', 'admin'));
        const settings = settingsDoc.exists() ? settingsDoc.data() : {};

        const emailConfig = {
            serviceId: settings.emailjsServiceId || 'service_s9wogqc',
            templateId: settings.emailjsTemplateId || 'template_4jjct3n',
            publicKey: settings.emailjsPublicKey || '_B8LRrfbNPBXmrkSY'
        };

        // Get active issues
        const issuesReq = query(collection(db, 'issuedBooks'), where('status', '==', 'issued'));
        const issueSnap = await getDocs(issuesReq);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let emailsSent = 0;

        for (const issueDoc of issueSnap.docs) {
            const issue = issueDoc.data();
            if (!issue.userEmail || !issue.dueDate) continue;

            const dueDate = new Date(issue.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            // Compare dates
            const daysDiff = (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

            if (daysDiff === 1) {
                // Due tomorrow
                const subject = `⏰ Reminder: "${issue.bookTitle}" is due tomorrow!`;
                const message = `Hello ${issue.userName},\n\nJust a friendly reminder that your book "${issue.bookTitle}" is due Tomorrow (${issue.dueDate}).\n\nPlease return it to the library on time to avoid fine charges.\n\n— LibraryX`;
                await sendEmailREST(emailConfig, issue.userEmail, issue.userName, subject, message);
                emailsSent++;
            } else if (daysDiff < 0) {
                // Overdue
                const daysOverdue = Math.abs(daysDiff);
                const subject = `⚠️ URGENT: "${issue.bookTitle}" is OVERDUE by ${daysOverdue} day(s)`;
                const message = `Hello ${issue.userName},\n\nThis is an automated reminder that your borrowed book "${issue.bookTitle}" was due on ${issue.dueDate} and is now ${daysOverdue} day(s) overdue.\n\nPlease return it immediately to stop additional fine accumulation.\n\n— LibraryX`;
                await sendEmailREST(emailConfig, issue.userEmail, issue.userName, subject, message);
                emailsSent++;
            }
        }

        res.status(200).json({ success: true, processedCount: issueSnap.docs.length, emailsSent });
    } catch (err) {
        console.error("Cron failed:", err);
        res.status(500).json({ success: false, error: err.message });
    }
}
