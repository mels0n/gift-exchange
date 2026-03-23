'use client';

import { remindInvite } from './actions';

export function RemindButton({ inviteId }: { inviteId: string }) {
    async function handleRemind() {
        const res = await remindInvite(inviteId);
        if (res?.error) alert(res.error);
    }

    return (
        <button
            onClick={handleRemind}
            className="text-xs text-yellow-400/70 hover:text-yellow-300 underline transition-colors"
        >
            Remind
        </button>
    );
}
