/**
 * Singleton Scheduler for Background Jobs
 */
import cron from 'node-cron';
import { processJobQueue } from '@/features/admin-scheduler/api/process-queue';

let isRunning = false;

export function startScheduler() {
    if (isRunning) {
        return;
    }

    console.log('[Scheduler] Starting daily cron job...');
    isRunning = true;

    // Run at 00:00 every day
    cron.schedule('0 0 * * *', async () => {
        console.log('[Scheduler] Running Daily Trigger...');
        try {
            // 1. Check Deadlines
            // 2. Send Notifications
            // 3. Process Job Queue
            await processDailyTasks();
        } catch (err) {
            console.error('[Scheduler] Failed:', err);
        }
    });
}

async function processDailyTasks() {
    console.log('[Scheduler] Daily Tick started.');

    // 1. Process Queue (Emails)
    await processJobQueue();

    console.log('[Scheduler] Daily Tick done.');
}
