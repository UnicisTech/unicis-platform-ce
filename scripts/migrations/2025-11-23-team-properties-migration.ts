import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from '../../prisma/generated/client';
import { transformTeamProperties } from './teamPropertiesTransforms';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const batchSize = 50;
  let cursor: string | null = null;
  let updated = 0;
  let hasMore = true;

  while (hasMore) {
    const teams = await prisma.team.findMany({
      take: batchSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
    });

    if (teams.length === 0) {
      hasMore = false;
      continue;
    }

    const tx: Prisma.PrismaPromise<any>[] = [];

    for (const team of teams) {
      const oldProps = team.properties as Prisma.JsonValue;

      const before = JSON.stringify(oldProps);
      const newProps = transformTeamProperties(oldProps);
      const after = JSON.stringify(newProps);

      const propsAreEqual = before === after;
      console.log(`team ${team.id}: propsAreEqual =`, propsAreEqual);

      if (propsAreEqual) continue;

      tx.push(
        prisma.team.update({
          where: { id: team.id },
          data: {
            properties: newProps,
          },
        })
      );

      updated++;
    }

    if (tx.length > 0) {
      await prisma.$transaction(tx);
      console.log(`Updated ${tx.length} teams in this batch`);
    }

    cursor = teams[teams.length - 1].id;
  }

  console.log(`Migration done. Total updated teams: ${updated}`);
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
