const { Resend } = require('resend');

const apiKey = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || 'SoleVault <onboarding@resend.dev>';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const resend = apiKey ? new Resend(apiKey) : null;

const isEmailEnabled = () => Boolean(resend);

const logDevLink = (to, subject, devLink) => {
  if (!devLink) return;
  const banner = '─'.repeat(72);
  console.log(`\n${banner}\n[email:link] ${subject}\n  to: ${to}\n  link: ${devLink}\n${banner}\n`);
};

const send = async ({ to, subject, html, devLink }) => {
  if (!resend) {
    console.log(`[email:dev] Would send to ${to}: ${subject}`);
    logDevLink(to, subject, devLink);
    return { mocked: true };
  }
  try {
    const result = await resend.emails.send({ from: FROM, to, subject, html });
    if (result.error) {
      console.error('[email] send failed:', result.error);
      logDevLink(to, subject, devLink);
      return { error: result.error };
    }
    console.log(`[email] sent to ${to}: ${subject} (id=${result.data?.id})`);
    return result;
  } catch (err) {
    console.error('[email] exception:', err.message);
    logDevLink(to, subject, devLink);
    return { error: err };
  }
};

const baseLayout = (title, body, ctaText, ctaUrl) => `
<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f4f4f5;margin:0;padding:24px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
    <tr><td style="background:#000;padding:24px 32px;color:#fff;">
      <div style="font-weight:900;letter-spacing:0.2em;font-size:18px;">SOLE<span style="color:#3b82f6">VAULT</span></div>
    </td></tr>
    <tr><td style="padding:32px;">
      <h1 style="margin:0 0 16px;font-size:24px;color:#111;font-weight:800;letter-spacing:-0.02em;">${title}</h1>
      <div style="color:#3f3f46;font-size:15px;line-height:1.6;">${body}</div>
      ${ctaText && ctaUrl ? `
        <table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
          <tr><td style="background:#000;border-radius:12px;">
            <a href="${ctaUrl}" style="display:inline-block;padding:14px 28px;color:#fff;text-decoration:none;font-weight:700;letter-spacing:0.05em;font-size:13px;text-transform:uppercase;">${ctaText}</a>
          </td></tr>
        </table>` : ''}
    </td></tr>
    <tr><td style="padding:16px 32px;background:#fafafa;border-top:1px solid #e4e4e7;color:#71717a;font-size:12px;">
      SoleVault &middot; This email was sent automatically. Do not reply.
    </td></tr>
  </table>
</body></html>`;

const sendVerificationEmail = (to, name, token) => {
  const url = `${CLIENT_URL}/verify-email/${token}`;
  return send({
    to,
    subject: 'Verify your SoleVault email',
    html: baseLayout(
      `Welcome, ${name}`,
      `<p>Confirm your email to activate your SoleVault account and start collecting drops.</p>
       <p style="color:#71717a;font-size:13px;">This link expires in 24 hours.</p>`,
      'Verify Email',
      url
    ),
    devLink: url,
  });
};

const sendPasswordResetEmail = (to, name, token) => {
  const url = `${CLIENT_URL}/reset-password/${token}`;
  return send({
    to,
    subject: 'Reset your SoleVault password',
    html: baseLayout(
      `Password reset`,
      `<p>Hi ${name}, we received a request to reset your password.</p>
       <p style="color:#71717a;font-size:13px;">This link expires in 1 hour. If you didn't request a reset, ignore this email.</p>`,
      'Reset Password',
      url
    ),
    devLink: url,
  });
};

const sendOrderConfirmationEmail = (to, name, order) => {
  const itemsHtml = order.orderItems.map((i) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f4f4f5;">
        <div style="font-weight:600;">${i.name}</div>
        <div style="color:#71717a;font-size:13px;">EU ${i.size || '—'} &middot; ${i.qty} ×</div>
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #f4f4f5;text-align:right;font-weight:700;">$${(i.price * i.qty).toFixed(2)}</td>
    </tr>`).join('');
  return send({
    to,
    subject: `Order #${String(order._id).slice(-8).toUpperCase()} confirmed`,
    html: baseLayout(
      'Payment confirmed',
      `<p>Thanks ${name}! Your order is locked in.</p>
       <table style="width:100%;border-collapse:collapse;margin-top:16px;">
         ${itemsHtml}
         <tr><td style="padding:12px 0;font-weight:800;">Total</td><td style="padding:12px 0;text-align:right;font-weight:800;font-size:18px;">$${order.totalPrice.toFixed(2)}</td></tr>
       </table>`,
      'View Order',
      `${CLIENT_URL}/profile?tab=orders`
    ),
  });
};

const sendOrderShippedEmail = (to, name, order) => {
  return send({
    to,
    subject: `Order #${String(order._id).slice(-8).toUpperCase()} shipped`,
    html: baseLayout(
      'Your order is on the way',
      `<p>Great news ${name}, your order has shipped.</p>
       <p><strong>Carrier:</strong> ${order.carrier || '—'}<br/>
          <strong>Tracking #:</strong> ${order.trackingNumber || '—'}</p>`,
      'Track Order',
      `${CLIENT_URL}/profile?tab=orders`
    ),
  });
};

module.exports = {
  isEmailEnabled,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
};
