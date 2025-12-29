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
  const { Client } = await import('pg');
  const client = new Client({ connectionString: SUPABASE_DB_URL });
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
      const msg = String(error.message || error);
      if (msg.toLowerCase().includes('does not exist') || msg.includes('relation')) return false;
      // If we queried user_id but it failed, maybe the column name is wrong? Try generic count
      return true;
    }
    return true;
  } catch (err) {
    return false;
  }
}

async function seedProfiles() {
  const exists = await tableExists('profiles');
  if (!exists) {
    console.warn('The `profiles` table does not exist. Ensure migrations (schema.sql) have run.');
    // Don't exit, try to insert anyway if the script above created it
  }

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
    await seedProfiles();
    console.log('Seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(4);
  }
}

main();
