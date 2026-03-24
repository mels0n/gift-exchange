# Scheduler Slice Architecture 🕰️

The Scheduler is a critical background service that ensures reliable delivery of time-sensitive tasks, such as emails and matching notifications.

## 🏗️ The Job Queue Model

Instead of sending emails or performing heavy calculations synchronously during a web request, the application uses an **Asynchronous Job Queue**:

1. **Producer**: Any feature (e.g., Auth, Registration) can create a record in the `Job` table with a specific `type` and a JSON `payload`.
2. **Persistence**: Jobs are stored in SQLite, ensuring they are not lost if the server restarts.
3. **Consumer**: The `processJobQueue` function (in `src/features/admin-scheduler/api/process-queue.ts`) periodically polls the database for `PENDING` jobs.

## 🔄 Execution Logic

- **Polling**: The consumer fetches up to 10 pending jobs at a time.
- **Retry Policy**: Each job is allowed up to 3 attempts. If a job fails (e.g., due to a temporary network issue with the Resend API), its `attempts` counter is incremented, and the status remains `PENDING` for the next pass.
- **Failure State**: After 3 failed attempts, the job is marked as `FAILED` and requires manual admin intervention.

## 📅 Cron Integration

The scheduler is initialized using `node-cron` in `src/shared/lib/scheduler.ts`.

- **Interval**: By default, it runs the queue processor every minute (`* * * * *`).
- **Instrumentation**: Hooks are provided to monitor the "pulse" of the scheduler from the admin dashboard.

## 📧 Email Templates

Email HTML is generated programmatically within the `processSingleJob` function, utilizing responsive tables and festive styling (inline CSS for maximum client compatibility).

## 📂 File Structure
- `src/shared/lib/scheduler.ts`: Initialization and cron setup.
- `src/features/admin-scheduler/api/process-queue.ts`: Core processing logic and email handlers.
