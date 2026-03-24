---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Invite Status List + Remind Action

## Objective
Organizers can see invite status (PENDING / ACCEPTED / DECLINED) per event and resend a reminder to PENDING invitees. The invite list appears inline on each owned event card in the admin page.

## Context
- src/app/admin/page.tsx
- src/app/admin/actions.ts
- prisma/schema.prisma (Invite model)

## Tasks

<task type="auto">
  <name>Add remindInvite server action + RemindButton component</name>
  <files>
    src/app/admin/actions.ts
    src/app/admin/RemindButton.tsx
  </files>
  <action>
    **1. Add to `src/app/admin/actions.ts`** (after `sendInvites`):

    ```ts
    export async function remindInvite(inviteId: string) {
        const { email: organizer } = await requireSession();

        const invite = await db.invite.findUnique({
            where: { id: inviteId },
            include: { event: true },
        });

        if (!invite || invite.status !== 'PENDING') return { error: 'Invite not found or not pending.' };
        if (invite.event.createdByEmail !== organizer) return { error: 'Not authorized.' };

        await db.job.create({
            data: {
                type: 'SEND_INVITE',
                payload: JSON.stringify({
                    email: invite.email,
                    eventId: invite.eventId,
                    eventName: invite.event.name,
                    inviteToken: invite.token,
                }),
            },
        });

        revalidatePath('/admin');
        return { success: true };
    }
    ```

    **2. Create `src/app/admin/RemindButton.tsx`**:

    ```tsx
    'use client';

    import { remindInvite } from './actions';

    export function RemindButton({ inviteId }: { inviteId: string }) {
        async function handleRemind() {
            const res = await remindInvite(inviteId);
            if (res?.error) alert(res.error);
        }

        return (
            <button
                onClick={handleRemind}
                className="text-xs text-yellow-400/70 hover:text-yellow-300 underline transition-colors"
            >
                Remind
            </button>
        );
    }
    ```
  </action>
  <verify>npx tsc --noEmit 2>&1 | head -10</verify>
  <done>No TypeScript errors; remindInvite action and RemindButton file exist.</done>
</task>

<task type="auto">
  <name>Query invites and render status list in admin event cards</name>
  <files>
    src/app/admin/page.tsx
  </files>
  <action>
    **1. Add imports** at the top (after existing imports):
    ```tsx
    import { RemindButton } from './RemindButton';
    ```

    **2. Add invite query** in `AdminPage` after the `myMatches` query:
    ```ts
    const myInvites = myEventIds.length > 0
        ? await db.invite.findMany({
            where: { eventId: { in: myEventIds } },
            orderBy: { createdAt: 'asc' },
          })
        : [];

    const invitesByEvent = myInvites.reduce<Record<string, typeof myInvites>>((acc, inv) => {
        if (!acc[inv.eventId]) acc[inv.eventId] = [];
        acc[inv.eventId].push(inv);
        return acc;
    }, {});
    ```

    **3. Render invite list** inside the event card, immediately after the closing `)}` of `{event.createdByEmail === email && (<InviteForm ... />)}`:

    ```tsx
    {event.createdByEmail === email && invitesByEvent[event.id]?.length > 0 && (
        <div className="mt-4 border-t border-white/5 pt-4 space-y-1">
            <p className="text-xs uppercase tracking-wider text-white/30 mb-2">Invites</p>
            {invitesByEvent[event.id].map(inv => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg px-3 py-1.5 bg-black/20">
                    <span className="text-sm text-white/60">{inv.email}</span>
                    <div className="flex items-center gap-3">
                        <InviteStatusBadge status={inv.status} />
                        {inv.status === 'PENDING' && <RemindButton inviteId={inv.id} />}
                    </div>
                </div>
            ))}
        </div>
    )}
    ```

    **4. Add `InviteStatusBadge` helper** at the bottom of the file (alongside `StatCard` and `StatusBadge`):
    ```tsx
    function InviteStatusBadge({ status }: { status: string }) {
        const styles: Record<string, string> = {
            PENDING: 'bg-yellow-900/50 text-yellow-300',
            ACCEPTED: 'bg-emerald-900/50 text-emerald-300',
            DECLINED: 'bg-red-900/50 text-red-300',
        };
        return (
            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${styles[status] ?? 'bg-zinc-700/50 text-zinc-300'}`}>
                {status}
            </span>
        );
    }
    ```
  </action>
  <verify>npx tsc --noEmit && npm run build 2>&1 | tail -6</verify>
  <done>Build passes; admin page renders invite list with PENDING/ACCEPTED/DECLINED badges and Remind button for PENDING invites.</done>
</task>

## Success Criteria
- [ ] `remindInvite(inviteId)` re-enqueues a `SEND_INVITE` job; only works for PENDING invites belonging to organizer's events
- [ ] Admin event cards show invite list with email + status badge for organizer's events
- [ ] Remind button visible only for PENDING invites
- [ ] `npm run build` passes
