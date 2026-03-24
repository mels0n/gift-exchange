---
phase: 2
plan: 2
wave: 1
---

# Plan 2.2: Decline Invite + Join Confirmation Email

## Objective
Invitees can decline an invite from the invite page. When a household accepts an invite (either directly or via the post-registration cookie path), a confirmation email is sent to all household emails.

## Context
- src/app/invite/[token]/page.tsx
- src/app/invite/[token]/actions.ts
- src/features/register-household/api/actions.ts
- src/features/admin-scheduler/api/process-queue.ts

## Tasks

<task type="auto">
  <name>Add declineInvite action + DeclineInviteButton + wire to invite page</name>
  <files>
    src/app/invite/[token]/actions.ts
    src/app/invite/[token]/DeclineInviteButton.tsx
    src/app/invite/[token]/page.tsx
  </files>
  <action>
    **1. Add `declineInvite` to `src/app/invite/[token]/actions.ts`** (after `acceptInvite`):

    ```ts
    export async function declineInvite(token: string) {
        await requireSession();

        const invite = await db.invite.findUnique({ where: { token } });
        if (!invite || invite.status !== 'PENDING') {
            return { error: 'This invite is no longer valid.' };
        }

        await db.invite.update({
            where: { id: invite.id },
            data: { status: 'DECLINED' },
        });

        redirect('/dashboard');
    }
    ```

    **2. Create `src/app/invite/[token]/DeclineInviteButton.tsx`**:

    ```tsx
    'use client';

    import { declineInvite } from './actions';

    export function DeclineInviteButton({ token }: { token: string }) {
        async function handleDecline() {
            const res = await declineInvite(token);
            if (res?.error) alert(res.error);
        }

        return (
            <button
                onClick={handleDecline}
                className="text-white/30 hover:text-white/60 text-sm underline transition-colors mt-4"
            >
                Decline invitation
            </button>
        );
    }
    ```

    **3. Update `src/app/invite/[token]/page.tsx`** — add import and render `DeclineInviteButton` below `AcceptInviteButton`:

    Add import:
    ```tsx
    import { DeclineInviteButton } from './DeclineInviteButton';
    ```

    In the return JSX, replace:
    ```tsx
    <AcceptInviteButton token={token} />
    ```
    With:
    ```tsx
    <AcceptInviteButton token={token} />
    <DeclineInviteButton token={token} />
    ```
  </action>
  <verify>npx tsc --noEmit 2>&1 | head -10</verify>
  <done>No TypeScript errors; declineInvite action, DeclineInviteButton, and invite page all compile.</done>
</task>

<task type="auto">
  <name>Add SEND_JOIN_CONFIRMATION job type and enqueue on accept</name>
  <files>
    src/features/admin-scheduler/api/process-queue.ts
    src/app/invite/[token]/actions.ts
    src/features/register-household/api/actions.ts
  </files>
  <action>
    **1. Add `SEND_JOIN_CONFIRMATION` case to `src/features/admin-scheduler/api/process-queue.ts`** — insert before the `default:` case:

    ```ts
    case 'SEND_JOIN_CONFIRMATION': {
        const html = `<!DOCTYPE html>
<html>
<body style="font-family:Georgia,serif;background:#0f0f0f;color:#f5f0eb;margin:0;padding:32px;">
  <div style="max-width:480px;margin:0 auto;background:#1a1010;border:1px solid #3a2020;border-radius:12px;padding:40px;">
    <h1 style="font-size:24px;color:#f8c4c4;margin:0 0 16px;">🎄 You've joined!</h1>
    <p style="color:#a08080;font-size:15px;margin:0 0 8px;">
      <strong style="color:#f8c4c4;">${payload.householdName}</strong> is now registered for
      <strong style="color:#f8c4c4;">${payload.eventName}</strong>.
    </p>
    <p style="color:#a08080;font-size:14px;margin:0 0 24px;">
      You'll receive your gift assignments by email once matching is complete.
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
    ```

    **2. Update `src/app/invite/[token]/actions.ts`** — in `acceptInvite`, after `db.invite.update(...)` and before `redirect('/dashboard')`, enqueue confirmation for each household email:

    ```ts
    // Send join confirmation to all household emails
    const emails: string[] = JSON.parse(household.emails);
    for (const addr of emails) {
        await db.job.create({
            data: {
                type: 'SEND_JOIN_CONFIRMATION',
                payload: JSON.stringify({
                    email: addr,
                    eventName: invite.event.name,
                    householdName: household.name,
                }),
            },
        });
    }
    ```

    **3. Update `src/features/register-household/api/actions.ts`** — in the auto-accept block, change the `db.invite.findUnique` to include the event (needed for `eventName`):

    Change:
    ```ts
    const invite = await db.invite.findUnique({
        where: { token: pendingToken },
    });
    ```
    To:
    ```ts
    const invite = await db.invite.findUnique({
        where: { token: pendingToken },
        include: { event: true },
    });
    ```

    Then after `db.invite.update(...)` in that same block, enqueue confirmation:
    ```ts
    // Send join confirmation
    const householdEmails: string[] = JSON.parse(newHousehold.emails);
    for (const addr of householdEmails) {
        await db.job.create({
            data: {
                type: 'SEND_JOIN_CONFIRMATION',
                payload: JSON.stringify({
                    email: addr,
                    eventName: invite.event.name,
                    householdName: newHousehold.name,
                }),
            },
        });
    }
    ```

    Note: after adding `include: { event: true }`, TypeScript will know `invite.event` exists — no cast needed.
  </action>
  <verify>npx tsc --noEmit && npm run build 2>&1 | tail -6</verify>
  <done>Build passes; SEND_JOIN_CONFIRMATION handled in process-queue; enqueued from both acceptInvite and registerHousehold auto-accept.</done>
</task>

## Success Criteria
- [ ] `declineInvite(token)` marks invite DECLINED and redirects to dashboard
- [ ] Decline button visible on `/invite/[token]` page alongside Accept button
- [ ] `SEND_JOIN_CONFIRMATION` case handled in process-queue (real + mock)
- [ ] Confirmation email enqueued from `acceptInvite` (direct accept path)
- [ ] Confirmation email enqueued from `registerHousehold` auto-accept (cookie path)
- [ ] `npm run build` passes
