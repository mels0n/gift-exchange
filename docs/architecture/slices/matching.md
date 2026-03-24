# Matching Slice Architecture 🎁

The Matching slice is the core engine of the Gift Exchange application. It handles the assignment of "Giver Households" to "Recipient Kids" based on specific rules and strategies.

## 🧠 Core Concept: "The Cousin Exchange"

Unlike a traditional Secret Santa where an individual buys for another individual, this system uses a **Household-to-Kid** model:
- **Givers**: Households (e.g., "The Smiths").
- **Recipients**: Individual Kids (e.g., "Alice Smith").
- **Rule**: A household buys one gift for each kid they have entered into the exchange. If The Smiths entered 3 kids, they buy 3 gifts for 3 other kids in the exchange.

## 🛠️ Matching Algorithm

The system is designed to be extensible via the `MatchingStrategy` interface.

### `CousinExchangeStrategy` (Default)
The default algorithm uses a **Greedy Shuffled Selection** approach:

1. **Flattening**: All participating kids across all households are gathered into a single pool.
2. **Sorting**: Households are sorted by the number of participating kids (largest households first). This ensures the most difficult-to-match households are handled while the recipient pool is at its largest.
3. **Constraints**:
    - **No Self-Matching**: A household cannot draw its own kids.
    - **Uniqueness**: Each kid is assigned exactly one giver household.
4. **Randomization**: For each required match, the algorithm filters all available kids who meet the constraints and picks one at random.

### 🧪 Deadlock Handling
In small exchanges or those with one very large family, a "Deadlock" can occur where the only remaining available kids belong to the current giver household.
- **Current Solution**: The algorithm throws an error, and the admin is advised to retry (which triggers a fresh shuffle).
- **Future Improvement**: Backtracking or pre-matching logic for edge cases.

## 🧱 Extensibility

New algorithms (e.g., "Traditional Secret Santa", "Price-Bracketed Exchange") can be added by implementing the `MatchingStrategy` interface in `src/features/matching/algo/strategies.ts`.

```typescript
export interface MatchingStrategy {
  match(households: (Household & { kids: Kid[] })[]): MatchResult;
}
```

## 📂 File Structure
- `api/actions.ts`: Triggers the matching process and persists results to the `Match` table.
- `algo/`: Contains the pure logic for different matching strategies.
- `ui/`: Components for showing the status of the matching process to admins.
