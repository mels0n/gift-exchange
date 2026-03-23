import { CousinExchangeStrategy } from './cousin-exchange';
// Mock Types
const createHousehold = (id: string, numKids: number) => ({
    id,
    name: `House ${id}`,
    emails: '[]',
    createdAt: new Date(),
    updatedAt: new Date(),
    kids: Array.from({ length: numKids }).map((_, i) => ({
        id: `k-${id}-${i}`,
        name: `Kid ${id}-${i}`,
        dob: null,
        householdId: id
    }))
});

// Simple Runner (run with ts-node)
function runTest() {
    const strategy = new CousinExchangeStrategy();

    // Scenario: 3 Families
    // A: 2 Kids
    // B: 2 Kids
    // C: 1 Kid
    // Total: 5 gifts needed.
    // A gives 2, B gives 2, C gives 1.

    const households = [
        createHousehold('A', 2),
        createHousehold('B', 2),
        createHousehold('C', 1),
    ];

    try {
        const matches = strategy.match(households);
        console.log('Matches:', matches);

        // Validation
        matches.forEach(m => {
            // 1. Not own kid
            const kidHouse = m.recipientKidId.split('-')[1]; // k-A-0 -> A
            if (m.giverHouseId === kidHouse) throw new Error(`Self-match detected: ${m.giverHouseId} -> ${m.recipientKidId}`);
        });

        console.log('✅ Test Passed');
    } catch (e) {
        console.error('❌ Test Failed:', e);
    }
}

runTest();
