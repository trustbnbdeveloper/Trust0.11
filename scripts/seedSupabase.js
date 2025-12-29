import { createClient } from '@supabase/supabase-js';

// Seed script (idempotent upserts). Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
// Usage (locally): SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node ./scripts/seedSupabase.js

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set these env vars before running the seed script.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// If a Postgres URL is provided, use it to run DDL (safe migrations)
const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;

async function runMigrationsIfNeeded() {
  if (!SUPABASE_DB_URL) {
    console.log('No SUPABASE_DB_URL provided; skipping automatic DDL migrations.');
    return;
  }

  // Run migrations via pg client (using service role or DB URL directly)
  console.log('SUPABASE_DB_URL found; running automatic DDL migrations...');

  // Robust import for pg (handles ESM/CJS interop nuances in different envs)
  const pgImport = await import('pg');
  const { Client } = pgImport.default || pgImport;

  const connectionString = String(SUPABASE_DB_URL || '').trim();
  console.log('Debug: SUPABASE_DB_URL type:', typeof SUPABASE_DB_URL);
  console.log('Debug: SUPABASE_DB_URL length:', connectionString.length);

  try {
    const u = new URL(connectionString);
    console.log('Debug: URL protocol:', u.protocol);
  } catch (e) {
    console.error('Debug: Invalid URL format:', e.message);
    // Don't throw yet, let Client try or fail, but this explains the error
  }

  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase/Cloud connections
  });
  try {
    await client.connect();

    // Create profiles table if it doesn't exist (matching schema.sql)
    const createProfiles = `
      CREATE TABLE IF NOT EXISTS profiles (
        user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
        full_name text,
        avatar_url text,
        type text DEFAULT 'user' CHECK (type IN ('user', 'platform_admin')),
        wishlist jsonb DEFAULT '[]'::jsonb,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `;

    await client.query(createProfiles);

    // Safely migrate columns if they don't exist (handle legacy schema)
    const migrateColumns = `
      DO $$
      BEGIN
        BEGIN
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
        EXCEPTION
            WHEN duplicate_column THEN NULL;
        END;
        BEGIN
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name text;
        EXCEPTION
            WHEN duplicate_column THEN NULL;
        END;
        BEGIN
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;
        EXCEPTION
            WHEN duplicate_column THEN NULL;
        END;
        BEGIN
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS type text DEFAULT 'user' CHECK (type IN ('user', 'platform_admin'));
        EXCEPTION
            WHEN duplicate_column THEN NULL;
        END;
      END $$;
    `;
    await client.query(migrateColumns);

    console.log('Migrations complete.');
  } catch (err) {
    console.error('Migration error:', err?.message || err);
    throw err;
  } finally {
    await client.end();
  }
}

async function tableExists(name) {
  try {
    const { data, error } = await supabase.from(name).select('user_id').limit(1);
    if (error) {
      // If column 'user_id' doesn't exist, we might get an error even if table exists. 
      // But runMigrationsIfNeeded needs connectivity to fix this.
      return true; // Assume table exists if we got this far, let upsert fail or work if schema just got fixed.
    }
    return true;
  } catch (err) {
    return false;
  }
}

async function seedProfiles() {
  // Use user_id, full_name, avatar_url to match schema.sql
  const profiles = [
    { user_id: 'admin-01', full_name: 'Admin User', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100', wishlist: [], type: 'platform_admin' },
    { user_id: 'guest-01', full_name: 'Alice Guest', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100', wishlist: [], type: 'user' }
  ];

  const { data, error } = await supabase.from('profiles').upsert(profiles, { onConflict: 'user_id' });
  if (error) {
    console.error('Failed to upsert profiles:', error.message || error);
    process.exit(3);
  }

  console.log('Profiles seeded/upserted successfully.');
}

async function main() {
  try {
    console.log('Starting Supabase seed...');
    await runMigrationsIfNeeded();
    await seedProfiles();
    console.log('Seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(4);
  }
}

main();
