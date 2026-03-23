import { Household, Kid } from '@prisma/client';

export type MatchResult = {
    giverHouseId: string;
    recipientKidId: string;
}[];

export interface MatchingStrategy {
    /**
     * Run the matching algorithm
     * @param households List of all participating households with their kids
     */
    match(households: (Household & { kids: Kid[] })[]): MatchResult;
}
