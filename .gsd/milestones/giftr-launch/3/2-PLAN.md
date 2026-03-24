---
phase: 3
plan: 2
wave: 1
---

# Plan 3.2: Inline Error Feedback (Replace alert())

## Objective
Every `alert(res.error)` call is replaced with inline React state that renders a red error message below the relevant form or button. No browser dialogs. Consistent pattern across all six components.

**Pattern used throughout:** Add `const [error, setError] = useState<string | null>(null);`, set it on failure, render `{error && <p className="text-red-400 text-xs mt-2">{error}</p>}` near the triggering element.

## Context
- src/app/admin/CreateEventForm.tsx
- src/app/admin/RunMatchingButton.tsx
- src/app/admin/InviteForm.tsx
- src/app/admin/RemindButton.tsx (created in Phase 2)
- src/features/register-household/ui/HouseholdRegistrationForm.tsx
- src/app/invite/[token]/AcceptInviteButton.tsx
- src/app/invite/[token]/DeclineInviteButton.tsx (created in Phase 2)

## Tasks

<task type="auto">
  <name>Fix inline errors in admin components</name>
  <files>
    src/app/admin/CreateEventForm.tsx
    src/app/admin/RunMatchingButton.tsx
    src/app/admin/InviteForm.tsx
    src/app/admin/RemindButton.tsx
  </files>
  <action>
    **`src/app/admin/CreateEventForm.tsx`** — add `useState` import, add error state, replace alert:

    Add `import { useState } from 'react';` at top.

    Inside `CreateEventForm`, add: `const [error, setError] = useState<string | null>(null);`

    Change handler:
    ```ts
    async function handleSubmit(formData: FormData) {
        const res = await createEvent(formData);
        if (res?.error) { setError(res.error); return; }
        setError(null);
    }
    ```

    Add error message inside the form, just before the closing `</form>` tag (after the submit button div):
    ```tsx
    {error && <p className="col-span-2 text-red-400 text-xs mt-1">{error}</p>}
    ```

    ---

    **`src/app/admin/RunMatchingButton.tsx`** — add `useState`, add error state, replace alert. The component renders a single button; wrap it in a fragment to include error text:

    Add `import { useState } from 'react';` at top.

    Inside `RunMatchingButton`, add: `const [error, setError] = useState<string | null>(null);`

    Change handler:
    ```ts
    async function handleClick() {
        const res = await runMatching(eventId);
        if (res?.error) setError(res.error);
        else setError(null);
    }
    ```

    Change return to wrap in a fragment:
    ```tsx
    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                className="bg-gradient-to-r from-emerald-700 to-green-800 hover:from-emerald-600 hover:to-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium shadow-lg transition-all"
            >
                Run Matching
            </button>
            {error && <p className="text-red-400 text-xs mt-1 text-right">{error}</p>}
        </>
    );
    ```

    ---

    **`src/app/admin/InviteForm.tsx`** — add `useState`, replace both alert calls with inline state:

    Add `import { useState } from 'react';` at top.

    Inside `InviteForm`, add:
    ```ts
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    ```

    Change handler:
    ```ts
    async function handleSubmit(formData: FormData) {
        const res = await sendInvites(formData);
        if (res?.error) { setError(res.error); setMessage(null); }
        else if (res?.success) { setMessage(`${res.sent} invite${res.sent !== 1 ? 's' : ''} sent.`); setError(null); }
    }
    ```

    Add feedback below the form (after the closing `</form>` tag):
    ```tsx
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    {message && <p className="text-emerald-400 text-xs mt-1">{message}</p>}
    ```

    ---

    **`src/app/admin/RemindButton.tsx`** — add `useState`, replace alert:

    Add `import { useState } from 'react';` at top.

    Inside `RemindButton`, add: `const [error, setError] = useState<string | null>(null);`

    Change handler:
    ```ts
    async function handleRemind() {
        const res = await remindInvite(inviteId);
        if (res?.error) setError(res.error);
        else setError(null);
    }
    ```

    Change return to wrap in a fragment with error:
    ```tsx
    return (
        <>
            <button onClick={handleRemind} className="text-xs text-yellow-400/70 hover:text-yellow-300 underline transition-colors">
                Remind
            </button>
            {error && <span className="text-red-400 text-xs ml-1">{error}</span>}
        </>
    );
    ```
  </action>
  <verify>npx tsc --noEmit 2>&1 | head -10</verify>
  <done>No TypeScript errors; all four admin components use useState for errors instead of alert().</done>
</task>

<task type="auto">
  <name>Fix inline errors in registration and invite components</name>
  <files>
    src/features/register-household/ui/HouseholdRegistrationForm.tsx
    src/app/invite/[token]/AcceptInviteButton.tsx
    src/app/invite/[token]/DeclineInviteButton.tsx
  </files>
  <action>
    **`src/features/register-household/ui/HouseholdRegistrationForm.tsx`** — already has `useState` imported and used for kids. Just add error state:

    Inside `HouseholdRegistrationForm`, add alongside the kids state:
    ```ts
    const [error, setError] = useState<string | null>(null);
    ```

    Change handler:
    ```ts
    async function handleSubmit(formData: FormData) {
        const res = await registerHousehold(formData);
        if (res?.error) setError(res.error);
    }
    ```

    Add error display inside the last `<div className="border-t border-white/10 pt-6">` block, between the submit button and the closing `</div>`:
    ```tsx
    {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}
    ```

    ---

    **`src/app/invite/[token]/AcceptInviteButton.tsx`** — add `useState`, replace alert:

    Add `import { useState } from 'react';` at top.

    Inside `AcceptInviteButton`, add: `const [error, setError] = useState<string | null>(null);`

    Change handler:
    ```ts
    async function handleAccept() {
        const res = await acceptInvite(token);
        if (res?.error) setError(res.error);
    }
    ```

    Change return to wrap in a fragment:
    ```tsx
    return (
        <>
            <button
                onClick={handleAccept}
                className="bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-600 hover:to-rose-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-red-900/40 transition-all text-base"
            >
                Accept Invitation →
            </button>
            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        </>
    );
    ```

    ---

    **`src/app/invite/[token]/DeclineInviteButton.tsx`** — add `useState`, replace alert:

    Add `import { useState } from 'react';` at top.

    Inside `DeclineInviteButton`, add: `const [error, setError] = useState<string | null>(null);`

    Change handler:
    ```ts
    async function handleDecline() {
        const res = await declineInvite(token);
        if (res?.error) setError(res.error);
    }
    ```

    Change return to wrap in a fragment:
    ```tsx
    return (
        <>
            <button
                onClick={handleDecline}
                className="text-white/30 hover:text-white/60 text-sm underline transition-colors mt-4"
            >
                Decline invitation
            </button>
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </>
    );
    ```
  </action>
  <verify>npx tsc --noEmit && npm run build 2>&1 | tail -6</verify>
  <done>Build passes; no alert() calls remain in any client component; all errors shown inline.</done>
</task>

## Success Criteria
- [ ] Zero `alert(` calls in any client component
- [ ] `CreateEventForm` shows error inline below submit button
- [ ] `RunMatchingButton` shows error inline below button
- [ ] `InviteForm` shows error/success inline below form
- [ ] `RemindButton` shows error inline beside button
- [ ] `HouseholdRegistrationForm` shows error inline below submit button
- [ ] `AcceptInviteButton` shows error inline below button
- [ ] `DeclineInviteButton` shows error inline below button
- [ ] `npm run build` passes
