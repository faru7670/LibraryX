import md5 from 'md5';

/**
 * Generate Gravatar URL from email address.
 * Falls back to a colorful identicon if no Gravatar exists.
 * @param {string} email 
 * @param {number} size - Image size in pixels (default 80)
 * @returns {string} Gravatar URL
 */
export function getGravatarUrl(email, size = 80) {
    if (!email) return `https://www.gravatar.com/avatar/?d=identicon&s=${size}`;
    const hash = md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`;
}
