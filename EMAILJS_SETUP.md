# EmailJS Setup Guide for Admin Reply Functionality

This guide will help you set up EmailJS to enable actual email sending from your admin dashboard.

## 🚀 Quick Setup Steps

### 1. Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Add Email Service
1. In your EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, Yahoo, etc.)
4. Follow the setup instructions for your provider
5. **Copy the Service ID** - you'll need this later

### 3. Create Email Template
1. Go to **Email Templates** in your dashboard
2. Click **Create New Template**
3. Use this template structure:

```html
Subject: {{subject}}

Hi {{to_name}},

{{message}}

Best regards,
{{from_name}}
{{from_email}}
```

4. **Template Variables to include:**
   - `{{to_name}}` - Recipient's name
   - `{{to_email}}` - Recipient's email
   - `{{from_name}}` - Your name/admin name
   - `{{from_email}}` - Your email address
   - `{{subject}}` - Email subject
   - `{{message}}` - Your reply message
   - `{{reply_to}}` - Reply-to email address

5. **Copy the Template ID** - you'll need this later

### 4. Get Public Key
1. Go to **Account** → **General**
2. Find your **Public Key**
3. **Copy the Public Key** - you'll need this later

### 5. Update Environment Variables
1. Copy `.env.example` to `.env`
2. Add your EmailJS credentials:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

### 6. Test the Setup
1. Restart your development server: `npm run dev`
2. Go to your admin dashboard: `http://localhost:5173/#admin`
3. Try replying to a message
4. Check your email inbox to see if the email was sent

## 📧 How It Works

1. **User submits contact form** → Stored in Supabase
2. **Admin clicks Reply** → Opens reply modal
3. **Admin writes reply** → Clicks Send Reply
4. **EmailJS sends email** → Directly to user's inbox
5. **Fallback option** → Opens email client if EmailJS fails

## 🔧 Troubleshooting

### EmailJS Not Configured
- If you see "EmailJS configuration needed", check your `.env` file
- Make sure all three variables are set correctly
- Restart your development server after updating `.env`

### Email Not Sending
- Check the browser console for error messages
- Verify your EmailJS service is active
- Make sure your email template variables match
- Check EmailJS dashboard for usage limits

### Gmail Setup Issues
- Enable 2-factor authentication
- Use App Password instead of regular password
- Allow less secure apps (if needed)

## 💡 Tips

- **Free Plan**: EmailJS free plan allows 200 emails/month
- **Testing**: Use your own email for testing
- **Templates**: You can create multiple templates for different purposes
- **Fallback**: If EmailJS fails, the system will open your email client as backup

## 🎯 Template Example

Here's a complete email template you can use:

```html
Subject: Re: {{subject}}

Hello {{to_name}},

Thank you for contacting us. Here's my response to your message:

{{message}}

If you have any further questions, please don't hesitate to reach out.

Best regards,
{{from_name}}
{{from_email}}

---
This is a reply to your message submitted on our website.
Original message: "{{original_message}}"
```

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Keep your EmailJS credentials secure
- Monitor your EmailJS usage to avoid quota limits
- Consider upgrading to paid plan for higher limits if needed
