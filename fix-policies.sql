-- Fix Supabase policies for contact form
-- Run this in your Supabase SQL Editor if the form isn't working

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous inserts" ON contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated reads" ON contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated updates" ON contact_submissions;

-- Create a simple policy that allows anyone to insert
CREATE POLICY "Enable insert for anonymous users" ON contact_submissions
  FOR INSERT 
  TO anon
  WITH CHECK (true);

-- Create a policy for authenticated users to read
CREATE POLICY "Enable read for authenticated users" ON contact_submissions
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create a policy for authenticated users to update
CREATE POLICY "Enable update for authenticated users" ON contact_submissions
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Make sure permissions are correct
GRANT INSERT ON contact_submissions TO anon;
GRANT SELECT, UPDATE ON contact_submissions TO authenticated;

-- Test the setup with a simple insert
INSERT INTO contact_submissions (name, email, subject, message) 
VALUES ('Test User', 'test@example.com', 'Test Subject', 'This is a test message to verify the setup works.');
