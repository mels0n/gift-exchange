'use client';

import { declineInvite } from './actions';

export function DeclineInviteButton({ token }: { token: string }) {
    async function handleDecline() {
        const res = await declineInvite(token);
        if (res?.error) alert(res.error);
    }

    return (
        <button
            onClick={handleDecline}
            className="text-white/30 hover:text-white/60 text-sm underline transition-colors mt-4"
        >
            Decline invitation
        </button>
    );
}
