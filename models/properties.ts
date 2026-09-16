import type { Prisma } from '@/generated/client';
import { runSerializableTransaction } from '@/lib/prisma-transaction';

type PropertiesMutation = (
  properties: Prisma.JsonValue
) => Prisma.InputJsonValue;

export const updateTaskPropertiesBySlugAndNumber = async ({
  slug,
  taskNumber,
  mutate,
}: {
  slug: string;
  taskNumber: number;
  mutate: PropertiesMutation;
}) =>
  runSerializableTransaction(async (tx) => {
    const task = await tx.task.findFirst({
      where: {
        taskNumber,
        team: { slug },
      },
      select: {
        id: true,
        properties: true,
      },
    });

    if (!task) {
      return null;
    }

    return tx.task.update({
      where: { id: task.id },
      data: { properties: mutate(task.properties) },
    });
  });

export const updateTaskPropertiesById = async ({
  taskId,
  mutate,
}: {
  taskId: number;
  mutate: PropertiesMutation;
}) =>
  runSerializableTransaction(async (tx) => {
    const task = await tx.task.findUnique({
      where: { id: taskId },
      select: { properties: true },
    });

    if (!task) {
      return null;
    }

    return tx.task.update({
      where: { id: taskId },
      data: { properties: mutate(task.properties) },
    });
  });

type TeamPropertiesMutation<Result> = (properties: Prisma.JsonValue) => {
  properties?: Prisma.InputJsonValue;
  result: Result;
};

export const updateTeamPropertiesBySlug = async <Result>({
  slug,
  mutate,
}: {
  slug: string;
  mutate: TeamPropertiesMutation<Result>;
}): Promise<Result> =>
  runSerializableTransaction(async (tx) => {
    const team = await tx.team.findUniqueOrThrow({
      where: { slug },
      select: { properties: true },
    });
    const mutation = mutate(team.properties);

    if (mutation.properties) {
      await tx.team.update({
        where: { slug },
        data: { properties: mutation.properties },
      });
    }

    return mutation.result;
  });
