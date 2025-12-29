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

  console.log('SUPABASE_DB_URL found; running automatic DDL migrations...');

  // Robust import for pg (handles ESM/CJS interop nuances in different envs)
  const pgImport = await import('pg');
  const { Client } = pgImport.default || pgImport;

  let dbUrl = String(SUPABASE_DB_URL || '').trim();
  // Strip quotes
  if ((dbUrl.startsWith('"') && dbUrl.endsWith('"')) || (dbUrl.startsWith("'") && dbUrl.endsWith("'"))) {
    dbUrl = dbUrl.slice(1, -1);
  }

  // Ensure protocol for parsing (and if we fall back)
  if (!dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://')) {
    dbUrl = 'postgresql://' + dbUrl;
  }

  let clientConfig = {
    ssl: { rejectUnauthorized: false }
  };

  // Manual parsing to bypass pg-connection-string issues with special chars (like '?' in password)
  try {
    const protocolRegex = /^(?:postgres|postgresql):\/\//;
    const noProtocol = dbUrl.replace(protocolRegex, '');
    const lastAt = noProtocol.lastIndexOf('@');

    if (lastAt !== -1) {
      const auth = noProtocol.substring(0, lastAt);
      const rest = noProtocol.substring(lastAt + 1);

      const firstColon = auth.indexOf(':');
      if (firstColon !== -1) {
        clientConfig.user = auth.substring(0, firstColon);
        clientConfig.password = auth.substring(firstColon + 1); // Exact raw password

        const slashIndex = rest.indexOf('/');
        const hostPort = slashIndex !== -1 ? rest.substring(0, slashIndex) : rest;
        clientConfig.database = slashIndex !== -1 ? rest.substring(slashIndex + 1).split('?')[0] : 'postgres';

        const colonIndex = hostPort.lastIndexOf(':');
        if (colonIndex !== -1) {
          clientConfig.host = hostPort.substring(0, colonIndex);
          clientConfig.port = parseInt(hostPort.substring(colonIndex + 1));
        } else {
          clientConfig.host = hostPort;
          clientConfig.port = 5432;
        }
        console.log('Debug: Manual parsing successful. Host:', clientConfig.host);
      }
    }
  } catch (parseErr) {
    console.warn('Debug: Manual parsing failed:', parseErr.message);
  }

  // Fallback if manual parsing didn't find a user
  if (!clientConfig.user) {
    console.log('Debug: Falling back to connectionString.');
    // Try the fix we attempted before, just in case
    if (dbUrl.includes(':?')) {
      dbUrl = dbUrl.replace(':?', ':%3F');
    }
    clientConfig.connectionString = dbUrl;
  }

  // Force IPv4 resolution to prevent ENETUNREACH in CI environments with broken IPv6/dual-stack
  // Only explicitly resolve if we have a hostname (not if using connectionString directly or IP)
  const hostToResolve = clientConfig.host || (clientConfig.connectionString ? new URL(clientConfig.connectionString).hostname : null);

  if (hostToResolve && !hostToResolve.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
    try {
      const dns = await import('dns');
      const { promises: { lookup } } = dns.default || dns;
      console.log(`Debug: Resolving ${hostToResolve} to IPv4...`);
      const { address } = await lookup(hostToResolve, { family: 4 });
      console.log(`Debug: Resolved to ${address}`);

      if (clientConfig.host) {
        clientConfig.host = address;
      } else if (clientConfig.connectionString) {
        // If using connectionString, we need to replace the hostname in it
        // This is tricky with passwords, so we might just assume manual parsing worked mostly.
        // But if manual parsing failed, we are here.
        // Simplest is to trust manual parsing mostly worked or force it for the object style.
      }
    } catch (dnsErr) {
      console.warn('Debug: DNS lookup failed, using original host:', dnsErr.message);
    }
  }

  const client = new Client(clientConfig);
  try {
    await client.connect();
    await runDbOperations(client);
  } catch (err) {
    const isNetworkError = err.code === 'ENETUNREACH' || err.code === 'EADDRNOTAVAIL' || err.code === 'ECONNREFUSED';
    const isSupabase = dbUrl.includes('supabase.co');

    if (isNetworkError && isSupabase) {
      console.warn('\nDebug: Primary connection failed with network error. Detected Supabase URL.');
      console.warn('Debug: Attempting to auto-discover IPv4 Connection Pooler (Supavisor) to bypass IPv6-only restriction...');

      // Extract project ref from the original host (db.xyz.supabase.co)
      // We need this because Supavisor often requires 'user.projectref' as the username.
      const originalHost = clientConfig.host || '';
      const projectRefMatch = originalHost.match(/^db\.([a-z0-9]+)\.supabase\.co$/);
      const projectRef = projectRefMatch ? projectRefMatch[1] : null;

      if (projectRef) {
        console.log(`Debug: Extracted Project Reference: ${projectRef}`);
      }

      const regions = [
        'eu-central-1', 'us-east-1', 'us-west-1', 'us-west-2', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1',
        'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2', 'sa-east-1', 'ca-central-1', 'ap-south-1',
        'us-east-2', 'af-south-1', 'me-central-1'
      ];

      const dns = await import('dns');
      const { promises: { resolve4 } } = dns.default || dns;

      let workingClient = null;

      for (const region of regions) {
        const poolerHost = `aws-0-${region}.pooler.supabase.com`;
        try {
          // Check if this pooler host exists (has IPv4 IP)
          await resolve4(poolerHost);

          // If it resolves, try to connect
          console.log(`Debug: Probing pooler: ${poolerHost} (Port 6543)...`);

          // Construct pooler config
          // CRITICAL: Username must be 'user.projectref' for Supavisor
          const poolerUser = (projectRef && clientConfig.user && !clientConfig.user.includes('.'))
            ? `${clientConfig.user}.${projectRef}`
            : clientConfig.user;

          const poolerConfig = {
            ...clientConfig,
            host: poolerHost,
            port: 6543,
            user: poolerUser
          };

          const probeClient = new Client(poolerConfig);

          await probeClient.connect();
          console.log(`Debug: SUCCESS! Connected via ${poolerHost} as ${poolerUser}`);
          workingClient = probeClient;
          break; // Found it!
        } catch (probeErr) {
          // Log auth errors specifically to help debug
          const msg = probeErr.message;
          if (!msg.includes('ENOTFOUND') && !msg.includes('EAI_AGAIN')) {
            console.log(`Debug: Probe failed for ${region}: ${msg}`);
          }
          if (workingClient) break;
        }
      }

      if (workingClient) {
        await runDbOperations(workingClient);
        await workingClient.end();
        console.log('Seed complete (via IPv4 Pooler).');
        process.exit(0);
      } else {
        console.error('Debug: Could not find a working IPv4 pooler. Please update SUPABASE_DB_URL to use the Session Pooler connection string.');
        throw err;
      }
    } else {
      throw err;
    }
  } finally {
    if (client._connected) await client.end();
  }
}

async function runDbOperations(client) {
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
