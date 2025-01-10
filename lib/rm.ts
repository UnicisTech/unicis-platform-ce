import { prisma } from '@/lib/prisma';
import type { Task } from '@prisma/client';
import type { Session } from 'next-auth';
import type { RMProcedureInterface, TaskProperties } from "types";

export const saveRisk = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  prevRisk: RMProcedureInterface | [];
  nextRisk: RMProcedureInterface | [];
}) => {
  const { user, taskNumber, slug, prevRisk, nextRisk } = params;
  const task = await prisma.task.findFirst({
    where: {
      taskNumber,
      team: {
        slug,
      },
    },
  });

  if (!task) {
    return null;
  }

  const taskId = task.id;
  const taskProperties = task?.properties as TaskProperties;
  taskProperties.rm_risk = nextRisk;

  const updatedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      properties: {
        ...taskProperties,
      },
    },
  });

  // await addAuditLogs({
  //   taskId,
  //   taskProperties,
  //   user,
  //   prevProcedure,
  //   nextProcedure,
  // });

  return updatedTask;
};

export const deleteRisk = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  prevRisk: RMProcedureInterface | [];
  nextRisk: RMProcedureInterface | [];
}) => {
  const { taskNumber, slug, user, prevRisk, nextRisk } = params;
  const task = await prisma.task.findFirst({
    where: {
      taskNumber,
      team: {
        slug,
      },
    },
  });

  if (!task) {
    return null;
  }

  const taskId = task.id;
  const taskProperties = task?.properties as TaskProperties;
  delete taskProperties.rm_risk;

  const updatedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      properties: {
        ...taskProperties,
      },
    },
  });

  // await addAuditLogs({
  //   taskId,
  //   taskProperties,
  //   user,
  //   prevProcedure,
  //   nextProcedure,
  // });

  return updatedTask;
};

const transformToRange = (value: number): number => {
  return Math.floor(value / 20);
}

export const calculateRiskRating = (probability: number, impact: number) => {
  const result = (probability / 100) * (impact / 100);
  return Math.floor(result * 100);
}

export const calculateCurrentRiskRating = (rawRiskRating: number, targetRiskRating: number, treatmentStatus: number) => {
  const decimalTreatmentStatus = treatmentStatus / 100 // 50% -> 0.5
  const result = rawRiskRating - (decimalTreatmentStatus * (rawRiskRating - targetRiskRating))
  return Math.floor(result)
}

export const computeRiskMap = (tasks: Task[]): Map<string, number> | null => {
  if (!tasks) return null;

  const riskMap = new Map<string, number>();

  tasks
    .filter(task => (task.properties as TaskProperties)?.rm_risk)
    .map(task => (task.properties as TaskProperties)?.rm_risk)
    .forEach((risk) => {
      const security = risk?.[1]?.["TreatedImpact"] as number;
      const probability = risk?.[1]?.["TreatedProbability"] as number;

      if (!security || !probability) return;

      const x = transformToRange(security);
      const y = transformToRange(probability);

      const key = `${x},${y}`;

      riskMap.set(key, (riskMap.get(key) || 0) + 1);
    });

  return riskMap;
};

export const calculateRiskDistribution = (tasks: Task[]): number[] => {
  const riskCounts = [0, 0, 0, 0, 0];

  tasks.forEach((task) => {
      const risk = (task.properties as TaskProperties).rm_risk as RMProcedureInterface | undefined;
      if (!risk) {
          return
      }
      const rawRiskRating = calculateRiskRating(risk[0].RawProbability, risk[0].RawImpact)
      const targetRiskRating = calculateRiskRating(risk[1].TreatedProbability, risk[1].TreatedImpact)
      const currentRiskRating = calculateCurrentRiskRating(rawRiskRating, targetRiskRating, risk[1].TreatmentStatus)


      if (currentRiskRating >= 0 && currentRiskRating < 20) {
          riskCounts[0] += 1; // 0-20%
      } else if (currentRiskRating >= 20 && currentRiskRating < 40) {
          riskCounts[1] += 1; // 20-40%
      } else if (currentRiskRating >= 40 && currentRiskRating < 60) {
          riskCounts[2] += 1; // 40-60%
      } else if (currentRiskRating >= 60 && currentRiskRating < 80) {
          riskCounts[3] += 1; // 60-80%
      } else if (currentRiskRating >= 80 && currentRiskRating <= 100) {
          riskCounts[4] += 1; // 80-100%
      }
  });

  return riskCounts;
}

export const getGradientColor = (value: number): string => {
  // Ensure value is between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));

  // Interpolate between green (0, 255, 0) and red (255, 0, 0)
  const red = Math.floor((clampedValue / 100) * 255);
  const green = 255 - red;

  return `rgb(${red}, ${green}, 0)`;
};

export const getInitials = (name: string) => {
  const words = name.trim().split(" ");

  const initials = words
      .filter(word => word.length > 0)
      .map(word => word[0].toUpperCase())
      .join("");

  return initials;
}