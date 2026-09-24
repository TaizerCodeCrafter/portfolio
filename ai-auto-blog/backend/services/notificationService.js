const axios = require('axios');
const nodemailer = require('nodemailer');
const Setting = require('../models/Setting');

/**
 * Fetch notification config from Database Settings or Environment Variables
 */
async function getNotificationConfig() {
  let dbSettings = {};
  try {
    const settingDoc = await Setting.findOne({ key: 'notification_settings' }).lean();
    if (settingDoc && settingDoc.value) {
      dbSettings = settingDoc.value;
    }
  } catch (e) {
    // Ignore DB errors during settings lookup
  }

  return {
    telegramBotToken: dbSettings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: dbSettings.telegramChatId || process.env.TELEGRAM_CHAT_ID || '',
    notificationEmail: dbSettings.notificationEmail || process.env.NOTIFICATION_EMAIL || 'supundilshan358@gmail.com',
    smtpHost: dbSettings.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: Number(dbSettings.smtpPort || process.env.SMTP_PORT || 465),
    smtpSecure: dbSettings.smtpSecure !== undefined ? dbSettings.smtpSecure : true,
    smtpUser: dbSettings.smtpUser || process.env.SMTP_USER || '',
    smtpPass: dbSettings.smtpPass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || ''
  };
}

/**
 * Send Instant Telegram Notification
 */
async function sendTelegramAlert(text, token, chatId) {
  if (!token || !chatId) return false;
  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await axios.post(url, {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    }, { timeout: 8000 });
    console.log('✅ Telegram alert dispatched successfully');
    return true;
  } catch (err) {
    console.warn('⚠️ Telegram notification failed:', err.response?.data?.description || err.message);
    return false;
  }
}

/**
 * Send Email Notification via Nodemailer
 */
async function sendEmailAlert({ to, subject, html, replyTo }, config) {
  if (!config.smtpUser || !config.smtpPass) return false;
  try {
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass
      }
    });

    await transporter.sendMail({
      from: `"TaizerCodeCrafter Portfolio" <${config.smtpUser}>`,
      to: to || config.notificationEmail,
      replyTo: replyTo || undefined,
      subject: subject,
      html: html
    });
    console.log('✅ Email notification dispatched successfully to:', to || config.notificationEmail);
    return true;
  } catch (err) {
    console.warn('⚠️ Email notification failed:', err.message);
    return false;
  }
}

/**
 * Send Contact Message Alert (Telegram + Email)
 */
async function sendContactAlert({ name, email, subject, message, attachments = [] }) {
  try {
    const config = await getNotificationConfig();
    const attCount = attachments.length;
    const attList = attachments.map(a => a.originalName || a.name || 'file').slice(0, 5).join(', ');
    const attSummary = attCount > 0 ? `${attCount} file(s) [${attList}${attCount > 5 ? '...' : ''}]` : 'None';

    // 1. Telegram Alert
    const telegramText = [
      `🔔 *New Portfolio Contact Message!*`,
      `━━━━━━━━━━━━━━━━━━`,
      `👤 *From:* ${name}`,
      `📧 *Email:* \`${email}\``,
      `📌 *Subject:* ${subject}`,
      `📎 *Attachments:* ${attSummary}`,
      `━━━━━━━━━━━━━━━━━━`,
      `💬 *Message:*`,
      `${message}`,
      `━━━━━━━━━━━━━━━━━━`,
      `🕒 *Time:* ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' })} (LK)`
    ].join('\n');

    await sendTelegramAlert(telegramText, config.telegramBotToken, config.telegramChatId);

    // 2. Email Alert
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="border-bottom: 2px solid #b35a00; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 1.3rem;">🔔 New Portfolio Contact Message</h2>
          <p style="color: #64748b; margin: 4px 0 0 0; font-size: 0.85rem;">Received via TaizerCodeCrafter website contact form</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 0.9rem; width: 120px; font-weight: bold;">Sender Name:</td>
            <td style="padding: 8px 0; color: #0f172a; font-size: 0.95rem; font-weight: bold;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 0.9rem; font-weight: bold;">Email:</td>
            <td style="padding: 8px 0; color: #b35a00; font-size: 0.95rem;"><a href="mailto:${email}" style="color: #b35a00;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 0.9rem; font-weight: bold;">Subject:</td>
            <td style="padding: 8px 0; color: #0f172a; font-size: 0.95rem;">${subject}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 0.9rem; font-weight: bold;">Attachments:</td>
            <td style="padding: 8px 0; color: #0f172a; font-size: 0.9rem;">${attSummary}</td>
          </tr>
        </table>
        <div style="background: #f8fafc; border-left: 4px solid #b35a00; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 8px 0; color: #334155; font-size: 0.9rem;">Message Content:</h4>
          <p style="margin: 0; color: #0f172a; font-size: 0.95rem; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>
        <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" style="background: #b35a00; color: #ffffff; padding: 10px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 0.9rem; display: inline-block;">Reply Directly to ${name}</a>
        </div>
      </div>
    `;

    await sendEmailAlert({
      subject: `[Contact Form] ${subject} - from ${name}`,
      html: emailHtml,
      replyTo: email
    }, config);

  } catch (err) {
    console.error('sendContactAlert error:', err.message);
  }
}

/**
 * Send New Subscriber Alert
 */
async function sendSubscriptionAlert(subscriberEmail) {
  try {
    const config = await getNotificationConfig();
    const telegramText = `🎉 *New Portfolio Subscriber!*\n━━━━━━━━━━━━━━━━━━\n📧 *Email:* \`${subscriberEmail}\`\n🕒 *Time:* ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' })}`;
    await sendTelegramAlert(telegramText, config.telegramBotToken, config.telegramChatId);
  } catch (e) {}
}

/**
 * Send New Comment Alert
 */
async function sendCommentAlert({ userName, userEmail, commentText, targetTitle }) {
  try {
    const config = await getNotificationConfig();
    const telegramText = `💬 *New Blog/Project Comment!*\n━━━━━━━━━━━━━━━━━━\n👤 *User:* ${userName} (${userEmail})\n📌 *On:* ${targetTitle || 'Blog Article'}\n💬 *Comment:* ${commentText}`;
    await sendTelegramAlert(telegramText, config.telegramBotToken, config.telegramChatId);
  } catch (e) {}
}

module.exports = {
  sendContactAlert,
  sendSubscriptionAlert,
  sendCommentAlert,
  getNotificationConfig
};
