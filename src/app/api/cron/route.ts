import { processJobQueue } from '@/features/admin-scheduler/api/process-queue';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Basic protection (optional for self-hosted inner loop)
        // return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        console.log('[API/Cron] Manual Trigger...');
        // We only expose queue processing here for safety
        await processJobQueue();
        return NextResponse.json({ success: true, message: 'Queue processed' });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
