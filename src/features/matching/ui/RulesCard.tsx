import { Info } from 'lucide-react';

export function RulesCard() {
    return (
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 max-w-2xl shadow-lg">
            <h3 className="text-lg font-serif font-medium text-blue-200 flex items-center gap-2 mb-4 tracking-wide">
                <Info className="w-5 h-5 text-blue-300" />
                Rules of the Exchange
            </h3>

            <div className="space-y-5 text-blue-100/80 text-sm leading-relaxed">
                <div>
                    <h4 className="font-semibold text-white/90 mb-1">1. Households are the "Givers"</h4>
                    <p>Parents manage the logistics. If you enter 3 kids into the exchange, you will be assigned 3 cousins to buy for.</p>
                </div>

                <div>
                    <h4 className="font-semibold text-white/90 mb-1">2. The "No Self-Match" Guarantee</h4>
                    <p>You will <strong>never</strong> be assigned your own children. The system ensures you are always buying for cousins from different households.</p>
                </div>

                <div>
                    <h4 className="font-semibold text-white/90 mb-1">3. Fairness Formula</h4>
                    <p>The system enforces an exact match: <strong>1 Kid Entered = 1 Gift Bought</strong>. The budget and number of wrapped items are securely fixed by the Admin to ensure every child gets an equal experience.</p>
                </div>
            </div>
        </div>
    );
}
