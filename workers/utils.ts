/**
 * Masks an email for privacy.
 * Example: "shams@gmail.com" -> "s***s@gmail.com"
 */
export function maskEmail(email: string): string {
    const [name, domain] = email.split('@');
    if (!name || !domain) return email;
    if (name.length <= 2) return `${name[0]}***@${domain}`;
    return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

/**
 * Signs a payload into a short-lived JWT using WebCrypto (HS256).
 */
export async function signJWT(payload: any, secret: string, expiresInMinutes: number = 15): Promise<string> {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
        ...payload,
        iat: now,
        exp: now + (expiresInMinutes * 60)
    };

    const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const encodedPayload = btoa(JSON.stringify(fullPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        enc.encode(dataToSign)
    );

    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    return `${dataToSign}.${encodedSignature}`;
}

/**
 * Verifies a JWT token and returns the payload.
 */
export async function verifyJWT(token: string, secret: string): Promise<any | null> {
    try {
        const [header, payload, signature] = token.split('.');
        if (!header || !payload || !signature) return null;

        const dataToVerify = `${header}.${payload}`;
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            enc.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        // JWT signatures use base64url
        const sigData = Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

        const isValid = await crypto.subtle.verify(
            'HMAC',
            key,
            sigData,
            enc.encode(dataToVerify)
        );

        if (!isValid) return null;

        const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        const now = Math.floor(Date.now() / 1000);

        if (decodedPayload.exp && now > decodedPayload.exp) return null;

        return decodedPayload;
    } catch (e) {
        return null;
    }
}
