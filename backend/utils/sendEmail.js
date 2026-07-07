const nodemailer = require('nodemailer');

/**
 * Sends an email if SMTP credentials are configured via env vars.
 * Fails soft: if EMAIL_USER / EMAIL_PASS are missing, or sending errors,
 * it logs and returns false instead of throwing — so a missing mail
 * config never breaks the core complaint workflow.
 *
 * To enable, add to backend/.env:
 *   EMAIL_USER=youraddress@gmail.com
 *   EMAIL_PASS=your_gmail_app_password   (a 16-char App Password, not your login password)
 */
const sendEmail = async ({ to, subject, html }) => {
    const { EMAIL_USER, EMAIL_PASS } = process.env;

    if (!EMAIL_USER || !EMAIL_PASS) {
        console.log(`[email] Skipped "${subject}" to ${to} — SMTP not configured (set EMAIL_USER/EMAIL_PASS).`);
        return false;
    }

    if (!to) {
        console.log('[email] Skipped — no recipient address.');
        return false;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: EMAIL_USER, pass: EMAIL_PASS }
        });

        await transporter.sendMail({
            from: `"DCMS Grampanchayat" <${EMAIL_USER}>`,
            to,
            subject,
            html
        });
        console.log(`[email] Sent "${subject}" to ${to}.`);
        return true;
    } catch (err) {
        console.error(`[email] Failed to send to ${to}:`, err.message);
        return false;
    }
};

module.exports = sendEmail;
