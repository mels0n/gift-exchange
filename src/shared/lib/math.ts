export function calculateBurden(
    numKidsAssigned: number,
    config: { budget: number; items: number }
) {
    return {
        totalBudget: numKidsAssigned * config.budget,
        totalItems: numKidsAssigned * config.items,
    };
}

export function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}
