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


-- Table for storing OTPs with automatic expiration
CREATE TABLE IF NOT EXISTS otp_store (
  email TEXT PRIMARY KEY,
  otp TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Index for efficient cleanup of expired OTPs
CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON otp_store(expires_at);

-- Table for rate limiting OTP requests
CREATE TABLE IF NOT EXISTS otp_rate_limit (
  email TEXT PRIMARY KEY,
  attempt_count INTEGER DEFAULT 1,
  first_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  last_attempt_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient cleanup of old rate limit records
CREATE INDEX IF NOT EXISTS idx_rate_limit_last_attempt ON otp_rate_limit(last_attempt_at);

-- Function to automatically delete expired OTPs
CREATE OR REPLACE FUNCTION delete_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_store WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old rate limit records (older than 1 hour)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_rate_limit WHERE last_attempt_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;
