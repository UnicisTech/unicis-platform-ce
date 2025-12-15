import { PrismaClient, Prisma } from '@prisma/client';
import { transformTaskProperties } from './taskPropertiesTransforms';

const prisma = new PrismaClient();

async function main() {
  const batchSize = 100;
  let cursorId: number | null = null;
  let updated = 0;

  while (true) {
    const tasks = await prisma.task.findMany({
      take: batchSize,
      ...(cursorId !== null
        ? {
            skip: 1,
            cursor: { id: cursorId },
          }
        : {}),
      orderBy: { id: 'asc' },
    });

    console.log('tasks length:', tasks.length);

    if (tasks.length === 0) break;

    const tx: Prisma.PrismaPromise<any>[] = [];

    for (const task of tasks) {
      const oldProps = task.properties as Prisma.JsonValue;
      const before = JSON.stringify(oldProps);
      const newProps = transformTaskProperties(oldProps);
      const after = JSON.stringify(newProps);

      const propsAreEqual = before === after;
      console.log(`task ${task.id}: propsAreEqual =`, propsAreEqual);

      if (propsAreEqual) continue;

      tx.push(
        prisma.task.update({
          where: { id: task.id },
          data: {
            properties: newProps,
          },
        })
      );

      updated++;
    }

    if (tx.length > 0) {
      await prisma.$transaction(tx);
      console.log(`Updated ${tx.length} tasks in this batch`);
    }

    // update a crusor — last id (number)
    cursorId = tasks[tasks.length - 1].id;
  }

  console.log(`Migration done. Total updated tasks: ${updated}`);
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
