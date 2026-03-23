import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    const household = await prisma.household.upsert({
        where: { id: 'seed-household-griswold' },
        update: {},
        create: {
            id: 'seed-household-griswold',
            name: 'The Griswolds',
            emails: JSON.stringify(['clark@christmas.com', 'ellen@christmas.com', 'admin@example.com']),
            kids: {
                create: [
                    { name: 'Audrey', dob: new Date('1970-01-01') },
                    { name: 'Rusty', dob: new Date('1968-01-01') },
                ],
            },
        },
    });

    console.log(`✅ Seeded household: ${household.name} (IDs: clark@christmas.com, admin@example.com)`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
