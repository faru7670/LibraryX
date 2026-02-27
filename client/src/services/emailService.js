// Email Notification Service — Uses EmailJS (free tier: 200 emails/month)
import emailjs from '@emailjs/browser';

// Hardcoded EmailJS credentials
const EMAILJS_SERVICE_ID = 'service_s9wogqc';
const EMAILJS_TEMPLATE_ID = 'template_4jjct3n';
const EMAILJS_PUBLIC_KEY = '_B8LRrfbNPBXmrkSY';

// Initialize EmailJS
emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

/**
 * Send notification email to a user.
 * Silently fails on error — never blocks the main workflow.
 */
export async function sendNotificationEmail(toEmail, toName, subject, message) {
    try {
        const result = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            to_email: toEmail,
            to_name: toName,
            subject: subject,
            message: message,
            from_name: 'LibraryX',
            reply_to: 'noreply@libraryx.app',
        });

        console.log(`📧 Email sent to ${toEmail}`, result);
    } catch (err) {
        // Never throw — email failures should not block core functionality
        console.warn('Email notification failed (non-blocking):', err);
    }
}

/**
 * Send a test email to verify EmailJS is working.
 * THROWS on error so the UI can show the error message.
 */
export async function sendTestEmail(toEmail, toName) {
    const result = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: toEmail,
        to_name: toName,
        subject: '✅ LibraryX Test Email',
        message: `Hello ${toName},\n\nThis is a test email from LibraryX.\n\nIf you received this, your email notifications are working correctly! 🎉\n\n— LibraryX`,
        from_name: 'LibraryX',
        reply_to: 'noreply@libraryx.app',
    });

    return result;
}
