import { createClient } from '@supabase/supabase-js';

// Uses Vite env variables - set these as Pages/Environment variables or in .env during local dev
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
// Accept either the classic anon key name or the newer publishable key name the dashboard shows
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY) as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase URL or Anon/Publishable Key is not set. Authentication and DB calls will not work until these env vars are provided.');
}

export const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

export default supabase;
