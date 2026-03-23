import Link from 'next/link';

export default function HomePage() {
    return (
        <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#2a1b1b] to-black text-white flex flex-col items-center justify-center p-8">
            <div className="max-w-2xl text-center mb-12">
                <h1 className="text-5xl font-serif font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-rose-100">
                    🎄 Giftr
                </h1>
                <p className="text-lg text-white/60 leading-relaxed mb-8">
                    Organise a private gift exchange for your family. Create an event, invite households, and let the algorithm handle the matching — then everyone gets their assignments by email.
                </p>
                <Link
                    href="/login"
                    className="inline-block bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-600 hover:to-rose-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-red-900/40 transition-all text-base tracking-wide"
                >
                    Get Started →
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
                <FeatureCard
                    title="Invite-only events"
                    description="Create a private exchange and share it with your family. No strangers."
                />
                <FeatureCard
                    title="Fair matching"
                    description="Kids don't give to their own household. The algorithm handles the rest."
                />
                <FeatureCard
                    title="Email assignments"
                    description="Everyone receives their assignments by email when the organiser runs matching."
                />
            </div>
        </main>
    );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
    return (
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="font-semibold text-white/90 mb-1">{title}</h3>
            <p className="text-sm text-white/50 leading-relaxed">{description}</p>
        </div>
    );
}
