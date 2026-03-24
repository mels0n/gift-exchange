---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Admin Page Rename + Stat Card Removal

## Objective
Rename the "Admin Operations" heading to "My Events" and remove the three global stat cards (Households, Events, Pending Jobs). These stats are noise for organizers who only care about their own events. Also remove the dead queries that fed them.

## Context
- src/app/admin/page.tsx

## Tasks

<task type="auto">
  <name>Rename heading and remove stat cards</name>
  <files>
    src/app/admin/page.tsx
  </files>
  <action>
    In `AdminPage`:

    **1. Remove three stat queries** — delete these lines entirely:
    ```ts
    const houseCount = await db.household.count();
    const jobsPending = await db.job.count({ where: { status: 'PENDING' } });
    ```
    Also remove the `events.length` reference used only by stat cards (it stays available for other uses — the `events` query itself stays).

    **2. Remove the stat card grid** — delete this entire block:
    ```tsx
    <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard title="Households" value={houseCount} />
        <StatCard title="Events" value={events.length} />
        <StatCard title="Pending Jobs" value={jobsPending} />
    </div>
    ```

    **3. Rename the heading** — change:
    ```tsx
    <h1 className="text-3xl font-serif font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-rose-100">Admin Operations</h1>
    ```
    To:
    ```tsx
    <h1 className="text-3xl font-serif font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-rose-100">My Events</h1>
    ```

    **4. Remove the `StatCard` component** at the bottom of the file — delete the entire function:
    ```tsx
    function StatCard({ title, value }: { title: string; value: number }) {
        return (
            <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-xl">
                <h3 className="text-white/60 font-medium uppercase tracking-wider text-xs">{title}</h3>
                <p className="text-4xl font-bold text-white mt-1">{value}</p>
            </div>
        );
    }
    ```
  </action>
  <verify>npx tsc --noEmit && npm run build 2>&1 | tail -6</verify>
  <done>Build passes; admin page heading reads "My Events"; no stat card grid rendered; StatCard function deleted; no TypeScript errors from removed variables.</done>
</task>

## Success Criteria
- [ ] Admin page heading is "My Events" (not "Admin Operations")
- [ ] Stat card grid (Households / Events / Pending Jobs) is gone
- [ ] `houseCount` and `jobsPending` queries removed
- [ ] `StatCard` function removed
- [ ] `npm run build` passes
