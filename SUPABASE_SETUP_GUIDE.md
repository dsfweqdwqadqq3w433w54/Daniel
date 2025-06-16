# Supabase Integration Setup Guide

This guide will help you set up Supabase as the backend for your portfolio website's contact form.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `portfolio-contact-form` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be created (usually takes 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-ref.supabase.co`)
   - **Project API Keys** → **anon public** (the public key)

## Step 3: Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Important**: Never commit your `.env.local` file to version control!

## Step 4: Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire content from `supabase-setup.sql` file
4. Paste it into the SQL editor
5. Click "Run" to execute the script

This will create:
- `contact_submissions` table with all necessary fields
- Proper indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamps
- Helper functions and views

## Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the contact section of your website
3. Fill out and submit the contact form
4. Check your Supabase dashboard:
   - Go to **Table Editor** → **contact_submissions**
   - You should see your test submission

## Step 6: Set Up Email Notifications (Optional)

### Option A: Supabase Edge Functions (Recommended)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Create an Edge Function for email notifications:
   ```bash
   supabase functions new contact-notification
   ```

3. Configure the function to send emails when new submissions arrive

### Option B: Webhooks

1. In Supabase dashboard, go to **Database** → **Webhooks**
2. Create a new webhook:
   - **Name**: `contact-form-notification`
   - **Table**: `contact_submissions`
   - **Events**: `INSERT`
   - **URL**: Your webhook endpoint (e.g., Zapier, Make.com, or custom endpoint)

### Option C: Real-time Subscriptions

Use Supabase real-time features to get instant notifications in your admin panel.

## Step 7: Security Considerations

### Row Level Security (RLS)
The setup script enables RLS with these policies:
- **Anonymous users**: Can only INSERT (submit forms)
- **Authenticated users**: Can SELECT and UPDATE (for admin access)

### Rate Limiting
Consider implementing rate limiting to prevent spam:

1. In Supabase dashboard, go to **Authentication** → **Rate Limits**
2. Set appropriate limits for your use case

### Data Validation
The current setup includes basic validation. Consider adding:
- Email format validation
- Message length limits
- Spam detection

## Step 8: Monitoring and Analytics

### View Submissions
Access your submissions through:
1. **Supabase Dashboard**: Table Editor → contact_submissions
2. **Custom Admin Panel**: Build a React component using the helper functions
3. **SQL Queries**: Use the provided views and functions

### Get Statistics
Use the `get_contact_stats()` function:
```sql
SELECT get_contact_stats();
```

## Troubleshooting

### Common Issues

1. **"Failed to send message" error**:
   - Check your environment variables
   - Verify Supabase project is active
   - Check browser console for detailed errors

2. **RLS Policy errors**:
   - Ensure the policies are correctly set up
   - Check if you need authentication for certain operations

3. **CORS errors**:
   - Supabase should handle CORS automatically
   - If issues persist, check your project settings

### Debug Mode
Add this to your contact form for debugging:
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

## Production Deployment

### Environment Variables
When deploying to production (Vercel, Netlify, etc.):
1. Add the same environment variables to your hosting platform
2. Use the same Supabase project or create a separate production project

### Database Backup
Regularly backup your contact submissions:
1. Go to **Settings** → **Database**
2. Use the backup features or export data regularly

## Next Steps

1. **Custom Admin Panel**: Build a React component to manage submissions
2. **Email Integration**: Set up automated email responses
3. **Analytics**: Track form conversion rates
4. **Spam Protection**: Implement additional spam prevention measures

## Support

If you encounter issues:
1. Check the Supabase documentation: [docs.supabase.com](https://docs.supabase.com)
2. Review the browser console for error messages
3. Check the Supabase dashboard logs
4. Verify your environment variables are correct

Your contact form is now fully integrated with Supabase! 🎉
