// Example webhook endpoint for email notifications
// This can be deployed to Vercel, Netlify Functions, or any serverless platform

// For Vercel API Routes (pages/api/contact-webhook.js or app/api/contact-webhook/route.js)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { record } = req.body;
    
    // Validate the webhook payload
    if (!record || !record.name || !record.email) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    // Send email notification (example using Nodemailer)
    await sendEmailNotification(record);
    
    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Email notification function
async function sendEmailNotification(submission) {
  // Option 1: Using Nodemailer with Gmail
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD // Use App Password for Gmail
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'kyemdaniel23@gmail.com', // Your email
    subject: `New Contact Form Submission: ${submission.subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${submission.name}</p>
      <p><strong>Email:</strong> ${submission.email}</p>
      <p><strong>Subject:</strong> ${submission.subject}</p>
      <p><strong>Message:</strong></p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
        ${submission.message.replace(/\n/g, '<br>')}
      </div>
      <p><strong>Submitted:</strong> ${new Date(submission.submitted_at).toLocaleString()}</p>
      <hr>
      <p><small>This email was sent automatically from your portfolio contact form.</small></p>
    `
  };

  await transporter.sendMail(mailOptions);
}

// Alternative: Using SendGrid
async function sendEmailWithSendGrid(submission) {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: 'kyemdaniel23@gmail.com',
    from: 'noreply@yourdomain.com', // Must be verified in SendGrid
    subject: `New Contact Form Submission: ${submission.subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${submission.name}</p>
      <p><strong>Email:</strong> ${submission.email}</p>
      <p><strong>Subject:</strong> ${submission.subject}</p>
      <p><strong>Message:</strong></p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
        ${submission.message.replace(/\n/g, '<br>')}
      </div>
      <p><strong>Submitted:</strong> ${new Date(submission.submitted_at).toLocaleString()}</p>
    `
  };

  await sgMail.send(msg);
}

// Alternative: Using Resend (modern email API)
async function sendEmailWithResend(submission) {
  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to: 'kyemdaniel23@gmail.com',
    subject: `New Contact Form Submission: ${submission.subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${submission.name}</p>
      <p><strong>Email:</strong> ${submission.email}</p>
      <p><strong>Subject:</strong> ${submission.subject}</p>
      <p><strong>Message:</strong></p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
        ${submission.message.replace(/\n/g, '<br>')}
      </div>
      <p><strong>Submitted:</strong> ${new Date(submission.submitted_at).toLocaleString()}</p>
    `
  });
}

// Environment variables needed:
// EMAIL_USER=your-gmail@gmail.com
// EMAIL_APP_PASSWORD=your-app-password
// SENDGRID_API_KEY=your-sendgrid-key
// RESEND_API_KEY=your-resend-key

// To set up the webhook in Supabase:
// 1. Go to Database → Webhooks
// 2. Create new webhook:
//    - Name: contact-form-notification
//    - Table: contact_submissions
//    - Events: INSERT
//    - URL: https://your-domain.com/api/contact-webhook
//    - HTTP Headers: (optional, for security)

// For testing locally with ngrok:
// 1. Install ngrok: npm install -g ngrok
// 2. Run your local server: npm run dev
// 3. In another terminal: ngrok http 3000
// 4. Use the ngrok URL in your Supabase webhook
