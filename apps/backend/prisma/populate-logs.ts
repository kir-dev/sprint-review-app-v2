import { Difficulty, LogCategory, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting log population...');

  // 1. Get current work period
  const now = new Date();
  const currentPeriod = await prisma.workPeriod.findFirst({
    where: {
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });

  if (!currentPeriod) {
    console.error('❌ No current work period found. Please ensure one exists.');
    process.exit(1);
  }

  // 2. Get all users
  const users = await prisma.user.findMany();
  if (users.length === 0) {
     console.error('❌ No users found.');
     process.exit(1);
  }

  // 3. Get all projects and events
  const projects = await prisma.project.findMany();
  const events = await prisma.event.findMany();
  
  // 4. Generate random logs for each user
  const categories = Object.values(LogCategory);
  const difficulties = Object.values(Difficulty);

  for (const user of users) {
    console.log(`👤 Generating logs for ${user.fullName}...`);
    
    // Generate 15-30 random logs for each user
    const logCount = Math.floor(Math.random() * 16) + 15; 

    for (let i = 0; i < logCount; i++) {
        const isEventLog = Math.random() > 0.8; // 20% chance for event log
        let randomProject: any = null;
        let randomEvent: any = null;
        let randomCategory = categories[Math.floor(Math.random() * categories.length)];

        if (isEventLog && events.length > 0) {
            randomEvent = events[Math.floor(Math.random() * events.length)];
            randomCategory = LogCategory.EVENT; // Ensure category matches
        } else {
            randomProject = projects.length > 0 ? projects[Math.floor(Math.random() * projects.length)] : null;
            if (randomCategory === LogCategory.EVENT) {
                // If randomly picked EVENT but not an event log, pick another category or just keep it (maybe general event?)
                // Let's force it to be something else if we are not linking an event
                 randomCategory = LogCategory.PROJECT;
            }
        }
        
        const randomDifficulty = Math.random() > 0.5 ? difficulties[Math.floor(Math.random() * difficulties.length)] : null;
        const randomHours = Math.floor(Math.random() * 4) + 1; // 1-4 hours
        
        // Random date within the last 30 days
        const randomDate = new Date();
        randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));

        await prisma.log.create({
            data: {
                userId: user.id,
                workPeriodId: currentPeriod.id,
                projectId: randomProject?.id,
                eventId: randomEvent?.id,
                category: randomCategory,
                description: `Generated log for ${randomCategory} ${randomEvent ? `at ${randomEvent.name}` : ''} - ${i + 1}`,
                timeSpent: randomHours,
                date: randomDate,
                difficulty: randomDifficulty,
            }
        });
    }
  }

  console.log('✅ Log population complete!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
