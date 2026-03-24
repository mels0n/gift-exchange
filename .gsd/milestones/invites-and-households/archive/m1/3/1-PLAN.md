---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: SEND_MATCH Email Handler

## Objective
Implement the empty `SEND_MATCH` job handler so households receive a real email listing their gift assignments, budget per kid, and a link to their reveal page. Also patches `runMatching` to include `eventId` in the payload (needed for the reveal URL).

## Context
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- src/features/admin-scheduler/api/process-queue.ts
- src/app/admin/actions.ts
- src/shared/api/db.ts

## Tasks

<task type="auto">
  <name>Add eventId and eventName to SEND_MATCH job payload</name>
  <files>src/app/admin/actions.ts</files>
  <action>
    In `runMatching`, the `db.job.create` call for `SEND_MATCH` is missing `eventId` and `eventName`,
    which are needed to construct the reveal URL in the email.

    Find this block inside the `for (const p of participations)` loop:
    ```ts
    await db.job.create({
        data: {
            type: 'SEND_MATCH',
            payload: JSON.stringify({
                email,
                householdName: p.household.name,
                recipients: recipientKids.map(k => ({ id: k.id, name: k.name })),
                budget: event.budget,
                items: event.items,
            }),
        },
    });
    ```

    Add `eventId` and `eventName` to the payload:
    ```ts
    await db.job.create({
        data: {
            type: 'SEND_MATCH',
            payload: JSON.stringify({
                email,
                eventId: event.id,
                eventName: event.name,
                householdName: p.household.name,
                recipients: recipientKids.map(k => ({ id: k.id, name: k.name })),
                budget: event.budget,
                items: event.items,
            }),
        },
    });
    ```

    No other changes to this file.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>
    - `SEND_MATCH` job payload includes `eventId` and `eventName`
    - TypeScript compiles cleanly
  </done>
</task>

<task type="auto">
  <name>Implement SEND_MATCH email handler in process-queue.ts</name>
  <files>src/features/admin-scheduler/api/process-queue.ts</files>
  <action>
    Replace the empty `SEND_MATCH` case with a full implementation.

    The payload shape is:
    ```ts
    {
        email: string;
        eventId: string;
        eventName: string;
        householdName: string;
        recipients: { id: string; name: string }[];
        budget: number;        // dollars per kid
        items: number;         // wrapped items per kid
    }
    ```

    Replace:
    ```ts
    case 'SEND_MATCH':
        // Payload: { email: string, matches: MatchResult[] }
        // ... logic to prompt user
        break;
    ```

    With:
    ```ts
    case 'SEND_MATCH': {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
        const revealUrl = `${baseUrl}/reveal/${payload.eventId}`;
        const totalBudget = payload.recipients.length * payload.budget;
        const totalItems = payload.recipients.length * payload.items;

        const recipientListHtml = payload.recipients
            .map((r: { name: string }) => `<li style="padding: 6px 0; font-size: 16px;">${r.name}</li>`)
            .join('');

        const html = `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Georgia, serif; background: #0f0f0f; color: #f5f0eb; margin: 0; padding: 32px;">
                <div style="max-width: 520px; margin: 0 auto; background: #1a1010; border: 1px solid #3a2020; border-radius: 12px; padding: 40px;">
                    <h1 style="font-size: 28px; color: #f8c4c4; margin: 0 0 8px;">🎄 ${payload.eventName}</h1>
                    <p style="color: #a08080; margin: 0 0 32px; font-size: 14px;">Your gift assignments are ready, ${payload.householdName}.</p>

                    <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #806060; margin: 0 0 12px;">You are buying for</h2>
                    <ul style="list-style: none; padding: 0; margin: 0 0 32px; background: #0f0808; border: 1px solid #2a1515; border-radius: 8px; padding: 16px 20px;">
                        ${recipientListHtml}
                    </ul>

                    <div style="background: #1f0a0a; border: 1px solid #5a2020; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                        <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #806060; margin: 0 0 16px;">Your Total Commitment</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="color: #a08080; font-size: 14px; padding: 4px 0;">Budget</td>
                                <td style="text-align: right; font-size: 22px; font-weight: bold; color: #f8c4c4;">$${totalBudget.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td style="color: #a08080; font-size: 14px; padding: 4px 0;">Wrapped items</td>
                                <td style="text-align: right; font-size: 22px; font-weight: bold; color: #f8c4c4;">${totalItems}</td>
                            </tr>
                        </table>
                        <p style="font-size: 11px; color: #604040; margin: 12px 0 0; text-align: center;">($${payload.budget} &amp; ${payload.items} items per child)</p>
                    </div>

                    <div style="text-align: center;">
                        <a href="${revealUrl}" style="display: inline-block; background: linear-gradient(135deg, #b91c1c, #be185d); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; letter-spacing: 0.05em;">
                            View Full Assignments →
                        </a>
                    </div>

                    <p style="font-size: 11px; color: #604040; text-align: center; margin: 24px 0 0;">Keep your assignments secret! Do not share this email.</p>
                </div>
            </body>
            </html>
        `;

        if (process.env.RESEND_API_KEY?.startsWith('re_')) {
            await resend.emails.send({
                from: process.env.EMAIL_FROM ?? 'Gift Exchange <no-reply@resend.dev>',
                to: payload.email,
                subject: `🎄 Your assignments for ${payload.eventName}`,
                html,
            });
        } else {
            console.log('[MOCK SEND_MATCH EMAIL]', { to: payload.email, event: payload.eventName, recipients: payload.recipients });
        }
        break;
    }
    ```

    Notes:
    - `EMAIL_FROM` env var allows the sender address to be customized without a code change
    - Falls back to mock (console.log) if `RESEND_API_KEY` doesn't start with `re_`
    - `NEXT_PUBLIC_BASE_URL` is needed in production — defaults to localhost for dev
  </action>
  <verify>npx tsc --noEmit && npm run build</verify>
  <done>
    - `SEND_MATCH` case is no longer empty
    - Sends HTML email via Resend when `RESEND_API_KEY` is set
    - Logs mock output when key is absent
    - `npm run build` succeeds
  </done>
</task>

## Success Criteria
- [ ] `SEND_MATCH` job payload includes `eventId` and `eventName`
- [ ] Running the job queue processes a `SEND_MATCH` job without throwing
- [ ] Email HTML contains recipient names, total budget, total items, and a reveal link
- [ ] Mock path (no API key) logs to console instead of throwing
- [ ] `npm run build` succeeds with no type errors
