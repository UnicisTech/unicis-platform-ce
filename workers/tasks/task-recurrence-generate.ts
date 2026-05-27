import type { Task } from 'graphile-worker';

import { Prisma } from '@/generated/client';
import { TaskRecurrenceStatus } from '@/generated/enums';
import { prisma } from '@/lib/prisma';
import { getNextRecurrenceRunAt } from '@/lib/tasks/recurrence';
import { publishTaskCreated } from '@/lib/tasks/task-events';
import { createTaskInTransaction } from 'models/task';

const MAX_RECURRENCES_PER_RUN = 100;

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === 'P2002';

const generateOccurrence = async ({
  now,
  recurrence,
}: {
  now: Date;
  recurrence: Awaited<ReturnType<typeof getDueTaskRecurrences>>[number];
}) => {
  const occurrenceDate = recurrence.nextRunAt;

  if (occurrenceDate > now) {
    return;
  }

  const nextRunAt = getNextRecurrenceRunAt({
    startAt: recurrence.startAt,
    currentRunAt: occurrenceDate,
    unit: recurrence.unit,
    interval: recurrence.interval,
  });

  try {
    const task = await prisma.$transaction(async (tx) => {
      const currentRecurrence = await tx.taskRecurrence.findFirst({
        where: {
          id: recurrence.id,
          status: TaskRecurrenceStatus.ACTIVE,
          nextRunAt: occurrenceDate,
        },
        select: {
          id: true,
        },
      });

      if (!currentRecurrence) {
        return null;
      }

      const createdTask = await createTaskInTransaction(tx, {
        authorId: recurrence.authorId,
        teamId: recurrence.teamId,
        title: recurrence.title,
        status: recurrence.taskStatus,
        priority: recurrence.priority,
        duedate: null,
        description: recurrence.description,
        properties: {},
        recurrenceScheduleId: recurrence.id,
        recurrenceOccurrenceDate: occurrenceDate,
      });

      await tx.taskRecurrence.update({
        where: {
          id: recurrence.id,
        },
        data: {
          nextRunAt,
        },
      });

      return createdTask;
    });

    if (!task) {
      return;
    }

    await publishTaskCreated({
      actorName: recurrence.author.name,
      task,
      teamId: recurrence.teamId,
      teamSlug: recurrence.team.slug,
    });
  } catch (error) {
    if (!isUniqueViolation(error)) {
      throw error;
    }

    await prisma.taskRecurrence.updateMany({
      where: {
        id: recurrence.id,
        status: TaskRecurrenceStatus.ACTIVE,
        nextRunAt: occurrenceDate,
      },
      data: {
        nextRunAt,
      },
    });
  }
};

const getDueTaskRecurrences = async (now: Date) =>
  await prisma.taskRecurrence.findMany({
    where: {
      status: TaskRecurrenceStatus.ACTIVE,
      nextRunAt: {
        lte: now,
      },
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
      team: {
        select: {
          slug: true,
        },
      },
    },
    orderBy: {
      nextRunAt: 'asc',
    },
    take: MAX_RECURRENCES_PER_RUN,
  });

export const taskRecurrenceGenerate: Task = async () => {
  const now = new Date();
  const recurrences = await getDueTaskRecurrences(now);

  for (const recurrence of recurrences) {
    await generateOccurrence({
      now,
      recurrence,
    });
  }
};
