export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // Validate required env vars at startup
        const missing: string[] = [];

        if (!process.env.DATABASE_URL) missing.push('DATABASE_URL');
        if (!process.env.RESEND_API_KEY) {
            console.warn('[Startup] RESEND_API_KEY is not set — emails will be mocked (logged to console only).');
        }
        if (!process.env.SESSION_SECRET) {
            console.warn('[Startup] SESSION_SECRET is not set — using insecure development default. Set this in production.');
        }

        if (missing.length > 0) {
            throw new Error(
                `[Startup] Missing required environment variables: ${missing.join(', ')}. ` +
                `Check your .env file or deployment configuration.`
            );
        }

        await import('./shared/lib/scheduler').then((m) => m.startScheduler());
    }
}
