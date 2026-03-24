# Registration Slice Architecture 🏠

The Registration slice (found in `src/features/register-household`) manages the lifecycle of a household, its members (kids), and its participation in specific exchange events.

## 👨‍👩‍👧‍👦 Data Model

The slice interacts with three primary entities:

1. **Household**: The top-level container.
    - **Emails**: Stored as a JSON string array. This allows multiple parents/guardians to manage the same household and receive notifications.
    - **Deduplication**: When registering or updating, emails are trimmed and de-duped via standard JS `filter`.
2. **Kid**: Individual participants within a household.
    - Linked to a `Household` via `householdId`.
    - Stores `name` and optional `dob` (Date of Birth) for age-based matching logic (if implemented in the future).
3. **Participation**: A junction table linking a `Household` to an `Event`.
    - **Selection**: Households don't just "join" an event; they select which specific kids are participating this year.
    - **Persistence**: Participating kid IDs are stored as a JSON string array within the participation record.

## 🔄 Key Workflows

### 1. Household Creation (`registerHousehold`)
- **Session Requirement**: Requires a valid session email.
- **Invite Integration**: If the user has a pending invite (stored in a cookie), the system automatically accepts the invite and creates a `Participation` record for the new household.
- **Confirmation**: Enqueues `SEND_JOIN_CONFIRMATION` jobs for all household emails.

### 2. Joining an Event (`joinEvent`)
- **Deadline Validation**: Ensures the current date is before the event's `regDeadline`.
- **Status Check**: Only allows joining if the event is in `OPEN` status.
- **Member Selection**: Validates that all selected `kidIds` actually belong to the user's household before creating the participation record.

### 3. Member Management
- **Add/Remove Kid**: Atomic operations on the `Kid` table. Removing a kid deletes them from the system (cascading deletes for simplicity in family contexts).
- **Email Updates**: Allows adding or removing secondary emails while ensuring the primary session email is always preserved in the list.

## 📑 Implementation Details

- **Server Actions**: All logic is encapsulated in Next.js Server Actions for tight integration with the UI and automatic CSRF protection.
- **Relational Integrity**: Uses Prisma to maintain strong consistency between households and their members.
