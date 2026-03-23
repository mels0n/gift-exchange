'use client';

import { sendInvites } from './actions';

export function InviteForm({ eventId }: { eventId: string }) {
    async function handleSubmit(formData: FormData) {
        const res = await sendInvites(formData);
        if (res?.error) alert(res.error);
        else if (res?.success) alert(`${res.sent} invite${res.sent !== 1 ? 's' : ''} sent.`);
    }

    return (
        <form action={handleSubmit} className="mt-3 flex gap-2">
            <input type="hidden" name="eventId" value={eventId} />
            <input
                type="text"
                name="emails"
                placeholder="email@example.com, another@example.com"
                required
                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
            />
            <button
                type="submit"
                className="bg-white/10 hover:bg-white/20 text-white/80 text-xs font-medium px-4 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
                Send Invites
            </button>
        </form>
    );
}
