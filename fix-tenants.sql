-- Fix tenants table structure
-- Run this in Supabase SQL Editor

-- Drop the old table completely (CASCADE removes dependencies)
DROP TABLE IF EXISTS tenants CASCADE;

-- Recreate with correct structure
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE NOT NULL,
    brand_color TEXT DEFAULT '#10b981',
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    feature_flags JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Now insert seed data
INSERT INTO tenants (name, subdomain, brand_color, commission_rate, feature_flags)
VALUES ('TrustBnB Demo Agency', 'demo-agency', '#10b981', 10.00, '{}'::jsonb);

SELECT 'Tenants table fixed and seeded!' as message;
