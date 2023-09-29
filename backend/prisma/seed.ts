import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function main() {
  const alice = await prisma.user.create({
    data: {
      username: 'alice',
      nickname: 'alice22',
      password:
        'f9b0534fc92b1b043f0338c62c2fabb4$492d07b962bcdc2e45e445da8dcd51acf619ec23099895d1f608d3777777fe653741e8463a939dec1b5245fd44f7ceb7538e6c6c57d504d7aed09e381fec59cd'
    }
  });

  const bob = await prisma.user.create({
    data: {
      username: 'bob',
      nickname: 'bob23',
      password:
        'f9b0534fc92b1b043f0338c62c2fabb4$492d07b962bcdc2e45e445da8dcd51acf619ec23099895d1f608d3777777fe653741e8463a939dec1b5245fd44f7ceb7538e6c6c57d504d7aed09e381fec59cd'
    }
  });

  console.log({ alice, bob });
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