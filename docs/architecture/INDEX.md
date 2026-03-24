# Architecture Documentation

This section covers the technical design and internal workings of the Gift Exchange application.

## 🧩 Feature Slices
We follow the **Feature-Slice Design (FSD)** pattern. Each major feature is documented as a standalone "slice":

- [**Auth**](./slices/auth.md) — Passwordless OTP flow.
- [**Registration**](./slices/registration.md) — Household and list management.
- [**Matching**](./slices/matching.md) — "Cousin Exchange" logic.
- [**Match Reveal**](./slices/match-reveal.md) — Assignee display logic.
- [**Admin**](./slices/admin.md) — System management.
- [**Scheduler**](./slices/scheduler.md) — Job queue processing.

## 🛠️ Shared Layer
- [Prisma Schema](../../prisma/schema.prisma)
- [Scheduler Client](../../src/shared/lib/scheduler.ts)
