import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const year = new Date().getFullYear();

  const periods = [
    {
      name: `${year} I. félév`,
      startDate: new Date(`${year}-01-01`),
      endDate: new Date(`${year}-05-31`),
    },
    {
      name: `${year} II. félév`,
      startDate: new Date(`${year}-06-01`),
      endDate: new Date(`${year}-12-31`),
    },
  ];

  for (const p of periods) {
    const existing = await prisma.workPeriod.findFirst({
      where: { name: p.name },
    });

    if (!existing) {
      await prisma.workPeriod.create({ data: p });
      console.log(`✅ Created: ${p.name}`);
    } else {
      console.log(`⚠️ Already exists: ${p.name}`);
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
