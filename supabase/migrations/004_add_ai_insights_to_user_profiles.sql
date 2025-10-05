-- Add AI insight columns to existing user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS ai_insight_data JSONB,
ADD COLUMN IF NOT EXISTS ai_insight_updated_at TIMESTAMPTZ;

-- Add index for faster lookups on the timestamp
CREATE INDEX IF NOT EXISTS idx_user_profiles_ai_insight_updated_at 
ON user_profiles(ai_insight_updated_at);

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.ai_insight_data IS 'JSON object containing the last AI-generated air quality insight';
COMMENT ON COLUMN user_profiles.ai_insight_updated_at IS 'Timestamp when the AI insight was last generated (used for daily cache check)';
