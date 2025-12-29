import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Env, UserContext } from './types';

export const getSupabase = (env: Env): SupabaseClient => {
    return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
};

export const authenticate = async (request: Request, env: Env): Promise<UserContext | null> => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.split(' ')[1];
    const supabase = getSupabase(env);

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;

    // Fetch the user's profile and tenant
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) return null;

    return {
        id: user.id,
        email: user.email!,
        tenantId: profile.tenant_id,
        role: profile.role,
    };
};

export const resolveTenant = (request: Request): string | null => {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // Simple resolution: sub.example.com -> 'sub'
    // In local dev, we might use a header or query param
    const tenantFromHeader = request.headers.get('X-Tenant-ID');
    if (tenantFromHeader) return tenantFromHeader;

    const parts = hostname.split('.');
    if (parts.length >= 3) {
        return parts[0];
    }

    return null;
};
