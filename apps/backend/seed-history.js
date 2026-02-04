
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'peter.liptak@simonyi.bme.hu'; // Try to find the user by email or just pick first
    // Or fetch all users and let me pick? 
    // Let's just pick the first user for simplicity or specific ID if I knew it.
    // The user probably logged in with "user" or "admin" or similar during dev.
    // I will just find *a* user.

    const user = await prisma.user.findFirst();

    if (!user) {
        console.log('No user found to seed history for.');
        return;
    }

    console.log(`Seeding history for user: ${user.fullName} (${user.id})`);

    // Clear existing history for clean state?
    await prisma.positionHistory.deleteMany({ where: { userId: user.id } });

    // Add history
    await prisma.positionHistory.createMany({
        data: [
            {
                userId: user.id,
                position: 'UJONC',
                startDate: new Date('2023-09-01'),
                endDate: new Date('2024-02-01'),
            },
            {
                userId: user.id,
                position: 'TAG',
                startDate: new Date('2024-02-01'),
                endDate: null, // Current
            }
        ]
    });

    console.log('Seed completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
