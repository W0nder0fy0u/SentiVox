-- =====================================================
-- Senti-Vox Database Setup Script
-- =====================================================
-- This SQL script sets up the database schema for authentication
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Create users table
CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  apikey TEXT UNIQUE NOT NULL,
  join_date TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS Policies

-- Policy 1: Allow all users to view data (adjust as needed)
CREATE POLICY "Users can view own data" ON users
  FOR SELECT 
  USING (true);

-- Policy 2: Allow service role to insert new users
CREATE POLICY "Service role can insert" ON users
  FOR INSERT 
  WITH CHECK (true);

-- RPC Function to check uniqueness
-- returns TRUE if the API key is unique, FALSE if it exists.
CREATE OR REPLACE FUNCTION is_apikey_unique(lookup_key text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 
    FROM users 
    WHERE apikey = lookup_key
  );
END;
$$;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Verify table was created
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Verify RLS is enabled
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- Verify policies were created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users';

-- =====================================================
-- Optional: Sample Data (for testing)
-- =====================================================
-- Uncomment to insert test data
/*
INSERT INTO users (email, name, apikey) 
VALUES (
  'test@gmail.com', 
  'Test User', 
  'test_api_key_' || gen_random_uuid()::text
)
ON CONFLICT (email) DO NOTHING;
*/
