import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

export async function sendAuctionAlert(property, daysUntilAuction) {
  const transporter = createTransporter();

  const urgencyLabel = daysUntilAuction <= 7 ? 'URGENT' : 'UPCOMING';
  const subject = `[${urgencyLabel}] Auction Alert: ${property.address} — ${daysUntilAuction} days`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${daysUntilAuction <= 7 ? '#dc2626' : '#d97706'}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">${urgencyLabel}: Auction in ${daysUntilAuction} Days</h1>
      </div>
      <div style="background: #1e293b; color: #f1f5f9; padding: 20px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #93c5fd;">${property.address}</h2>
        <p>${property.city}, ${property.state} ${property.zip}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #334155; color: #94a3b8;">ARV</td>
            <td style="padding: 8px; border-bottom: 1px solid #334155;">$${(property.arv || 0).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #334155; color: #94a3b8;">Distress Score</td>
            <td style="padding: 8px; border-bottom: 1px solid #334155;">${property.distressScore}/100</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #334155; color: #94a3b8;">Auction Date</td>
            <td style="padding: 8px; border-bottom: 1px solid #334155; color: #fbbf24;">${new Date(property.auctionDate).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #334155; color: #94a3b8;">Equity Score</td>
            <td style="padding: 8px; border-bottom: 1px solid #334155;">${property.equityScore ?? 'N/A'}/100</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #94a3b8;">Final Verdict</td>
            <td style="padding: 8px;">${property.finalVerdict ?? property.verdict ?? 'N/A'}</td>
          </tr>
        </table>
        <div style="margin-top: 24px; text-align: center;">
          <a href="${process.env.APP_URL || 'http://localhost:5173'}/analyze" style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">View Analysis</a>
        </div>
        <p style="margin-top: 20px; color: #94a3b8; font-size: 12px;">Track DealOS Property Analyzer — For informational purposes only. Not financial or legal advice.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@trackdealos.com',
    to: process.env.SMTP_USER,
    subject,
    html
  });
}

export async function sendTestEmail(to) {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@trackdealos.com',
    to,
    subject: 'Track DealOS — Test Email',
    html: `
      <div style="font-family: Arial, sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px;">
        <h1 style="color: #3b82f6;">Track DealOS</h1>
        <p>Email configuration is working correctly.</p>
        <p style="color: #94a3b8; font-size: 12px;">Sent at ${new Date().toISOString()}</p>
      </div>
    `
  });
}
