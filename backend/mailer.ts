import nodemailer, { Transporter } from 'nodemailer';

interface SendRecoveryEmailOptions {
  to: string;
  code: string;
  recipientName?: string;
}

let transporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  if (transporter) return transporter;

  // 1. Check for custom SMTP environment variables
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporter;
  }

  // 2. Check for Gmail credentials
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    return transporter;
  }

  // 3. Fallback: Ethereal test account or console transport for secure delivery
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return transporter;
  } catch (err) {
    // If external network is blocked, create a JSON stream transport that logs
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
    return transporter;
  }
}

export async function sendPasswordRecoveryEmail(options: SendRecoveryEmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  previewUrl?: string | false;
  error?: string;
}> {
  const { to, code, recipientName = 'Finova Member' } = options;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Finova Password Reset Code</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAF7F2; margin: 0; padding: 40px 20px; color: #181512;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E8E1D5; overflow: hidden; box-shadow: 0 4px 12px rgba(24, 21, 18, 0.05);">
    <!-- Header -->
    <tr>
      <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #F0EAE0;">
        <div style="display: inline-block; width: 44px; height: 44px; background: linear-gradient(135deg, #AF6E4D, #864828); border-radius: 12px; line-height: 44px; text-align: center; color: #FFFFFF; font-weight: bold; font-size: 20px;">
          F
        </div>
        <h1 style="margin: 12px 0 0; font-size: 22px; font-weight: 800; color: #181512; letter-spacing: -0.02em;">
          Finova
        </h1>
        <p style="margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #7A6B58; font-weight: 600;">
          Security Verification
        </p>
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding: 32px;">
        <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #5C554D;">
          Hello <strong>${recipientName}</strong>,
        </p>
        <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #5C554D;">
          We received a request to reset your password for your Finova financial ledger account. Use the 6-digit verification code below to complete the reset:
        </p>

        <!-- Code Box -->
        <div style="background-color: #FAF7F2; border: 1px solid #E8E1D5; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
          <span style="font-family: 'JetBrains Mono', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 0.25em; color: #AF6E4D; display: block;">
            ${code}
          </span>
          <span style="display: block; font-size: 11px; color: #8C8478; margin-top: 8px;">
            Valid for the next 15 minutes
          </span>
        </div>

        <p style="margin: 0 0 12px; font-size: 12px; line-height: 1.5; color: #8C8478;">
          If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="padding: 20px 32px; background-color: #FBF9F5; border-top: 1px solid #F0EAE0; text-align: center;">
        <p style="margin: 0; font-size: 11px; color: #9E9589;">
          Finova · Intelligent Wealth & Personal Ledger Platform
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    const activeTransporter = await getTransporter();

    const info = await activeTransporter.sendMail({
      from: '"Finova Security" <security@finova.dev>',
      to,
      subject: `${code} is your Finova password reset code`,
      text: `Your Finova password reset code is: ${code}. It expires in 15 minutes.`,
      html: htmlContent,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log(`[Finova Mailer] Verification email dispatched to: ${to} (Code: ${code})`);
    if (previewUrl) {
      console.log(`[Finova Mailer] Preview URL: ${previewUrl}`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
    };
  } catch (err: any) {
    console.error('[Finova Mailer] Failed to send email:', err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}
