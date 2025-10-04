-- Test insert for user_profiles table
-- Run this in Supabase SQL Editor to manually add a test row

-- First, let's see what users exist in auth.users
SELECT id, email, raw_user_meta_data FROM auth.users;

-- Insert a test profile (replace the user_id with an actual user ID from above)
-- You'll need to replace 'your-user-id-here' with an actual UUID from the auth.users table
INSERT INTO user_profiles (
    user_id,
    email,
    full_name,
    onboarding_completed,
    age_group,
    health_conditions,
    air_sensitivity,
    activity_level,
    outdoor_activities,
    primary_location,
    notification_preferences,
    concerns
) VALUES (
    'your-user-id-here', -- Replace with actual user ID
    'test@example.com',
    'Test User',
    true,
    '30_44',
    ARRAY['asthma', 'allergies'],
    'moderately_sensitive',
    'moderately_active',
    ARRAY['running', 'cycling'],
    'suburban',
    ARRAY['poor_quality', 'daily_forecast'],
    ARRAY['health_impact', 'exercise_planning']
);

-- Check if the insert worked
SELECT * FROM user_profiles;
