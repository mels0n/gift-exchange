---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Landing Page

## Objective
Replace the default Next.js homepage with a real landing page that matches the app's dark/red aesthetic, explains what the app is, and drives users to log in.

## Context
- src/app/page.tsx
- src/app/layout.tsx
- src/app/login/page.tsx (reference for styling conventions)

## Tasks

<task type="auto">
  <name>Replace home page with real landing page</name>
  <files>
    src/app/page.tsx
  </files>
  <action>
    Completely replace `src/app/page.tsx` with a landing page matching the app's existing aesthetic (dark background, red/rose gradient text, backdrop-blur cards). Do NOT import or use the Next.js `Image` component from next.svg/vercel.svg.

    The page should be a server component (no `'use client'`). Use `Link` from `next/link`.

    Structure:
    ```tsx
    import Link from 'next/link';

    export default function HomePage() {
        return (
            <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#2a1b1b] to-black text-white flex flex-col items-center justify-center p-8">
                {/* Hero */}
                <div className="max-w-2xl text-center mb-12">
                    <h1 className="text-5xl font-serif font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-rose-100">
                        🎄 Family Gift Exchange
                    </h1>
                    <p className="text-lg text-white/60 leading-relaxed mb-8">
                        Organise a private gift exchange for your family. Create an event, invite households, and let the algorithm handle the matching — then everyone gets their assignments by email.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-600 hover:to-rose-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-red-900/40 transition-all text-base tracking-wide"
                    >
                        Get Started →
                    </Link>
                </div>

                {/* Feature highlights — 3 cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
                    <FeatureCard
                        title="Invite-only events"
                        description="Create a private exchange and share it with your family. No strangers."
                    />
                    <FeatureCard
                        title="Fair matching"
                        description="Kids don't give to their own household. The algorithm handles the rest."
                    />
                    <FeatureCard
                        title="Email assignments"
                        description="Everyone receives their assignments by email when the organiser runs matching."
                    />
                </div>
            </main>
        );
    }

    function FeatureCard({ title, description }: { title: string; description: string }) {
        return (
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="font-semibold text-white/90 mb-1">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{description}</p>
            </div>
        );
    }
    ```

    Adjust copy or layout as needed but keep the structure: hero + 3 feature cards + single CTA to /login.
  </action>
  <verify>npx tsc --noEmit 2>&1 | head -5</verify>
  <done>No TypeScript errors; src/app/page.tsx no longer references next.svg or vercel.svg.</done>
</task>

<task type="auto">
  <name>Update layout metadata</name>
  <files>
    src/app/layout.tsx
  </files>
  <action>
    In `src/app/layout.tsx`, update the `metadata` export:

    ```ts
    export const metadata: Metadata = {
        title: 'Family Gift Exchange',
        description: 'A private gift exchange organiser for families. Create events, invite households, and let the algorithm handle the matching.',
    };
    ```

    Do NOT change anything else in layout.tsx.
  </action>
  <verify>grep -n "Family Gift Exchange" src/app/layout.tsx</verify>
  <done>layout.tsx has updated title and description; no other changes.</done>
</task>

## Success Criteria
- [ ] `/` renders a real landing page — no next.svg, no "To get started, edit page.tsx"
- [ ] Page matches dark/red aesthetic of the rest of the app
- [ ] CTA button links to `/login`
- [ ] `<title>` is "Family Gift Exchange"
- [ ] `npm run build` passes
