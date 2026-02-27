// Email Notification Service — Uses EmailJS (free tier: 200 emails/month)
import emailjs from '@emailjs/browser';
import { getAppSettings } from './settingsService';

// Default keys (can be overridden in admin Settings)
const DEFAULT_SERVICE_ID = 'service_s9wogqc';
const DEFAULT_TEMPLATE_ID = 'template_4jjct3n';
const DEFAULT_PUBLIC_KEY = '_B8LRrfbNPBXmrkSY';

async function getEmailConfig() {
    try {
        const settings = await getAppSettings();
        return {
            serviceId: settings.emailjsServiceId || DEFAULT_SERVICE_ID,
            templateId: settings.emailjsTemplateId || DEFAULT_TEMPLATE_ID,
            publicKey: settings.emailjsPublicKey || DEFAULT_PUBLIC_KEY,
        };
    } catch {
        return {
            serviceId: DEFAULT_SERVICE_ID,
            templateId: DEFAULT_TEMPLATE_ID,
            publicKey: DEFAULT_PUBLIC_KEY,
        };
    }
}

/**
 * Send notification email. Silently fails — never blocks main workflow.
 */
export async function sendNotificationEmail(toEmail, toName, subject, message) {
    try {
        const config = await getEmailConfig();
        emailjs.init({ publicKey: config.publicKey });

        await emailjs.send(config.serviceId, config.templateId, {
            to_email: toEmail,
            to_name: toName,
            subject: subject,
            message: message,
            from_name: 'LibraryX',
            reply_to: 'noreply@libraryx.app',
        });
        console.log(`📧 Email sent to ${toEmail}`);
    } catch (err) {
        console.warn('Email notification failed (non-blocking):', err);
    }
}

/**
 * Send test email. THROWS on error for UI feedback.
 */
export async function sendTestEmail(toEmail, toName) {
    const config = await getEmailConfig();
    emailjs.init({ publicKey: config.publicKey });

    return await emailjs.send(config.serviceId, config.templateId, {
        to_email: toEmail,
        to_name: toName,
        subject: '✅ LibraryX Test Email',
        message: `Hello ${toName},\n\nThis is a test email from LibraryX.\n\nIf you received this, your email notifications are working correctly! 🎉\n\n— LibraryX`,
        from_name: 'LibraryX',
        reply_to: 'noreply@libraryx.app',
    });
}
