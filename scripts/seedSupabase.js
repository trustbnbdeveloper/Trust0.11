import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Handling __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Seed script (idempotent upserts). Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
// Usage (locally): node ./scripts/seedSupabase.js

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

  console.log('SUPABASE_DB_URL found; preparing to run schema.sql...');

  // Robust import for pg
  const pgImport = await import('pg');
  const { Client } = pgImport.default || pgImport;

  let dbUrl = String(SUPABASE_DB_URL || '').trim();
  if ((dbUrl.startsWith('"') && dbUrl.endsWith('"')) || (dbUrl.startsWith("'") && dbUrl.endsWith("'"))) {
    dbUrl = dbUrl.slice(1, -1);
  }

  if (!dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://')) {
    dbUrl = 'postgresql://' + dbUrl;
  }

  let clientConfig = {
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  };

  // Attempt to resolve host if needed (IPv4 fix)
  try {
    const u = new URL(clientConfig.connectionString);
    const host = u.hostname;

    // Simple basic check if IP
    if (host && !host.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
      const dns = await import('dns');
      const { promises: { lookup } } = dns.default || dns;
      console.log(`Debug: Resolving ${host} to IPv4...`);
      try {
        const { address } = await lookup(host, { family: 4 });
        console.log(`Debug: Resolved to ${address}`);
        u.hostname = address;
        clientConfig.connectionString = u.toString();
      } catch (e) {
        console.warn(`DNS lookup failed: ${e.message}. Using original host.`);
      }
    }
  } catch (err) {
    // Ignore parsing errors, let pg handle it
  }

  const client = new Client(clientConfig);
  try {
    await client.connect();
    console.log('Connected to database via Postgres client.');
    await applySchemaSql(client);
  } catch (err) {
    console.error('\n⚠️  DATABASE CONNECTION FAILED (Likely IPv6/Network Issue) ⚠️');
    console.error('-----------------------------------------------------------');
    console.error('Could not connect to Postgres to apply `schema.sql`.');
    console.error('Error:', err.message);

    console.error('\n👉 ACTION REQUIRED:');
    console.error('1. Open Supabase Dashboard > SQL Editor');
    console.error('2. Copy the contents of `schema.sql` from your project');
    console.error('3. Paste and run it manually in the Dashboard.');
    console.error('-----------------------------------------------------------\n');
    console.log('Attempting to proceed with Data Seeding via HTTP API (supabase-js)...');
    // We do NOT re-throw. We return to allow seeding to continue.
  } finally {
    if (client._connected) await client.end();
  }
}

async function applySchemaSql(client) {
  try {
    const schemaPath = path.resolve(__dirname, '../schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.error('schema.sql not found at', schemaPath);
      return;
    }
    const sql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Applying schema.sql...');
    await client.query(sql);
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Failed to apply schema:', err);
    throw err;
  }
}

async function seedData() {
  console.log('Seeding initial data...');

  // 1. Create a Default Tenant (minimal fields only)
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .upsert({
      name: 'TrustBnB Demo Agency',
      subdomain: 'demo-agency'
    }, { onConflict: 'subdomain' })
    .select()
    .single();

  if (tenantError) {
    console.error('Failed to seed Tenant:', tenantError);
    console.log('\n⚠️  If you see schema cache errors, please:');
    console.log('1. Go to Supabase Dashboard > API Docs');
    console.log('2. Click "Reload schema cache" (top right)');
    console.log('3. Run this script again\n');
    return;
  }
  console.log('✅ Seeded Tenant:', tenant.name);

  console.log('\n📝 Note: Auth user and profile seeding skipped.');
  console.log('You can create users manually via Supabase Dashboard > Authentication');
  console.log('Seed data process finished.');
}

async function main() {
  try {
    console.log('Starting TrustBnB Seed...');
    await runMigrationsIfNeeded();
    await seedData();
    console.log('Seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding process failed:', err.message);
    process.exit(1);
  }
}

main();
