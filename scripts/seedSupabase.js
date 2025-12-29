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

    // Create profiles table if it doesn't exist
    const createProfiles = `
      CREATE TABLE IF NOT EXISTS profiles (
        id uuid PRIMARY KEY,
        name text,
        avatar text,
        wishlist jsonb DEFAULT '[]'::jsonb,
        created_at timestamptz DEFAULT now()
      );
    `;

    await client.query(createProfiles);

    // Try to add a FK to auth.users if auth schema exists and not already constrained
    try {
      await client.query(`ALTER TABLE profiles ADD CONSTRAINT profiles_auth_user_fk FOREIGN KEY (id) REFERENCES auth.users(id)`);
    } catch (fkErr) {
      // ignore if constraint exists or auth schema not present
      const m = String(fkErr?.message || fkErr);
      if (m.toLowerCase().includes('already exists') || m.toLowerCase().includes('duplicate')) {
        // fine
      } else {
        console.warn('Could not add FK to auth.users (it may not exist), continuing:', m);
      }
    }

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
    const { data, error } = await supabase.from(name).select('id').limit(1);
    if (error) {
      const msg = String(error.message || error);
      if (msg.toLowerCase().includes('does not exist') || msg.includes('relation')) return false;
      throw error;
    }
    return true;
  } catch (err) {
    // If it appears to be a missing relation, return false; otherwise rethrow
    const m = String(err?.message || err);
    if (m.toLowerCase().includes('does not exist') || m.includes('relation')) return false;
    throw err;
  }
}

async function seedProfiles() {
  const exists = await tableExists('profiles');
  if (!exists) {
    console.error('\nThe `profiles` table does not exist in your Supabase project even after attempting migrations.');
    console.error('If you want the script to create it automatically, provide `SUPABASE_DB_URL` (Postgres connection) and re-run the script.');
    console.error('\nSQL needed:\n');
    console.error(`create table profiles (\n  id uuid primary key references auth.users(id),\n  name text,\n  avatar text,\n  wishlist jsonb default '[]'::jsonb,\n  created_at timestamptz default now()\n);\n`);
    process.exit(2);
  }

  const profiles = [
    { id: 'admin-01', name: 'Admin User', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100', wishlist: [] },
    { id: 'guest-01', name: 'Alice Guest', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100', wishlist: ['1', '3'] }
  ];

  const { data, error } = await supabase.from('profiles').upsert(profiles, { onConflict: 'id' });
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
