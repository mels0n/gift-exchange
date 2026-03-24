import { Household, Kid } from '@prisma/client';
import { MatchingStrategy, MatchResult } from './strategies';

export class SecretSantaStrategy implements MatchingStrategy {
    match(households: (Household & { kids: Kid[] })[]): MatchResult {
        if (households.length < 2) {
            throw new Error('Need at least 2 households for Secret Santa.');
        }

        // Sattolo algorithm — produces a single-cycle permutation (guaranteed derangement)
        // Each element ends up at a position that is NOT its original position
        const order = [...households];
        for (let i = order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * i); // j in [0, i-1], ensures no fixed points
            [order[i], order[j]] = [order[j], order[i]];
        }

        // households[i] gives to all of order[i]'s kids
        const matches: MatchResult = [];
        for (let i = 0; i < households.length; i++) {
            const giver = households[i];
            const recipient = order[i];
            for (const kid of recipient.kids) {
                matches.push({ giverHouseId: giver.id, recipientKidId: kid.id });
            }
        }

        return matches;
    }
}
