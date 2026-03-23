import { createHmac } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const SECRET = process.env.SESSION_SECRET ?? 'dev-secret-change-me';
const COOKIE = 'session_id';

function sign(payload: string): string {
    const sig = createHmac('sha256', SECRET).update(payload).digest('hex');
    return `${payload}.${sig}`;
}

function unsign(value: string): string | null {
    const lastDot = value.lastIndexOf('.');
    if (lastDot === -1) return null;
    const payload = value.slice(0, lastDot);
    const expected = sign(payload);
    // Constant-time comparison to prevent timing attacks
    if (value.length !== expected.length) return null;
    let diff = 0;
    for (let i = 0; i < value.length; i++) {
        diff |= value.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    return diff === 0 ? payload : null;
}

export async function setSession(email: string) {
    const payload = JSON.stringify({ email });
    const signed = sign(payload);
    const cookieStore = await cookies();
    cookieStore.set(COOKIE, signed, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
    });
}

export async function getSession(): Promise<{ email: string } | null> {
    const cookieStore = await cookies();
    const raw = cookieStore.get(COOKIE)?.value;
    if (!raw) return null;
    const payload = unsign(raw);
    if (!payload) return null;
    try {
        return JSON.parse(payload) as { email: string };
    } catch {
        return null;
    }
}

export async function requireSession(redirectTo = '/login'): Promise<{ email: string }> {
    const session = await getSession();
    if (!session) redirect(redirectTo);
    return session;
}
