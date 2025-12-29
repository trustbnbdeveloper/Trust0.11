-- Seed data for TrustBnB
-- Run this in Supabase SQL Editor

-- Insert a demo tenant
INSERT INTO tenants (name, subdomain, brand_color, commission_rate, feature_flags)
VALUES ('TrustBnB Demo Agency', 'demo-agency', '#10b981', 10.00, '{}'::jsonb)
ON CONFLICT (subdomain) DO NOTHING;

-- Note: To create users with profiles, you should:
-- 1. Go to Supabase Dashboard > Authentication
-- 2. Click "Add User"
-- 3. Create users manually
-- 4. Then their profiles will be auto-created by triggers or you can insert them here

SELECT 'Seed data inserted successfully!' as message;
