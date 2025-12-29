import { createClient } from '@supabase/supabase-js';

export interface Env {
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    STRIPE_SECRET_KEY: string;
    GEMINI_API_KEY: string;
    JWT_SECRET: string;
    MODEL?: string;
}

export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'OWNER' | 'HOST' | 'GUEST';

export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CHECKED_IN = 'checked_in',
    CHECKED_OUT = 'checked_out',
    CANCELED = 'canceled',
    NO_SHOW = 'no_show'
}

export interface UserContext {
    id: string;
    tenantId: string;
    role: UserRole;
    email: string;
}

export interface GuestSession {
    booking_id: string;
    role: 'GUEST';
}

export interface TenantConfig {
    // ... existing fields
    id: string;
    name: string;
    subdomain: string;
    brandColor: string;
    commissionRate: number;
}
