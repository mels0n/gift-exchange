---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: DOB Field in Registration Form

## Objective
Add date-of-birth collection to the household registration flow. `Kid.dob` already exists in the schema as `DateTime?` but is never written. This plan wires it up: add a DOB input to `HouseholdRegistrationForm`, update `registerHousehold` to save it, and show DOB on the dashboard kid card.

## Context
- prisma/schema.prisma — Kid.dob field (DateTime?)
- src/features/register-household/ui/HouseholdRegistrationForm.tsx — kid row UI
- src/features/register-household/api/actions.ts — registerHousehold action
- src/app/dashboard/page.tsx — kid card display

## Tasks

<task type="auto">
  <name>Add DOB input to HouseholdRegistrationForm</name>
  <files>src/features/register-household/ui/HouseholdRegistrationForm.tsx</files>
  <action>
    In the kid row (currently just a single `kidName` input + trash button), add a DOB date input after the name input.

    Change the kid row from:
    ```tsx
    <div key={k} className="flex gap-3 items-center">
        <input name="kidName" ... />
        {kids.length > 1 && <button ...>}
    </div>
    ```

    To:
    ```tsx
    <div key={k} className="flex gap-3 items-center">
        <input
            name="kidName"
            placeholder={`Child ${i + 1} Name`}
            className="flex-1 p-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
            required
        />
        <input
            name="kidDob"
            type="date"
            className="p-3 bg-black/20 border border-white/10 rounded-xl text-white/70 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all w-40"
        />
        {kids.length > 1 && (
            <button type="button" onClick={() => removeKid(i)} className="text-red-400 hover:text-red-300 p-2 transition-colors">
                <Trash2 size={20} />
            </button>
        )}
    </div>
    ```

    DOB is NOT required (the field is optional in schema). Do not add `required` to the date input.

    No other changes to the form.
  </action>
  <verify>npx tsc --noEmit 2>&1 | head -10</verify>
  <done>Registration form renders a date input named "kidDob" alongside each kid name input. No TypeScript errors.</done>
</task>

<task type="auto">
  <name>Save DOB in registerHousehold action + show on dashboard</name>
  <files>
    src/features/register-household/api/actions.ts
    src/app/dashboard/page.tsx
  </files>
  <action>
    **1. Update `registerHousehold` in `src/features/register-household/api/actions.ts`:**

    After `const kidNames = formData.getAll('kidName') as string[];`, add:
    ```ts
    const kidDobs = formData.getAll('kidDob') as string[];
    ```

    Then change the `kids.create` block from:
    ```ts
    create: kidNames.filter(k => k.trim()).map(k => ({ name: k.trim() })),
    ```
    To:
    ```ts
    create: kidNames
        .map((name, i) => ({ name: name.trim(), dob: kidDobs[i] ? new Date(kidDobs[i]) : null }))
        .filter(k => k.name.length > 0),
    ```

    **2. Show DOB on kid card in `src/app/dashboard/page.tsx`:**

    In the kid card (currently shows only `{kid.name}`), add DOB below the name if present:
    ```tsx
    <div key={kid.id} className="bg-black/20 border border-white/5 rounded-xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-xs font-bold shadow-lg">
            {kid.name.charAt(0)}
        </div>
        <div>
            <span className="text-lg font-medium text-white/90">{kid.name}</span>
            {kid.dob && (
                <p className="text-xs text-white/40 mt-0.5">
                    b. {new Date(kid.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
            )}
        </div>
    </div>
    ```

    No other changes.
  </action>
  <verify>npm run build 2>&1 | tail -8</verify>
  <done>
    - registerHousehold saves dob when provided (null when not)
    - Dashboard kid card shows formatted DOB when kid.dob is set
    - npm run build passes with no type errors
  </done>
</task>

## Success Criteria
- [ ] Registration form shows a date input per kid (not required)
- [ ] `registerHousehold` saves dob to Kid record (null if blank)
- [ ] Dashboard kid card shows DOB when present
- [ ] `npm run build` passes
