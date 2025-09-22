-- Create mobile OTP verification table
CREATE TABLE IF NOT EXISTS mobile_otp_verification (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mobile_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mobile_otp_user_id ON mobile_otp_verification(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_otp_mobile_number ON mobile_otp_verification(mobile_number);
CREATE INDEX IF NOT EXISTS idx_mobile_otp_expires_at ON mobile_otp_verification(expires_at);
CREATE INDEX IF NOT EXISTS idx_mobile_otp_verified ON mobile_otp_verification(verified);

-- Enable RLS (Row Level Security)
ALTER TABLE mobile_otp_verification ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own OTP records" ON mobile_otp_verification
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own OTP records" ON mobile_otp_verification
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own OTP records" ON mobile_otp_verification
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM mobile_otp_verification 
  WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired OTPs (optional)
-- This would need to be set up in your Supabase dashboard or via pg_cron
-- SELECT cron.schedule('cleanup-expired-otps', '0 * * * *', 'SELECT cleanup_expired_otps();');

-- Add mobile verification fields to profiles table if they don't exist
-- Note: The profiles table already has a 'phone' column, so we don't need to add mobile_number
-- We'll use the existing 'phone' column for mobile verification
