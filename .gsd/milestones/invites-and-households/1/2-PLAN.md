---
phase: 1
plan: 2
wave: 2
---

# Plan 1.2: Invite Form UI + SEND_INVITE Email Handler

## Objective
Surface the invite form in the admin event list (for events the user created) and implement the SEND_INVITE job handler so the invite email is actually sent.

## Context
- src/app/admin/page.tsx
- src/app/admin/actions.ts (sendInvites — created in Plan 1.1)
- src/features/admin-scheduler/api/process-queue.ts

## Tasks

<task type="auto">
  <name>Add InviteForm client component and wire into admin page</name>
  <files>
    src/app/admin/InviteForm.tsx
    src/app/admin/page.tsx
  </files>
  <action>
    **Create `src/app/admin/InviteForm.tsx`:**

    ```tsx
    'use client';

    import { sendInvites } from './actions';

    export function InviteForm({ eventId }: { eventId: string }) {
        async function handleSubmit(formData: FormData) {
            const res = await sendInvites(formData);
            if (res?.error) alert(res.error);
            else if (res?.success) alert(`${res.sent} invite${res.sent !== 1 ? 's' : ''} sent.`);
        }

        return (
            <form action={handleSubmit} className="mt-3 flex gap-2">
                <input type="hidden" name="eventId" value={eventId} />
                <input
                    type="text"
                    name="emails"
                    placeholder="email@example.com, another@example.com"
                    required
                    className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                />
                <button
                    type="submit"
                    className="bg-white/10 hover:bg-white/20 text-white/80 text-xs font-medium px-4 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                >
                    Send Invites
                </button>
            </form>
        );
    }
    ```

    **Update `src/app/admin/page.tsx`:**

    1. Import `InviteForm` at the top:
       ```tsx
       import { InviteForm } from './InviteForm';
       ```

    2. In the events list, inside the event card `<div>`, add the invite form below the existing content for events owned by the current user. Replace the existing event card `<div key={event.id} ...>` inner content to include it:

       After the existing `<div className="flex items-center gap-3">` close tag (the one with StatusBadge + RunMatchingButton), add:
       ```tsx
       {event.createdByEmail === email && (
           <InviteForm eventId={event.id} />
       )}
       ```
       Place it inside the outer card div but after the flex row, making the card `flex-col` instead of `flex` by changing `className="flex items-center justify-between ...` to `className="bg-black/20 border border-white/5 rounded-xl p-4"` and wrapping the existing row in a `<div className="flex items-center justify-between">`.

       In other words, refactor the event card inner structure to:
       ```tsx
       <div key={event.id} className="bg-black/20 border border-white/5 rounded-xl p-4">
           <div className="flex items-center justify-between">
               <div>
                   <p className="font-semibold text-white/90">{event.name}</p>
                   <p className="text-xs text-white/40 mt-0.5">
                       {event._count.participations} households · {event._count.matches} matches · ${event.budget}/kid · {event.items} items
                   </p>
                   <p className="text-xs text-white/30 mt-0.5">by {event.createdByEmail || 'unknown'}</p>
               </div>
               <div className="flex items-center gap-3">
                   <StatusBadge status={event.status} />
                   {event.status === 'OPEN' && event.createdByEmail === email && (
                       <RunMatchingButton eventId={event.id} />
                   )}
               </div>
           </div>
           {event.createdByEmail === email && (
               <InviteForm eventId={event.id} />
           )}
       </div>
       ```
  </action>
  <verify>npx tsc --noEmit 2>&1 | head -10</verify>
  <done>No TypeScript errors; InviteForm.tsx created; admin page imports and renders it for owned events.</done>
</task>

<task type="auto">
  <name>Add SEND_INVITE case to process-queue</name>
  <files>
    src/features/admin-scheduler/api/process-queue.ts
  </files>
  <action>
    In `src/features/admin-scheduler/api/process-queue.ts`, add a `SEND_INVITE` case to the `switch` statement in `processSingleJob`, before the `default` case.

    Payload shape: `{ email, eventId, eventName, inviteToken }`

    ```ts
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
    ```

    Insert this case between the `SEND_MATCH` closing brace and the `default` case.
  </action>
  <verify>npx tsc --noEmit && npm run build 2>&1 | tail -8</verify>
  <done>Build passes; SEND_INVITE case exists in process-queue.ts switch statement.</done>
</task>

## Success Criteria
- [ ] `InviteForm.tsx` created as a client component
- [ ] Admin page shows invite form below each event the current user created
- [ ] `SEND_INVITE` job handler sends invite email (or mocks to console)
- [ ] `npm run build` passes with no type errors
