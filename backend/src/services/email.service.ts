// Email Service
// Configure with SendGrid, Resend, or SMTP
// Set EMAIL_SERVICE_API_KEY in environment variables

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'console'; // 'sendgrid', 'resend', or 'console'
const EMAIL_API_KEY = process.env.EMAIL_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@studentos.app';

/**
 * Send an email using configured provider
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  const { to, subject, html, text } = options;

  try {
    switch (EMAIL_PROVIDER) {
      case 'sendgrid':
        return await sendWithSendGrid(to, subject, html, text);
      case 'resend':
        return await sendWithResend(to, subject, html, text);
      default:
        // Console logging for development
        console.log('📧 Email would be sent:');
        console.log(`  To: ${to}`);
        console.log(`  Subject: ${subject}`);
        console.log(`  Body: ${text || html.substring(0, 100)}...`);
        return true;
    }
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

/**
 * Send email via SendGrid
 */
async function sendWithSendGrid(to: string, subject: string, html: string, text?: string): Promise<boolean> {
  if (!EMAIL_API_KEY) {
    console.error('SendGrid API key not configured');
    return false;
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${EMAIL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: EMAIL_FROM },
      subject,
      content: [
        { type: 'text/plain', value: text || html.replace(/<[^>]*>/g, '') },
        { type: 'text/html', value: html },
      ],
    }),
  });

  return response.ok;
}

/**
 * Send email via Resend
 */
async function sendWithResend(to: string, subject: string, html: string, text?: string): Promise<boolean> {
  if (!EMAIL_API_KEY) {
    console.error('Resend API key not configured');
    return false;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${EMAIL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text,
    }),
  });

  return response.ok;
}

// Pre-built email templates
export const emailTemplates = {
  passwordReset: (resetLink: string) => ({
    subject: 'Reset Your StudentOS Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2D4DE0;">Reset Your Password</h1>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        <a href="${resetLink}" style="display: inline-block; background: #2D4DE0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
        <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #666; font-size: 14px;">This link expires in 1 hour.</p>
      </div>
    `,
    text: `Reset your password by visiting: ${resetLink}`,
  }),

  welcomeEmail: (name: string) => ({
    subject: 'Welcome to StudentOS! 🎓',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2D4DE0;">Welcome to StudentOS, ${name}! 🎉</h1>
        <p>We're excited to have you on board. Here's what you can do:</p>
        <ul>
          <li>🎯 <strong>Find Scholarships</strong> - Browse opportunities tailored for you</li>
          <li>💼 <strong>Discover Jobs</strong> - Find student-friendly positions</li>
          <li>📝 <strong>Optimize Your CV</strong> - Get AI-powered feedback</li>
          <li>📊 <strong>Track Your Habits</strong> - Build productive routines</li>
        </ul>
        <a href="https://studentos-bobur-production.up.railway.app/dashboard" style="display: inline-block; background: #2D4DE0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Get Started</a>
      </div>
    `,
    text: `Welcome to StudentOS, ${name}! Start exploring your dashboard.`,
  }),

  jobAlert: (jobTitle: string, companyName: string, jobUrl: string) => ({
    subject: `New Job Match: ${jobTitle} at ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2D4DE0;">New Job Match! 💼</h1>
        <p>We found a job that matches your profile:</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h2 style="margin: 0 0 8px 0;">${jobTitle}</h2>
          <p style="margin: 0; color: #666;">${companyName}</p>
        </div>
        <a href="${jobUrl}" style="display: inline-block; background: #2D4DE0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Job</a>
      </div>
    `,
    text: `New job match: ${jobTitle} at ${companyName}. View at: ${jobUrl}`,
  }),
};
