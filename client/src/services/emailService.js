// Email Notification Service — Uses EmailJS (free tier: 200 emails/month)
import emailjs from '@emailjs/browser';
import { getAppSettings } from './settingsService';

/**
 * Send notification email to a user.
 * Silently fails if EmailJS is not configured — never blocks the main workflow.
 */
export async function sendNotificationEmail(toEmail, toName, subject, message) {
    try {
        const settings = await getAppSettings();

        // Check if EmailJS is configured
        if (!settings.emailjsPublicKey || !settings.emailjsServiceId || !settings.emailjsTemplateId) {
            console.log('EmailJS not configured — skipping email notification');
            return;
        }

        // Always re-init to pick up any settings changes
        emailjs.init({ publicKey: settings.emailjsPublicKey });

        const result = await emailjs.send(settings.emailjsServiceId, settings.emailjsTemplateId, {
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
 * Send a test email to verify EmailJS configuration is working.
 * Unlike sendNotificationEmail, this THROWS on error so the UI can show the error.
 */
export async function sendTestEmail(toEmail, toName) {
    const settings = await getAppSettings();

    if (!settings.emailjsPublicKey || !settings.emailjsServiceId || !settings.emailjsTemplateId) {
        throw new Error('EmailJS is not configured. Please fill in Service ID, Template ID, and Public Key.');
    }

    emailjs.init({ publicKey: settings.emailjsPublicKey });

    const result = await emailjs.send(settings.emailjsServiceId, settings.emailjsTemplateId, {
        to_email: toEmail,
        to_name: toName,
        subject: '✅ LibraryX Test Email',
        message: `Hello ${toName},\n\nThis is a test email from LibraryX.\n\nIf you received this, your email notifications are working correctly! 🎉\n\n— LibraryX`,
        from_name: 'LibraryX',
        reply_to: 'noreply@libraryx.app',
    });

    return result;
}
