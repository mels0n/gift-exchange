import { Household, Kid } from '@prisma/client';
import { MatchingStrategy, MatchResult } from './strategies';

export class CousinExchangeStrategy implements MatchingStrategy {
    match(households: (Household & { kids: Kid[] })[]): MatchResult {
        // 1. Flatten all kids
        const allKids: (Kid & { householdId: string })[] = households.flatMap(h =>
            h.kids.map(k => ({ ...k, householdId: h.id }))
        );

        const matches: MatchResult = [];
        const availableRecipients = new Set(allKids.map(k => k.id));

        // Sort households by # of kids (Greedy: hardest to match first)
        const donors = [...households].sort((a, b) => b.kids.length - a.kids.length);

        for (const donor of donors) {
            const neededMatches = donor.kids.length; // You give exactly as many as you get (User Rule: "Household enters 5 kids -> buys 5 gifts")

            for (let i = 0; i < neededMatches; i++) {
                // Find valid recipient
                // Constraints:
                // 1. Not in own household
                // 2. Not already assigned
                // 3. (Optional) Not a sibling of someone I already picked? (User rule: "Siblings cannot draw each other" -> wait, does that mean within recipient pool?
                // User Rule: "Siblings (kids in the same household) cannot draw each other."
                // --> This implies standard Secret Santa rule: A Kid cannot buy for their Sibling.
                // BUT here, the *Household* is buying.
                // So the rule implies: "Household A cannot buy for Household A's kids." (Self)
                // AND "Household A cannot buy for Household A's other kids?" No.
                // Maybe it means "If Household A picks Kid X, and Household A picks Kid Y, X and Y shouldn't be siblings?"
                // No, usually "Siblings cannot draw each other" applies to individual kid draws.
                // Interpretation for "Household Buying":
                // "A Household cannot draw its own children." (Constraint 1)
                // The Sibling rule likely melts away if Households are the givers. OR it means "Don't match Household A to Household B twice if possible?"
                // User said: "Siblings (kids in the same household) cannot draw each other."
                // Since "Kids" are just recipients, and "Households" are givers, this rule is strictly "Household Constraint" -> "Cannot pick own kids".

                const candidates = allKids.filter(k =>
                    availableRecipients.has(k.id) &&        // Not taken
                    k.householdId !== donor.id              // Not own kid
                );

                if (candidates.length === 0) {
                    throw new Error('Algorithm Deadlock: Unable to find valid match. Retry advised.');
                }

                // Random pick
                const pick = candidates[Math.floor(Math.random() * candidates.length)];

                matches.push({
                    giverHouseId: donor.id,
                    recipientKidId: pick.id
                });
                availableRecipients.delete(pick.id);
            }
        }

        if (availableRecipients.size > 0) {
            throw new Error(`Incomplete Match: ${availableRecipients.size} kids left unmatched.`);
        }

        return matches;
    }
}
