-- TRUST BNB PRODUCTION SCHEMA (SUPABASE / POSTGRES)
-- Purpose: Multi-tenant isolation, RBAC, and core booking logic.

-- 1. ENUMS & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('SUPERADMIN', 'ADMIN', 'OWNER', 'HOST', 'GUEST');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- The original booking_status enum is replaced by TEXT status fields in the new tables.
-- DO $$ BEGIN
--     CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED');
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;

-- 2. TENANTS (THE CORE)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE NOT NULL,
    brand_color TEXT DEFAULT '#10b981',
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    feature_flags JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROFILES (EXTENDING AUTH.USERS)
-- Updated profiles table to match RLS helper functions
CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE, -- Renamed from 'id' to 'user_id'
    tenant_id UUID REFERENCES tenants(id), -- Kept for backward compatibility or specific use cases
    full_name TEXT,
    type TEXT DEFAULT 'user' CHECK (type IN ('user', 'platform_admin')), -- Added 'type' column
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TENANT_USERS: Relationship between users and tenants (agencies).
-- Allows a user to be staff in one tenant and an admin in another.
CREATE TABLE IF NOT EXISTS tenant_users (
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('tenant_admin', 'staff', 'owner')),
    staff_type TEXT CHECK (staff_type IN ('cleaner', 'property_manager', 'maintenance', 'support')),
    PRIMARY KEY (tenant_id, user_id)
);

-- PROPERTY_OWNERS: Relationship between properties and their owners.
CREATE TABLE IF NOT EXISTS property_owners (
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ownership_percent NUMERIC(5,2) DEFAULT 100.00 CHECK (ownership_percent > 0 AND ownership_percent <= 100),
    PRIMARY KEY (property_id, user_id)
);

-- 4. PROPERTIES
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES profiles(user_id), -- Changed from profiles(id) to profiles(user_id)
    name TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    price_per_night DECIMAL(12,2) NOT NULL,
    images TEXT[],
    status TEXT DEFAULT 'Active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BOOKINGS & GUEST ACCESS

-- BOOKINGS: Linked to both property and the specific tenant (reseller/manager).
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) NOT NULL,
    tenant_id UUID REFERENCES tenants(id) NOT NULL,
    guest_email TEXT NOT NULL,
    guest_name TEXT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    booking_code TEXT UNIQUE NOT NULL, -- The guest login key
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT check_dates CHECK (check_out > check_in)
);

-- SECURE OPERATIONAL VIEW: Restricted access to booking dates without guest info.
CREATE OR REPLACE VIEW booking_dates_only AS
SELECT id, property_id, tenant_id, check_in, check_out 
FROM bookings;

-- 5. PAYMENTS & COMMISSIONS

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    gross_amount NUMERIC(12,2) NOT NULL,
    commission_amount NUMERIC(12,2) NOT NULL,
    net_amount NUMERIC(12,2) NOT NULL, -- gross - commission
    status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'refunded', 'disputed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MAINTENANCE TICKETS

CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id),
    assigned_to UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'emergency')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AUDIT LOGS (Original table, kept as it was not part of the replacement)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    actor_id UUID REFERENCES profiles(user_id), -- Changed from profiles(id) to profiles(user_id)
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INDEXES for Performance

CREATE INDEX IF NOT EXISTS idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
-- Assuming tenant_properties is a typo and should be properties or tenant_users related
-- CREATE INDEX IF NOT EXISTS idx_tenant_properties_property ON tenant_properties(property_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user ON tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_assigned ON maintenance_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_maintenance_property ON maintenance_tickets(property_id);

-- 9. AUTOMATIC UPDATED_AT TRIGGERS

-- Replaced original set_updated_at function and triggers with new ones
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_tenants BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_properties BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_bookings BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_payments BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_maintenance BEFORE UPDATE ON maintenance_tickets FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
-- No trigger for audit_logs as it doesn't have updated_at

-- 10. ROW LEVEL SECURITY (RLS)

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY; -- Kept original audit_logs RLS
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;

-- 11. SECURITY HELPER FUNCTIONS

-- Returns true if user is platform_admin
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND type = 'platform_admin'
  );
$$;

-- Returns list of tenant_ids the current user belongs to
CREATE OR REPLACE FUNCTION user_tenants()
RETURNS TABLE (tenant_id UUID) LANGUAGE sql STABLE AS $$
  SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid();
$$;

-- Returns list of property_ids accessible via tenant relationships
CREATE OR REPLACE FUNCTION user_properties_via_tenant()
RETURNS TABLE (property_id UUID) LANGUAGE sql STABLE AS $$
  SELECT p.id
  FROM properties p
  JOIN tenant_users tu ON tu.tenant_id = p.tenant_id
  WHERE tu.user_id = auth.uid();
$$;

-- Returns list of property_ids owned by the user
CREATE OR REPLACE FUNCTION user_properties_owned()
RETURNS TABLE (property_id UUID) LANGUAGE sql STABLE AS $$
  SELECT property_id FROM property_owners WHERE user_id = auth.uid();
$$;

-- 12. POLICIES (DENY BY DEFAULT)

-- [TENANTS]
CREATE POLICY "platform_admin_all_tenants" ON tenants FOR ALL USING (is_platform_admin());
CREATE POLICY "users_view_own_tenants" ON tenants FOR SELECT USING (id IN (SELECT tenant_id FROM user_tenants()));

-- [PROFILES]
CREATE POLICY "platform_admin_all_profiles" ON profiles FOR ALL USING (is_platform_admin());
CREATE POLICY "users_view_all_profiles" ON profiles FOR SELECT USING (true); -- Public lookup for mentions/assignments
CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE USING (user_id = auth.uid());

-- [TENANT_USERS]
CREATE POLICY "platform_admin_all_tenant_links" ON tenant_users FOR ALL USING (is_platform_admin());
CREATE POLICY "users_view_related_tenant_links" ON tenant_users FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM user_tenants()));

-- [PROPERTIES]
CREATE POLICY "platform_admin_all_properties" ON properties FOR ALL USING (is_platform_admin());
CREATE POLICY "authorized_users_view_properties" ON properties FOR SELECT USING (
  id IN (SELECT property_id FROM user_properties_via_tenant()) OR
  id IN (SELECT property_id FROM user_properties_owned())
);
CREATE POLICY "tenant_admins_manage_properties" ON properties FOR ALL USING (
  EXISTS (
    SELECT 1 FROM tenant_users tu
    WHERE tu.tenant_id = properties.tenant_id
    AND tu.user_id = auth.uid() 
    AND tu.role = 'tenant_admin'
  )
);

-- [PROPERTY_OWNERS]
CREATE POLICY "platform_admin_all_owners" ON property_owners FOR ALL USING (is_platform_admin());
CREATE POLICY "users_view_property_owners" ON property_owners FOR SELECT USING (
  property_id IN (SELECT property_id FROM user_properties_via_tenant()) OR
  property_id IN (SELECT property_id FROM user_properties_owned())
);

-- [BOOKINGS]
CREATE POLICY "platform_admin_all_bookings" ON bookings FOR ALL USING (is_platform_admin());
CREATE POLICY "authorized_users_view_bookings" ON bookings FOR SELECT USING (
  (tenant_id IN (SELECT tenant_id FROM user_tenants()) AND EXISTS (SELECT 1 FROM tenant_users tu WHERE tu.user_id = auth.uid() AND tu.tenant_id = bookings.tenant_id AND tu.staff_type != 'maintenance')) OR
  property_id IN (SELECT property_id FROM user_properties_owned())
);
-- Note: Guest access is handled via Worker (Service Role) validating booking_code

-- [BOOKING_DATES_ONLY] (VIEW)
-- Maintenance staff use this to see dates without guest info.
ALTER VIEW booking_dates_only OWNER TO postgres; -- Views don't have RLS, access is controlled via policies on underlying table or by controlling who can query the view.
-- In Supabase, we can grant SELECT on the view to specific roles.

-- [MAINTENANCE_TICKETS]
CREATE POLICY "platform_admin_all_tickets" ON maintenance_tickets FOR ALL USING (is_platform_admin());
CREATE POLICY "ticket_access_authorized" ON maintenance_tickets FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM user_tenants()) OR
  assigned_to = auth.uid() OR
  property_id IN (SELECT property_id FROM user_properties_owned())
);
CREATE POLICY "ticket_modification_authorized" ON maintenance_tickets FOR ALL USING (
  tenant_id IN (SELECT tenant_id FROM user_tenants()) OR
  assigned_to = auth.uid()
);

-- [PAYMENTS]
CREATE POLICY "platform_admin_all_payments" ON payments FOR ALL USING (is_platform_admin());
CREATE POLICY "owners_view_payments" ON payments FOR SELECT USING (
  booking_id IN (
    SELECT b.id FROM bookings b
    JOIN property_owners po ON po.property_id = b.property_id
    WHERE po.user_id = auth.uid()
  )
);
-- Staff/Tenant Admin access to payments is blocked by policy (no tenant_id link in payments)

-- [AUDIT_LOGS] (Original policies, adapted to new profile.user_id)
CREATE POLICY audit_logs_tenant_read ON audit_logs FOR SELECT
    USING (tenant_id IN (SELECT tenant_id FROM user_tenants()));
CREATE POLICY audit_logs_platform_admin ON audit_logs FOR ALL
    USING (is_platform_admin());
