import { db } from '@/shared/api/db';
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock');

export async function processJobQueue() {
    const jobs = await db.job.findMany({
        where: {
            status: 'PENDING',
            attempts: { lt: 3 } // Max 3 retries
        },
        take: 10 // Batch size
    });

    if (jobs.length === 0) return;

    console.log(`[Queue] Processing ${jobs.length} jobs...`);

    for (const job of jobs) {
        try {
            await processSingleJob(job);

            await db.job.update({
                where: { id: job.id },
                data: { status: 'COMPLETED' }
            });
        } catch (err) {
            console.error(`[Queue] Job ${job.id} failed:`, err);

            await db.job.update({
                where: { id: job.id },
                data: {
                    attempts: { increment: 1 },
                    lastError: String(err),
                    status: job.attempts >= 2 ? 'FAILED' : 'PENDING'
                }
            });
        }
    }
}

async function processSingleJob(job: any) {
    const payload = JSON.parse(job.payload);

    switch (job.type) {
        case 'SEND_OTP':
            if (process.env.RESEND_API_KEY?.startsWith('re_')) {
                await resend.emails.send({
                    from: 'Gift Exchange <no-reply@resend.dev>', // Update this in Prod
                    to: payload.email,
                    subject: 'Your Login Code',
                    html: `<p>Your code is: <strong>${payload.code}</strong></p>`
                });
            } else {
                console.log('[MOCK EMAIL]', payload);
            }
            break;

        case 'SEND_MATCH':
            // Payload: { email: string, matches: MatchResult[] }
            // ... logic to prompt user
            break;

        default:
            throw new Error(`Unknown job type: ${job.type}`);
    }
}
