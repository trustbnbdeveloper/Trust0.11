import { getSupabase, authenticate, resolveTenant } from './auth';
import { Env, BookingStatus, GuestSession } from './types';
import { maskEmail, signJWT, verifyJWT } from './utils';

export default {
    async fetch(request: Request, env: Env) {
        // Industry Standard Security & CORS Headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*', // Replace with specific domain in prod
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Tenant-ID',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        const url = new URL(request.url);

        // 1. Resolve Tenant
        const tenantId = resolveTenant(request);
        if (!tenantId && !url.pathname.includes('/health')) {
            return new Response(JSON.stringify({ error: 'Tenant could not be resolved' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }

        // 2. Routing logic
        try {
            // HEALTH CHECK
            if (url.pathname === '/health') {
                return new Response(JSON.stringify({ status: 'ok', tenantId }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            }

            // --- GUEST API (Unauthenticated/Code-based/JWT-based) ---

            // VIEW BOOKING (Initial login via code)
            if (url.pathname === '/api/v1/guest/booking' && request.method === 'POST') {
                const { bookingCode } = await request.json() as { bookingCode: string };
                if (!bookingCode) return new Response(JSON.stringify({ error: 'Booking code required' }), { status: 400, headers: corsHeaders });

                const supabase = getSupabase(env);
                const { data, error } = await supabase
                    .from('bookings')
                    .select(`
                        id, check_in, check_out, status, guest_name, guest_email,
                        properties (title, location),
                        payments (gross_amount, status)
                    `)
                    .eq('booking_code', bookingCode)
                    .single();

                if (error || !data) return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404, headers: corsHeaders });

                // Mask email and issue JWT session
                const maskedEmail = maskEmail(data.guest_email);
                const sessionToken = await signJWT({ booking_id: data.id, role: 'GUEST' }, env.JWT_SECRET, 15);

                return new Response(JSON.stringify({
                    booking: { ...data, guest_email: maskedEmail },
                    session: sessionToken
                }), { status: 200, headers: corsHeaders });
            }

            // JWT-PROTECTED GUEST ACTIONS
            const guestSessionPaths = ['/api/guest/cancel', '/api/guest/modify', '/api/guest/payment-retry', '/api/guest/upgrade'];
            if (guestSessionPaths.includes(url.pathname)) {
                const authHeader = request.headers.get('Authorization');
                if (!authHeader?.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'Session required' }), { status: 401, headers: corsHeaders });
                const token = authHeader.split(' ')[1];
                const session = await verifyJWT(token, env.JWT_SECRET) as GuestSession;
                if (!session || session.role !== 'GUEST') return new Response(JSON.stringify({ error: 'Invalid or expired session' }), { status: 401, headers: corsHeaders });

                const supabase = getSupabase(env);

                // CANCEL
                if (url.pathname === '/api/guest/cancel' && request.method === 'POST') {
                    const { data: booking, error: fetchError } = await supabase.from('bookings').select('status, check_in').eq('id', session.booking_id).single();
                    if (fetchError || !booking) throw new Error('Booking not found');

                    // Simple policy: No cancellation after check-in or if already canceled
                    if (booking.status === BookingStatus.CHECKED_IN || booking.status === BookingStatus.CANCELED) {
                        throw new Error('This booking cannot be canceled in its current state.');
                    }

                    const { error: updateError } = await supabase.from('bookings').update({ status: BookingStatus.CANCELED }).eq('id', session.booking_id);
                    if (updateError) throw updateError;

                    return new Response(JSON.stringify({ message: 'Booking canceled successfully' }), { status: 200, headers: corsHeaders });
                }

                // MODIFY
                if (url.pathname === '/api/guest/modify' && request.method === 'POST') {
                    const { checkIn, checkOut, numGuests } = await request.json() as any;
                    const { data: booking, error: fetchError } = await supabase.from('bookings').select('status, property_id').eq('id', session.booking_id).single();
                    if (fetchError || !booking) throw new Error('Booking not found');

                    if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.PENDING) {
                        throw new Error('Modifications are only allowed for confirmed or pending bookings.');
                    }

                    // Placeholder for availability check logic
                    // In a real app, we'd query for overlapping bookings here.

                    const { error: updateError } = await supabase
                        .from('bookings')
                        .update({ check_in: checkIn, check_out: checkOut, num_guests: numGuests })
                        .eq('id', session.booking_id);

                    if (updateError) throw updateError;
                    return new Response(JSON.stringify({ message: 'Booking modified successfully' }), { status: 200, headers: corsHeaders });
                }

                // PAYMENT RETRY
                if (url.pathname === '/api/guest/payment-retry' && request.method === 'POST') {
                    const { data: booking, error: fetchError } = await supabase
                        .from('bookings')
                        .select('status, tenant_id, property_id, guest_email, guest_name')
                        .eq('id', session.booking_id)
                        .single();
                    if (fetchError || !booking) throw new Error('Booking not found');

                    // Trigger payment logic (e.g., create new Stripe session)
                    // This is an integration point. For now, we return a success placeholder.

                    return new Response(JSON.stringify({
                        message: 'Payment session initialized',
                        checkoutUrl: `https://checkout.stripe.com/pay/placeholder`
                    }), { status: 200, headers: corsHeaders });
                }

                // UPGRADE TO ACCOUNT
                if (url.pathname === '/api/guest/upgrade' && request.method === 'POST') {
                    const { email, password } = await request.json() as any;
                    // Create Supabase Auth User
                    const { data: authData, error: authError } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });

                    if (authError) throw authError;

                    // Link booking to user
                    await supabase.from('bookings').update({ guest_id: authData.user.id }).eq('id', session.booking_id);

                    return new Response(JSON.stringify({ message: 'Account created and linked', userId: authData.user.id }), { status: 200, headers: corsHeaders });
                }

                // CONTACT SUPPORT
                if (url.pathname === '/api/guest/support' && request.method === 'POST') {
                    // Placeholder for support ticket creation
                    return new Response(JSON.stringify({ message: 'Support request received' }), { status: 200, headers: corsHeaders });
                }

                // Placeholder for Action Not Found
                return new Response(JSON.stringify({ error: 'Action not yet implemented' }), { status: 501, headers: corsHeaders });
            }

            // --- STAFF / ADMIN API (Bearer Token Auth) ---
            const userContext = await authenticate(request, env);

            if (url.pathname === '/api/v1/properties' && request.method === 'GET') {
                if (!tenantId) throw new Error('Tenant context required');
                const supabase = getSupabase(env);
                const { data, error } = await supabase.from('properties').select('*').eq('tenant_id', tenantId);
                if (error) throw error;
                return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });
            }

            // AI PROXY
            if (url.pathname === '/api/generate' && request.method === 'POST') {
                if (!env.GEMINI_API_KEY) throw new Error('Gemini API not configured');
                // ... (logic from before)
                return new Response(JSON.stringify({ text: "AI endpoint active" }), { status: 200, headers: corsHeaders });
            }

            return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: corsHeaders });

        } catch (err: any) {
            return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }
    }
};
