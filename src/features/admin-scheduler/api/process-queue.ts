import { db } from '@/shared/api/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock');

export async function processJobQueue() {
    const jobs = await db.job.findMany({
        where: {
            status: 'PENDING',
            attempts: { lt: 3 },
        },
        take: 10,
    });

    if (jobs.length === 0) return;

    console.log(`[Queue] Processing ${jobs.length} jobs...`);

    for (const job of jobs) {
        try {
            await processSingleJob(job);
            await db.job.update({
                where: { id: job.id },
                data: { status: 'COMPLETED' },
            });
        } catch (err) {
            console.error(`[Queue] Job ${job.id} failed:`, err);
            await db.job.update({
                where: { id: job.id },
                data: {
                    attempts: { increment: 1 },
                    lastError: String(err),
                    status: job.attempts >= 2 ? 'FAILED' : 'PENDING',
                },
            });
        }
    }
}

async function processSingleJob(job: { id: string; type: string; payload: string; attempts: number }) {
    const payload = JSON.parse(job.payload);
    const useRealEmail = process.env.RESEND_API_KEY?.startsWith('re_');
    const from = process.env.EMAIL_FROM ?? 'Giftr <no-reply@resend.dev>';

    switch (job.type) {
        case 'SEND_OTP': {
            if (useRealEmail) {
                const otpHtml = `<!DOCTYPE html>
<html>
<body style="font-family:Georgia,serif;background:#0f0f0f;color:#f5f0eb;margin:0;padding:32px;">
  <div style="max-width:480px;margin:0 auto;background:#1a1010;border:1px solid #3a2020;border-radius:12px;padding:40px;">
    <h1 style="font-size:22px;color:#f8c4c4;margin:0 0 8px;letter-spacing:0.02em;">🎄 Giftr</h1>
    <p style="color:#806060;font-size:13px;margin:0 0 32px;text-transform:uppercase;letter-spacing:0.08em;">Login Code</p>
    <p style="color:#a08080;font-size:15px;margin:0 0 24px;">Use the code below to sign in. It expires in 10 minutes.</p>
    <div style="text-align:center;background:#0f0808;border:1px solid #5a2020;border-radius:8px;padding:32px 20px;margin-bottom:32px;">
      <span style="font-size:42px;font-weight:700;letter-spacing:0.25em;color:#f8c4c4;font-family:monospace;">${payload.code}</span>
    </div>
    <p style="font-size:12px;color:#604040;text-align:center;margin:0;">If you didn&apos;t request this code, you can safely ignore this email.</p>
  </div>
</body>
</html>`;
                await resend.emails.send({
                    from,
                    to: payload.email,
                    subject: 'Your Giftr Login Code',
                    html: otpHtml,
                });
            } else {
                console.log('[MOCK SEND_OTP]', payload);
            }
            break;
        }

        case 'SEND_MATCH': {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
            const revealUrl = `${baseUrl}/reveal/${payload.eventId}`;
            const totalBudget = payload.recipients.length * payload.budget;
            const totalItems = payload.recipients.length * payload.items;

            const recipientListHtml = payload.recipients
                .map((r: { name: string }) => `<li style="padding:6px 0;font-size:16px;">${r.name}</li>`)
                .join('');

            const html = `<!DOCTYPE html>
<html>
<body style="font-family:Georgia,serif;background:#0f0f0f;color:#f5f0eb;margin:0;padding:32px;">
  <div style="max-width:520px;margin:0 auto;background:#1a1010;border:1px solid #3a2020;border-radius:12px;padding:40px;">
    <h1 style="font-size:28px;color:#f8c4c4;margin:0 0 8px;">🎄 ${payload.eventName}</h1>
    <p style="color:#a08080;margin:0 0 32px;font-size:14px;">Your gift assignments are ready, ${payload.householdName}.</p>

    <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.1em;color:#806060;margin:0 0 12px;">You are buying for</h2>
    <ul style="list-style:none;padding:16px 20px;margin:0 0 32px;background:#0f0808;border:1px solid #2a1515;border-radius:8px;">
      ${recipientListHtml}
    </ul>

    <div style="background:#1f0a0a;border:1px solid #5a2020;border-radius:8px;padding:20px;margin-bottom:32px;">
      <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.1em;color:#806060;margin:0 0 16px;">Your Total Commitment</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="color:#a08080;font-size:14px;padding:4px 0;">Budget</td>
          <td style="text-align:right;font-size:22px;font-weight:bold;color:#f8c4c4;">$${totalBudget.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="color:#a08080;font-size:14px;padding:4px 0;">Wrapped items</td>
          <td style="text-align:right;font-size:22px;font-weight:bold;color:#f8c4c4;">${totalItems}</td>
        </tr>
      </table>
      <p style="font-size:11px;color:#604040;margin:12px 0 0;text-align:center;">($${payload.budget} &amp; ${payload.items} items per child)</p>
    </div>

    <div style="text-align:center;">
      <a href="${revealUrl}" style="display:inline-block;background:linear-gradient(135deg,#b91c1c,#be185d);color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.05em;">
        View Full Assignments →
      </a>
    </div>

    <p style="font-size:11px;color:#604040;text-align:center;margin:24px 0 0;">Keep your assignments secret! Do not share this email.</p>
  </div>
</body>
</html>`;

            if (useRealEmail) {
                await resend.emails.send({
                    from,
                    to: payload.email,
                    subject: `🎄 Your assignments for ${payload.eventName}`,
                    html,
                });
            } else {
                console.log('[MOCK SEND_MATCH]', {
                    to: payload.email,
                    event: payload.eventName,
                    recipients: payload.recipients,
                    totalBudget,
                    totalItems,
                    revealUrl,
                });
            }
            break;
        }

        case 'SEND_INVITE': {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
            const acceptUrl = `${baseUrl}/invite/${payload.inviteToken}`;

            const html = `<!DOCTYPE html>
<html>
<body style="font-family:Georgia,serif;background:#0f0f0f;color:#f5f0eb;margin:0;padding:32px;">
  <div style="max-width:480px;margin:0 auto;background:#1a1010;border:1px solid #3a2020;border-radius:12px;padding:40px;">
    <h1 style="font-size:24px;color:#f8c4c4;margin:0 0 16px;">🎄 You're invited!</h1>
    <p style="color:#a08080;font-size:15px;margin:0 0 24px;">
      You've been invited to join <strong style="color:#f8c4c4;">${payload.eventName}</strong>.
    </p>
    <div style="text-align:center;">
      <a href="${acceptUrl}" style="display:inline-block;background:linear-gradient(135deg,#b91c1c,#be185d);color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.05em;">
        Accept Invitation →
      </a>
    </div>
    <p style="font-size:11px;color:#604040;text-align:center;margin:24px 0 0;">
      If you weren't expecting this, you can ignore this email.
    </p>
  </div>
</body>
</html>`;

            if (useRealEmail) {
                await resend.emails.send({
                    from,
                    to: payload.email,
                    subject: `🎄 You're invited to ${payload.eventName}`,
                    html,
                });
            } else {
                console.log('[MOCK SEND_INVITE]', {
                    to: payload.email,
                    event: payload.eventName,
                    acceptUrl,
                });
            }
            break;
        }

        case 'SEND_JOIN_CONFIRMATION': {
            const html = `<!DOCTYPE html>
<html>
<body style="font-family:Georgia,serif;background:#0f0f0f;color:#f5f0eb;margin:0;padding:32px;">
  <div style="max-width:480px;margin:0 auto;background:#1a1010;border:1px solid #3a2020;border-radius:12px;padding:40px;">
    <h1 style="font-size:24px;color:#f8c4c4;margin:0 0 16px;">🎄 You&apos;ve joined!</h1>
    <p style="color:#a08080;font-size:15px;margin:0 0 8px;">
      <strong style="color:#f8c4c4;">${payload.householdName}</strong> is now registered for
      <strong style="color:#f8c4c4;">${payload.eventName}</strong>.
    </p>
    <p style="color:#a08080;font-size:14px;margin:0 0 24px;">
      You&apos;ll receive your gift assignments by email once matching is complete.
    </p>
    <p style="font-size:11px;color:#604040;text-align:center;margin:0;">Giftr — the thoughtful way to give.</p>
  </div>
</body>
</html>`;

            if (useRealEmail) {
                await resend.emails.send({
                    from,
                    to: payload.email,
                    subject: `🎄 You've joined ${payload.eventName}!`,
                    html,
                });
            } else {
                console.log('[MOCK SEND_JOIN_CONFIRMATION]', payload);
            }
            break;
        }

        default:
            throw new Error(`Unknown job type: ${job.type}`);
    }
}
