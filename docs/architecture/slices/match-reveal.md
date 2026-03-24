# Match Reveal Slice Architecture 🎁

The Match Reveal slice is responsible for securely displaying match assignments to the giver household once the exchange has been locked and matched.

## 👁️ Reveal Mechanism

The logic is built into a "Reveal Card" component (`src/features/match-reveal/ui/RevealCard.tsx`) which is integrated into the dashboard.

### 🧩 Retrieval Flow
1. **Household Lookup**: The system identifies the current user's household using the identity cookie.
2. **Participation Check**: Verifies the household participated in the given event.
3. **Match Retrieval**: Queries the `Match` table for all assignments where `giverHouseId` matches the current session.
4. **Data Shaping**: The results provide the giver household with the list of recipient kids' names and their associated household name (so they know where to deliver/mail).

## 🎨 UI Presentation

The `RevealCard` component provides a premium "unboxing" experience:
- **Interactive States**: Uses modern animations to hide the names until the user clicks an "Unwrap" or "Reveal" button.
- **Glassmorphism**: Follows the project's modern design system with semi-transparent backgrounds and sleek typography.
- **Printable Overlays**: (Optional) In some versions, it provides a print-friendly view for the household to take shopping.

## 🔒 Security & Privacy

- **One-Way Reveal**: Users can only see who they are giving to, never who is giving to them.
- **Event Locking**: The reveal is only accessible once the admin has locked the event and triggered the matching algorithm.
- **Zod Validation**: All API routes and server actions involved in the reveal ensure strict data shaping.

## 📂 File Structure
- `ui/RevealCard.tsx`: The primary interactive component.
- `api/actions.ts`: Fetching match data using household identity.
