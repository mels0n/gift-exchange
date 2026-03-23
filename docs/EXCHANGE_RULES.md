# Exchange Rules & Strategies 📜

This project supports multiple "strategies" for gift exchanges. Currently, the **Cousin Exchange** strategy is implemented.

## 1. The "Cousin Exchange" Strategy
**Best for**: Large families where siblings shouldn't buy for each other, and parents act as the "Buyer" for their household.

### How it Works
1.  **Households as Givers**: Unlike Secret Santa where *individuals* draw names, here the **Household** draws names.
    *   *Example*: If "The Smith Family" enters 3 kids, The Smith Family (Parents) is responsible for buying **3 gifts**.
2.  **Explicit Math**:
    *   **Input**: Number of participating kids.
    *   **Output**: Number of gifts to buy.
    *   *Rule*: `Input Count == Output Count`. You never buy more than you bring.

### The Algorithm
The system uses a **Greedy Constraint Solver** with the following priority:
1.  **Weighted Sorting**: Households with the *most* kids are matched first. This prevents the "last one left" problem where the largest family has no valid recipients left.
2.  **Constraints**:
    *   **No Self-Matching**: A Household can NEVER draw one of its own children.
    *   **Distinct Recipients**: A Household will never draw the same child twice.
    *   *Note on Siblings*: Since the *Household* is the giver, the rule "Siblings cannot draw each other" is automatically satisfied because the Household (Parents) manages the buying. They simply won't be assigned their own kids.

### Configuration
*   **Budget**: Fixed dollar amount per child.
*   **Items**: Fixed number of "Wrapped Packages" per child (to prevent one kid getting 10 small things vs 1 big thing).

---

## 2. Future Strategies (Planned)
*   **Secret Santa**: Traditional 1-to-1 matching where individuals draw names.
*   **White Elephant**: No pre-matching; assignment happens live during the event.
