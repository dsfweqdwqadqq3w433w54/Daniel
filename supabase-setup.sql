-- Supabase Database Setup for Portfolio Contact Form
-- Run this SQL in your Supabase SQL Editor

-- Create the contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL DEFAULT 'General Inquiry',
  message TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'new',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on submitted_at for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at 
ON contact_submissions(submitted_at DESC);

-- Create an index on status for filtering
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status 
ON contact_submissions(status);

-- Create an index on email for potential duplicate checking
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email 
ON contact_submissions(email);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anonymous inserts (for contact form submissions)
CREATE POLICY "Allow anonymous inserts" ON contact_submissions
  FOR INSERT 
  WITH CHECK (true);

-- Create a policy to allow authenticated users to read all submissions
-- (You can modify this based on your authentication needs)
CREATE POLICY "Allow authenticated reads" ON contact_submissions
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Create a policy to allow authenticated users to update submissions
CREATE POLICY "Allow authenticated updates" ON contact_submissions
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_contact_submissions_updated_at 
  BEFORE UPDATE ON contact_submissions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a view for easy querying of recent submissions
CREATE OR REPLACE VIEW recent_contact_submissions AS
SELECT 
  id,
  name,
  email,
  subject,
  LEFT(message, 100) || CASE WHEN LENGTH(message) > 100 THEN '...' ELSE '' END as message_preview,
  message,
  status,
  submitted_at,
  read_at
FROM contact_submissions
ORDER BY submitted_at DESC;

-- Optional: Create a function to get submission statistics
CREATE OR REPLACE FUNCTION get_contact_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_submissions', (SELECT COUNT(*) FROM contact_submissions),
    'new_submissions', (SELECT COUNT(*) FROM contact_submissions WHERE status = 'new'),
    'read_submissions', (SELECT COUNT(*) FROM contact_submissions WHERE status = 'read'),
    'today_submissions', (SELECT COUNT(*) FROM contact_submissions WHERE DATE(submitted_at) = CURRENT_DATE),
    'this_week_submissions', (SELECT COUNT(*) FROM contact_submissions WHERE submitted_at >= DATE_TRUNC('week', NOW())),
    'this_month_submissions', (SELECT COUNT(*) FROM contact_submissions WHERE submitted_at >= DATE_TRUNC('month', NOW()))
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON contact_submissions TO anon;
GRANT SELECT, UPDATE ON contact_submissions TO authenticated;

-- Optional: Create a notification function for new submissions
-- This can be used with webhooks or real-time subscriptions
CREATE OR REPLACE FUNCTION notify_new_contact_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- You can customize this notification
  PERFORM pg_notify('new_contact_submission', 
    json_build_object(
      'id', NEW.id,
      'name', NEW.name,
      'email', NEW.email,
      'subject', NEW.subject,
      'submitted_at', NEW.submitted_at
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifications
CREATE TRIGGER notify_new_contact_submission_trigger
  AFTER INSERT ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_contact_submission();

-- Insert a test record (optional - remove in production)
-- INSERT INTO contact_submissions (name, email, subject, message) 
-- VALUES ('Test User', 'test@example.com', 'Test Subject', 'This is a test message to verify the setup.');

COMMENT ON TABLE contact_submissions IS 'Stores contact form submissions from the portfolio website';
COMMENT ON COLUMN contact_submissions.id IS 'Unique identifier for each submission';
COMMENT ON COLUMN contact_submissions.name IS 'Name of the person submitting the form';
COMMENT ON COLUMN contact_submissions.email IS 'Email address of the submitter';
COMMENT ON COLUMN contact_submissions.subject IS 'Subject/category of the inquiry';
COMMENT ON COLUMN contact_submissions.message IS 'The actual message content';
COMMENT ON COLUMN contact_submissions.status IS 'Status of the submission (new, read, replied, etc.)';
COMMENT ON COLUMN contact_submissions.submitted_at IS 'When the form was submitted';
COMMENT ON COLUMN contact_submissions.read_at IS 'When the submission was marked as read';
