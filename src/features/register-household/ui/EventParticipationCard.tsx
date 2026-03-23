'use client';

import { joinEvent } from '../api/actions';
import type { Event, Kid, Participation } from '@prisma/client';
import { Calendar, CheckCircle2, Users } from 'lucide-react';
import Link from 'next/link';

type EventWithParticipation = {
    event: Event;
    participation: Participation | null;
};

type Props = {
    events: EventWithParticipation[];
    kids: Kid[];
};

export function EventParticipationCard({ events, kids }: Props) {
    if (events.length === 0) {
        return (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
                <h2 className="text-xl font-serif text-white/90 mb-3">Exchange Events</h2>
                <p className="text-white/40 text-sm italic">No active events right now. Check back later!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {events.map(({ event, participation }) => (
                <EventCard key={event.id} event={event} participation={participation} kids={kids} />
            ))}
        </div>
    );
}

function EventCard({
    event,
    participation,
    kids,
}: {
    event: Event;
    participation: Participation | null;
    kids: Kid[];
}) {
    const deadline = new Date(event.regDeadline).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
    });

    if (event.status === 'MATCHED') {
        return (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
                <h2 className="text-xl font-serif text-white/90 mb-4">{event.name}</h2>
                <div className="p-4 bg-emerald-900/30 border border-emerald-500/20 text-emerald-200 rounded-xl flex items-center gap-3 mb-4">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span className="font-medium">Matching complete! Your assignments are ready.</span>
                </div>
                <Link
                    href={`/reveal/${event.id}`}
                    className="inline-block bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-600 hover:to-rose-700 text-white px-6 py-2 rounded-xl text-sm font-medium shadow-lg transition-all"
                >
                    View My Assignments →
                </Link>
            </div>
        );
    }

    if (participation) {
        const kidIds: string[] = JSON.parse(participation.participatingKidIds);
        const participatingKids = kids.filter(k => kidIds.includes(k.id));
        return (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
                <h2 className="text-xl font-serif text-white/90 mb-4">{event.name}</h2>
                <div className="p-4 bg-emerald-900/30 border border-emerald-500/20 text-emerald-200 rounded-xl flex items-center gap-3 mb-4">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span className="font-medium">You&apos;re in! Waiting for the organizer to run matching.</span>
                </div>
                <p className="text-xs uppercase tracking-wider text-white/40 font-semibold mb-3">Participating Kids</p>
                <div className="flex flex-wrap gap-2 mb-4">
                    {participatingKids.map(k => (
                        <span key={k.id} className="bg-black/20 border border-white/5 px-3 py-1 rounded-full text-sm text-white/80">
                            {k.name}
                        </span>
                    ))}
                </div>
                <p className="text-xs text-white/30 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Registration closes {deadline}
                </p>
            </div>
        );
    }

    async function handleJoin(formData: FormData) {
        const res = await joinEvent(formData);
        if (res?.error) alert(res.error);
    }

    return (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
            <h2 className="text-xl font-serif text-white/90 mb-1">{event.name}</h2>
            <p className="text-sm text-white/50 mb-6 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Registration closes {deadline} · ${event.budget}/kid · {event.items} items
            </p>
            <form action={handleJoin} className="space-y-4">
                <input type="hidden" name="eventId" value={event.id} />
                <fieldset>
                    <legend className="text-xs uppercase tracking-wider text-white/40 font-semibold mb-3 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> Select kids to enter
                    </legend>
                    <div className="space-y-2">
                        {kids.map(k => (
                            <label
                                key={k.id}
                                className="flex items-center gap-3 p-3 bg-black/20 border border-white/5 rounded-xl cursor-pointer hover:bg-white/5 transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    name="kidId"
                                    value={k.id}
                                    className="w-4 h-4 accent-red-500"
                                />
                                <span className="text-white/90 font-medium">{k.name}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>
                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-600 hover:to-rose-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-red-900/40 transition-all text-sm tracking-wide"
                >
                    Join the Exchange
                </button>
            </form>
        </div>
    );
}
