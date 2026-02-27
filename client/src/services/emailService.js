// Email Notification Service — Uses EmailJS (free tier: 200 emails/month)
import emailjs from '@emailjs/browser';
import { getAppSettings } from './settingsService';

let initialized = false;

async function ensureInit() {
    if (initialized) return true;
    try {
        const settings = await getAppSettings();
        if (!settings.emailjsPublicKey || !settings.emailjsServiceId || !settings.emailjsTemplateId) {
            return false; // Not configured
        }
        emailjs.init(settings.emailjsPublicKey);
        initialized = true;
        return true;
    } catch (err) {
        console.error('EmailJS init failed:', err);
        return false;
    }
}

/**
 * Send notification email to a user.
 * Silently fails if EmailJS is not configured — never blocks the main workflow.
 */
export async function sendNotificationEmail(toEmail, toName, subject, message) {
    try {
        const ready = await ensureInit();
        if (!ready) {
            console.log('EmailJS not configured — skipping email notification');
            return;
        }

        const settings = await getAppSettings();
        await emailjs.send(settings.emailjsServiceId, settings.emailjsTemplateId, {
            to_email: toEmail,
            to_name: toName,
            subject: subject,
            message: message,
            from_name: 'LibraryX',
        });

        console.log(`📧 Email sent to ${toEmail}`);
    } catch (err) {
        // Never throw — email failures should not block core functionality
        console.warn('Email notification failed (non-blocking):', err);
    }
}
