# Admin Slice Architecture 🛠️

The Admin slice provides the internal tools necessary to manage the gift exchange events and monitor the system.

## 🖥️ Administrative Controls

Managed within `src/features/admin-scheduler`, the administrative interface allows for:

- **Event Lifecycle Management**: Creating events, moving them from `DRAFT` to `OPEN`, and eventually `LOCKED` for matching.
- **Manual Overrides**: Admins can force-trigger the matching algorithm or the job queue processor if needed.
- **Invitations**: Sending out event-specific invite tokens to potential participants.

## 📊 System Stats

The admin dashboard aggregates data from across the system to provide a high-level overview:
- Total participating households and kids.
- Status of the background job queue (Pending vs. Completed).
- Enrollment progress against deadlines.

## 🔒 Security Posture

> [!WARNING]
> In its current self-hosted iteration, the Admin slice does not implement a formal Authorization (RBAC) layer.

- **Current State**: Any user who can bypass the login/OTP (or is simply logged in) may have access to administrative routes if exposed.
- **Recommendation**: For public-facing instances, it is highly recommended to wrap the `/admin` routes with a custom middleware check against a hardcoded list of `ADMIN_EMAILS` in the `.env` file.

## 📂 File Structure
- `api/process-queue.ts`: Logic for handling the background worker.
- `ui/`: Components for the administrative dashboard and job monitoring table.
