import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.achievement.createMany({
    data: [
      {
        title: 'Noob',
        icon: 'path_to_icon_1',
        description: 'Play 1 game',
      },
      {
        title: 'First blood',
        icon: 'path_to_icon_2',
        description: 'Win 1 game',
      },
      {
        title: 'Little by little',
        icon: 'path_to_icon_2',
        description: 'Win 3 games',
      },
      {
        title: 'Learning the hard way',
        icon: 'path_to_icon_2',
        description: 'Lose 1 game',
      },
      {
        title: 'Bad day',
        icon: 'path_to_icon_2',
        description: 'Lose 3 games',
      },
      {
        title: 'Dedication',
        icon: 'path_to_icon_2',
        description: 'Play 10 games',
      },
      {
        title: 'Psycho',
        icon: 'path_to_icon_2',
        description: 'Play 100 games',
      },
    ],
  });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
